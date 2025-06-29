import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Parse request body
    const { service_id, appointment_datetime } = await req.json()

    if (!service_id || !appointment_datetime) {
      throw new Error('Missing required fields')
    }

    // Get service details
    const { data: service, error: serviceError } = await supabaseClient
      .from('therapist_services')
      .select(`
        *,
        therapist_profiles!inner (
          stripe_account_id,
          user_id
        )
      `)
      .eq('id', service_id)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      throw new Error('Service not found or inactive')
    }

    const stripeAccountId = service.therapist_profiles.stripe_account_id
    if (!stripeAccountId) {
      throw new Error('Therapist has not set up Stripe Connect')
    }

    // Check if user has free session credit for one-time services
    if (service.type === 'one_time') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('free_session_credit')
        .eq('id', user.id)
        .single()

      if (profile?.free_session_credit) {
        // Use free session credit instead of payment
        return new Response(
          JSON.stringify({
            success: true,
            free_session: true,
            client_secret: null
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Calculate amount (service price_amount is in dollars, Stripe needs cents)
    const amount = Math.round(service.price_amount * 100)

    // Calculate application fee (platform fee - 5%)
    const applicationFeeAmount = Math.round(amount * 0.05)

    // Create payment intent
    const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: 'usd',
        'transfer_data[destination]': stripeAccountId,
        application_fee_amount: applicationFeeAmount.toString(),
        'metadata[service_id]': service_id,
        'metadata[user_id]': user.id,
        'metadata[appointment_datetime]': appointment_datetime,
        'automatic_payment_methods[enabled]': 'true',
      }),
    })

    if (!paymentIntentResponse.ok) {
      const errorText = await paymentIntentResponse.text()
      throw new Error(`Failed to create payment intent: ${errorText}`)
    }

    const paymentIntentData = await paymentIntentResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: paymentIntentData.client_secret,
        payment_intent_id: paymentIntentData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-payment-intent:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create payment intent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})