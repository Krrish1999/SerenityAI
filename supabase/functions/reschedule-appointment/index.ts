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
    const { appointment_id, new_date_time, reason } = await req.json()

    if (!appointment_id || !new_date_time) {
      throw new Error('Missing required fields')
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        therapist_service:therapist_service_id (
          price_amount
        ),
        therapist_profiles:therapist_id (
          cancellation_fee_percentage
        )
      `)
      .eq('id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found')
    }

    // Verify user owns the appointment
    if (appointment.client_id !== user.id && 
        !await isTherapistForAppointment(supabaseClient, user.id, appointment.therapist_id)) {
      throw new Error('You do not have permission to reschedule this appointment')
    }

    // Check if appointment is in the past
    if (new Date(appointment.date_time) < new Date()) {
      throw new Error('Cannot reschedule past appointments')
    }

    // Check if appointment is within 24 hours
    const hoursUntilAppointment = (new Date(appointment.date_time).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    const isWithin24Hours = hoursUntilAppointment <= 24
    
    // Check if cancellation fee applies (for patient-initiated reschedules)
    let cancellationFee = 0
    if (isWithin24Hours && appointment.client_id === user.id) {
      const feePercentage = appointment.therapist_profiles?.cancellation_fee_percentage || 50
      cancellationFee = appointment.therapist_service?.price_amount * (feePercentage / 100)
    }

    // Create a new appointment with the new date/time
    const { data: newAppointment, error: newAppointmentError } = await supabaseClient
      .from('appointments')
      .insert({
        therapist_id: appointment.therapist_id,
        client_id: appointment.client_id,
        therapist_service_id: appointment.therapist_service_id,
        date_time: new_date_time,
        status: 'scheduled',
        payment_status: appointment.payment_status,
        stripe_payment_intent_id: appointment.stripe_payment_intent_id,
        stripe_subscription_id: appointment.stripe_subscription_id,
        notes: reason ? `Rescheduled: ${reason}` : 'Rescheduled appointment',
        rescheduled_from: appointment.date_time
      })
      .select()
      .single()

    if (newAppointmentError) {
      throw new Error(`Failed to create new appointment: ${newAppointmentError.message}`)
    }

    // Update the original appointment to cancelled
    const { error: updateError } = await supabaseClient
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: `Rescheduled to ${new Date(new_date_time).toLocaleString()}`
      })
      .eq('id', appointment_id)

    if (updateError) {
      throw new Error(`Failed to update original appointment: ${updateError.message}`)
    }

    // If a cancellation fee applies, process it
    if (cancellationFee > 0) {
      // In a real implementation, you would process the fee through Stripe
      console.log(`Cancellation fee of $${cancellationFee} would be charged`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_appointment_id: newAppointment.id,
        cancellation_fee: cancellationFee,
        message: 'Appointment rescheduled successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in reschedule-appointment:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to reschedule appointment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to check if user is the therapist for an appointment
async function isTherapistForAppointment(supabase: any, userId: string, therapistProfileId: string): Promise<boolean> {
  const { data } = await supabase
    .from('therapist_profiles')
    .select('user_id')
    .eq('id', therapistProfileId)
    .eq('user_id', userId)
    .single()

  return !!data
}