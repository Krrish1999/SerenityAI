import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[TwiML] Generating TwiML response')
    
    // Get the host for the WebSocket URL
    const host = req.headers.get('host') || 'localhost:54321'
    const protocol = host.includes('localhost') ? 'ws' : 'wss'
    const wsUrl = `${protocol}://${host}/functions/v1/media-stream`
    
    console.log('[TwiML] WebSocket URL:', wsUrl)

    // Verify ElevenLabs configuration
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID')

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
      console.error('[TwiML] Missing ElevenLabs configuration')
      
      // Return error TwiML
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, the AI coaching service is currently unavailable. Please try again later or contact support.</Say>
    <Hangup/>
</Response>`

      return new Response(errorTwiml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/xml',
        },
        status: 200,
      })
    }

    // Test ElevenLabs API connectivity
    try {
      const testResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      )

      if (!testResponse.ok) {
        throw new Error(`ElevenLabs API test failed: ${testResponse.status}`)
      }
      
      console.log('[TwiML] ElevenLabs API test successful')
    } catch (error) {
      console.error('[TwiML] ElevenLabs API test failed:', error)
      
      // Return error TwiML
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, there's an issue connecting to your mindfulness coach. Please try again in a few moments.</Say>
    <Hangup/>
</Response>`

      return new Response(errorTwiml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/xml',
        },
        status: 200,
      })
    }

    // Default prompt and first message for the AI coach
    const prompt = `You are Shiv, a compassionate mindfulness coach specializing in stress reduction, relaxation, and emotional balance. Your approach is gentle, reassuring, and attentive, helping users cultivate mindful awareness through your guidance. You're naturally warm and curious, guiding individuals to find calm and clarity through focused breathing, visualization, and present-moment practices. Keep responses concise and conversational, typically three sentences or fewer. Use a soft, centered, and inviting tone with gentle pauses. Always be supportive and never judgmental.`
    
    const firstMessage = `Hello! I'm Shiv, your mindfulness coach. I'm here to help you find some calm and clarity in your day. How are you feeling right now?`

    // Generate TwiML response that connects to our WebSocket
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${wsUrl}">
            <Parameter name="prompt" value="${prompt.replace(/"/g, '&quot;')}" />
            <Parameter name="first_message" value="${firstMessage.replace(/"/g, '&quot;')}" />
        </Stream>
    </Connect>
</Response>`

    console.log('[TwiML] Generated TwiML successfully')

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
      status: 200,
    })

  } catch (error) {
    console.error('[TwiML] Error generating TwiML:', error)
    
    // Return a simple TwiML response that says there was an error
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, there was an unexpected error. Please try calling again or contact support if the problem persists.</Say>
    <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
      status: 200,
    })
  }
})