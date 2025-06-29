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
    const { service_id } = await req.json()

    if (!service_id) {
      throw new Error('Service ID is required')
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

    if (service.type !== 'subscription') {
      throw new Error('Service is not a subscription')
    }

    const stripeAccountId = service.therapist_profiles.stripe_account_id
    if (!stripeAccountId) {
      throw new Error('Therapist has not set up Stripe Connect')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Get or create Stripe customer
    let customerId: string

    // Check if user already has a customer ID
    const { data: existingCustomers } = await supabaseClient
      .from('patient_subscriptions')
      .select('stripe_customer_id')
      .eq('patient_id', user.id)
      .limit(1)

    if (existingCustomers && existingCustomers.length > 0 && existingCustomers[0].stripe_customer_id) {
      customerId = existingCustomers[0].stripe_customer_id
    } else {
      // Create a new customer
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email || '',
          name: user.user_metadata?.full_name || '',
          'metadata[user_id]': user.id,
        }),
      })

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text()
        throw new Error(`Failed to create customer: ${errorText}`)
      }

      const customerData = await customerResponse.json()
      customerId = customerData.id
    }

    // Create a checkout session
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        payment_method_types: 'card',
        line_items: JSON.stringify([{
          price: service.stripe_price_id,
          quantity: 1,
        }]),
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/subscriptions?success=true`,
        cancel_url: `${req.headers.get('origin')}/therapists/${service.therapist_profile_id}?canceled=true`,
        'subscription_data[metadata][service_id]': service_id,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][therapist_id]': service.therapist_profile_id,
        'subscription_data[application_fee_percent]': '5', // 5% platform fee
        'subscription_data[transfer_data][destination]': stripeAccountId,
      }),
    })

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text()
      throw new Error(`Failed to create checkout session: ${errorText}`)
    }

    const checkoutData = await checkoutResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        checkout_session_id: checkoutData.id,
        checkout_url: checkoutData.url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-subscription:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create subscription'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})