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
    const { subscription_id, reason } = await req.json()

    if (!subscription_id) {
      throw new Error('Subscription ID is required')
    }

    // Verify subscription ownership
    const { data: subscription, error: subError } = await supabaseClient
      .from('patient_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription_id)
      .eq('patient_id', user.id)
      .single()

    if (subError || !subscription) {
      throw new Error('Subscription not found or you do not have permission to cancel it')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Cancel subscription in Stripe (at end of current period)
    const cancelResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        cancel_at_period_end: 'true',
        'metadata[cancellation_reason]': reason || 'User requested cancellation',
        'metadata[canceled_by]': user.id,
      }),
    })

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text()
      throw new Error(`Failed to cancel subscription: ${errorText}`)
    }

    const cancelData = await cancelResponse.json()

    // Update subscription status in database
    const { error: updateError } = await supabaseClient
      .from('patient_subscriptions')
      .update({
        status: cancelData.cancel_at_period_end ? 'canceled' : cancelData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription_id,
        canceled_at_period_end: cancelData.cancel_at_period_end,
        current_period_end: cancelData.current_period_end
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in cancel-subscription:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to cancel subscription'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})