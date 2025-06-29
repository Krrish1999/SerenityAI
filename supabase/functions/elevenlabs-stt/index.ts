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

    // Get ElevenLabs credentials
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Parse the request to get the audio data
    const formData = await req.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error('Audio file is required')
    }

    // Convert audio data to ElevenLabs-compatible format
    const arrayBuffer = await audioFile.arrayBuffer()
    
    // Create FormData with required parameters for ElevenLabs API
    const elevenlabsFormData = new FormData()
    elevenlabsFormData.append('file', audioFile)
    elevenlabsFormData.append('model_id', 'scribe_v1')

    // Call ElevenLabs API for speech-to-text
    const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: elevenlabsFormData,
    })

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text()
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    const transcriptionData = await elevenlabsResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        text: transcriptionData.text,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in elevenlabs-stt:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to transcribe audio'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})