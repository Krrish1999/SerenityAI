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

    // Parse the request body
    const { text } = await req.json()
    if (!text) {
      throw new Error('Text is required')
    }

    // Use a consistent voice ID for the AI assistant
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM" // Rachel voice - You can choose another voice ID

    // Call ElevenLabs API for text-to-speech
    const elevenlabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
    })

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text()
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    // Get the audio data and upload it to Supabase Storage
    const audioBuffer = await elevenlabsResponse.arrayBuffer()
    const fileName = `ai-reply-${Date.now()}.mp3`
    const filePath = `audio/${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('ai-responses')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('ai-responses')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({
        success: true,
        audio_url: publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in elevenlabs-tts:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate speech'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})