import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if this is a WebSocket upgrade request
    if (req.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 })
    }

    // Get ElevenLabs credentials
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_AGENT_ID')

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
      console.error('[Config] Missing ElevenLabs configuration')
      throw new Error('ElevenLabs configuration missing')
    }

    console.log('[Config] ElevenLabs Agent ID:', ELEVENLABS_AGENT_ID)

    // Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req)

    // Variables to track the call
    let streamSid: string | null = null
    let callSid: string | null = null
    let elevenLabsWs: WebSocket | null = null
    let customParameters: any = null
    let isConnected = false

    // Get signed URL for ElevenLabs conversation
    const getSignedUrl = async () => {
      console.log('[ElevenLabs] Getting signed URL...')
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ElevenLabs] Failed to get signed URL:', response.status, errorText)
        throw new Error(`Failed to get signed URL: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('[ElevenLabs] Got signed URL successfully')
      return data.signed_url
    }

    // Set up ElevenLabs connection
    const setupElevenLabs = async () => {
      try {
        console.log('[ElevenLabs] Setting up connection...')
        const signedUrl = await getSignedUrl()
        
        elevenLabsWs = new WebSocket(signedUrl)

        elevenLabsWs.onopen = () => {
          console.log('[ElevenLabs] WebSocket connected successfully')
          isConnected = true

          // Send initial configuration
          const initialConfig = {
            type: 'conversation_initiation_client_data',
            conversation_config_override: {
              agent: {
                prompt: {
                  prompt: customParameters?.prompt || `You are Shiv, a compassionate mindfulness coach specializing in stress reduction, relaxation, and emotional balance. Your approach is gentle, reassuring, and attentive, helping users cultivate mindful awareness through your guidance. You're naturally warm and curious, guiding individuals to find calm and clarity through focused breathing, visualization, and present-moment practices. Keep responses concise and conversational, typically three sentences or fewer. Use a soft, centered, and inviting tone with gentle pauses.`
                },
                first_message: customParameters?.first_message || `Hello! I'm Shiv, your mindfulness coach. I'm here to help you find some calm and clarity in your day. How are you feeling right now?`
              }
            }
          }

          console.log('[ElevenLabs] Sending initial configuration')
          elevenLabsWs?.send(JSON.stringify(initialConfig))
        }

        elevenLabsWs.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)

            switch (message.type) {
              case 'conversation_initiation_metadata':
                console.log('[ElevenLabs] Conversation initiated successfully')
                break

              case 'audio':
                if (streamSid && socket.readyState === WebSocket.OPEN) {
                  // Handle different audio message formats
                  let audioPayload = null
                  
                  if (message.audio_event?.audio_base_64) {
                    audioPayload = message.audio_event.audio_base_64
                  } else if (message.audio?.chunk) {
                    audioPayload = message.audio.chunk
                  }

                  if (audioPayload) {
                    const audioData = {
                      event: 'media',
                      streamSid,
                      media: {
                        payload: audioPayload,
                      },
                    }
                    socket.send(JSON.stringify(audioData))
                  }
                }
                break

              case 'interruption':
                console.log('[ElevenLabs] Interruption detected')
                if (streamSid && socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    event: 'clear',
                    streamSid,
                  }))
                }
                break

              case 'ping':
                if (message.ping_event?.event_id) {
                  elevenLabsWs?.send(JSON.stringify({
                    type: 'pong',
                    event_id: message.ping_event.event_id,
                  }))
                }
                break

              case 'agent_response':
                if (message.agent_response_event?.agent_response) {
                  console.log(`[ElevenLabs] Agent: ${message.agent_response_event.agent_response}`)
                }
                break

              case 'user_transcript':
                if (message.user_transcription_event?.user_transcript) {
                  console.log(`[ElevenLabs] User: ${message.user_transcription_event.user_transcript}`)
                }
                break

              case 'error':
                console.error('[ElevenLabs] Error message:', message)
                break

              default:
                console.log(`[ElevenLabs] Message type: ${message.type}`)
            }
          } catch (error) {
            console.error('[ElevenLabs] Error processing message:', error)
          }
        }

        elevenLabsWs.onerror = (error) => {
          console.error('[ElevenLabs] WebSocket error:', error)
          isConnected = false
        }

        elevenLabsWs.onclose = (event) => {
          console.log(`[ElevenLabs] WebSocket closed: ${event.code} - ${event.reason}`)
          isConnected = false
        }

      } catch (error) {
        console.error('[ElevenLabs] Setup error:', error)
        isConnected = false
        
        // Send error back to Twilio to end the call gracefully
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            event: 'error',
            error: 'Failed to connect to AI agent'
          }))
        }
      }
    }

    // Handle messages from Twilio
    socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data)
        
        switch (msg.event) {
          case 'start':
            streamSid = msg.start.streamSid
            callSid = msg.start.callSid
            customParameters = msg.start.customParameters
            console.log(`[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}`)
            console.log('[Twilio] Custom parameters:', customParameters)
            
            // Set up ElevenLabs connection
            await setupElevenLabs()
            
            // Wait a moment for connection to establish
            setTimeout(() => {
              if (!isConnected) {
                console.error('[ElevenLabs] Failed to connect within timeout')
                socket.close()
              }
            }, 10000) // 10 second timeout
            break

          case 'media':
            if (elevenLabsWs?.readyState === WebSocket.OPEN && isConnected) {
              try {
                const audioMessage = {
                  user_audio_chunk: msg.media.payload,
                }
                elevenLabsWs.send(JSON.stringify(audioMessage))
              } catch (error) {
                console.error('[ElevenLabs] Error sending audio:', error)
              }
            } else if (!isConnected) {
              console.warn('[ElevenLabs] Not connected, dropping audio packet')
            }
            break

          case 'stop':
            console.log(`[Twilio] Stream ${streamSid} ended`)
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              elevenLabsWs.close()
            }
            break

          case 'mark':
            // Handle mark events (optional)
            break

          default:
            console.log(`[Twilio] Event: ${msg.event}`)
        }
      } catch (error) {
        console.error('[Twilio] Error processing message:', error)
      }
    }

    // Handle WebSocket events
    socket.onopen = () => {
      console.log('[Twilio] WebSocket connection opened')
    }

    socket.onclose = (event) => {
      console.log(`[Twilio] WebSocket closed: ${event.code} - ${event.reason}`)
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close()
      }
    }

    socket.onerror = (error) => {
      console.error('[Twilio] WebSocket error:', error)
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close()
      }
    }

    return response

  } catch (error) {
    console.error('[Setup] Error setting up media stream:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to set up media stream',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})