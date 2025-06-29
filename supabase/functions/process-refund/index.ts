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

    // Verify user is a therapist (only therapists can process refunds)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'therapist') {
      throw new Error('Only therapists can process refunds')
    }

    // Parse request body
    const { payment_intent_id, reason, amount } = await req.json()

    if (!payment_intent_id || !reason) {
      throw new Error('Missing required fields')
    }

    // Get appointment details to verify therapist ownership
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        therapist_profiles!inner (
          user_id
        )
      `)
      .eq('stripe_payment_intent_id', payment_intent_id)
      .single()

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found')
    }

    if (appointment.therapist_profiles.user_id !== user.id) {
      throw new Error('You can only refund your own appointments')
    }

    if (appointment.payment_status === 'refunded') {
      throw new Error('This payment has already been refunded')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Create refund in Stripe
    const refundParams = new URLSearchParams({
      payment_intent: payment_intent_id,
      reason: 'requested_by_customer',
      'metadata[refund_reason]': reason,
      'metadata[refunded_by]': user.id,
    })

    if (amount) {
      refundParams.append('amount', Math.round(amount * 100).toString())
    }

    const refundResponse = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: refundParams,
    })

    if (!refundResponse.ok) {
      const errorText = await refundResponse.text()
      throw new Error(`Failed to process refund: ${errorText}`)
    }

    const refundData = await refundResponse.json()

    // Update appointment status
    const { error: updateError } = await supabaseClient
      .from('appointments')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        notes: appointment.notes 
          ? `${appointment.notes}\n\nRefunded: ${reason}`
          : `Refunded: ${reason}`
      })
      .eq('id', appointment.id)

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      // Don't throw error here as refund was already processed
    }

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refundData.id,
        amount_refunded: refundData.amount / 100,
        status: refundData.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in process-refund:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process refund'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})