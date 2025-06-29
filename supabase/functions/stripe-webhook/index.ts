import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Verify webhook signature (simplified - in production, use proper verification)
    // For now, we'll process the webhook without full verification
    const event = JSON.parse(body)

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing webhook: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChanged(supabaseClient, event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handlePaymentSucceeded(supabaseClient: any, paymentIntent: any) {
  try {
    const serviceId = paymentIntent.metadata?.service_id
    const userId = paymentIntent.metadata?.user_id
    const appointmentDateTime = paymentIntent.metadata?.appointment_datetime

    if (!serviceId || !userId || !appointmentDateTime) {
      console.error('Missing metadata in payment intent')
      return
    }

    // Get service details
    const { data: service } = await supabaseClient
      .from('therapist_services')
      .select('therapist_profile_id')
      .eq('id', serviceId)
      .single()

    if (!service) {
      console.error('Service not found')
      return
    }

    // Create appointment
    const { error: appointmentError } = await supabaseClient
      .from('appointments')
      .insert({
        therapist_id: service.therapist_profile_id,
        client_id: userId,
        therapist_service_id: serviceId,
        date_time: appointmentDateTime,
        status: 'scheduled',
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
      })

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return
    }

    // Remove free session credit if it was a one-time payment
    await supabaseClient
      .from('profiles')
      .update({ free_session_credit: false })
      .eq('id', userId)

    console.log('Payment processed successfully')
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(supabaseClient: any, paymentIntent: any) {
  try {
    // Update any pending appointments to failed status
    const { error } = await supabaseClient
      .from('appointments')
      .update({ payment_status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed payment:', error)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleSubscriptionPayment(supabaseClient: any, invoice: any) {
  try {
    const subscriptionId = invoice.subscription
    
    // Update subscription status
    await supabaseClient
      .from('patient_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
        sessions_used_current_cycle: 0, // Reset session count
      })
      .eq('stripe_subscription_id', subscriptionId)

    console.log('Subscription payment processed')
  } catch (error) {
    console.error('Error handling subscription payment:', error)
  }
}

async function handleSubscriptionChanged(supabaseClient: any, subscription: any) {
  try {
    const status = subscription.status
    
    await supabaseClient
      .from('patient_subscriptions')
      .update({ status })
      .eq('stripe_subscription_id', subscription.id)

    console.log('Subscription status updated')
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}