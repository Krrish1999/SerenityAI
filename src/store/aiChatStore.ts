import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AIChatMessage, ChatHistoryEntry } from '../types';
import { useCrisisStore } from './crisisStore';

type AIChatState = {
  messages: AIChatMessage[];
  isLoading: boolean;
  error: string | null;
  consentGiven: boolean | null;
  voiceConsentGiven: boolean | null;
  lastMoodTag: string | null;
  init: () => void;
  setConsent: (consent: boolean) => void;
  setVoiceConsent: (consent: boolean) => void;
  sendMessage: (userId: string, messageContent: string | Blob) => Promise<void>;
  sendQuickReply: (userId: string, quickReplyText: string) => Promise<void>;
  fetchChatHistory: (userId: string) => Promise<void>;
  analyzeMessageMood: (messageText: string) => Promise<string>;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
  generateSpeech: (text: string) => Promise<string>;
  getLastUserMood: (userId: string) => Promise<string | null>;
  clearError: () => void;
  setLastMoodTag: (moodTag: string) => void;
};

const CONSENT_KEY = 'mindwell_ai_chat_consent';
const VOICE_CONSENT_KEY = 'mindwell_ai_voice_consent';

export const useAIChatStore = create<AIChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  consentGiven: null,
  voiceConsentGiven: null,
  lastMoodTag: null,

  init: () => {
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    const storedVoiceConsent = localStorage.getItem(VOICE_CONSENT_KEY);
    const consentGiven = storedConsent ? JSON.parse(storedConsent) : null;
    const voiceConsentGiven = storedVoiceConsent ? JSON.parse(storedVoiceConsent) : null;
    set({ consentGiven, voiceConsentGiven });
  },

  setConsent: (consent: boolean) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    set({ consentGiven: consent });
  },

  setVoiceConsent: (consent: boolean) => {
    localStorage.setItem(VOICE_CONSENT_KEY, JSON.stringify(consent));
    set({ voiceConsentGiven: consent });
  },

  setLastMoodTag: (moodTag: string) => {
    set({ lastMoodTag: moodTag });
  },

  clearError: () => set({ error: null }),

  fetchChatHistory: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Convert chat history to messages format
      const messages: AIChatMessage[] = [];
      data.forEach((entry: ChatHistoryEntry) => {
        messages.push({
          id: `${entry.id}-user`,
          sender: 'user',
          content: entry.message_text,
          created_at: entry.created_at,
          mood_tag: entry.mood_tag,
        });
        messages.push({
          id: `${entry.id}-ai`,
          sender: 'ai',
          content: entry.ai_reply_text,
          created_at: entry.created_at,
          mood_tag: entry.mood_tag,
          audioUrl: entry.audio_url,
        });
      });

      set({ messages });

      // Set last mood tag if available
      if (data.length > 0) {
        const lastEntry = data[data.length - 1];
        if (lastEntry.mood_tag) {
          set({ lastMoodTag: lastEntry.mood_tag });
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      set({ error: 'Failed to load chat history' });
    } finally {
      set({ isLoading: false });
    }
  },

  analyzeMessageMood: async (messageText: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Call analyze-mood Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Mood analysis failed: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `Mood analysis failed: ${errorData.error}`;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `Mood analysis failed: ${response.statusText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze mood');
      }

      return data.mood_tag;
    } catch (error) {
      console.error('Error analyzing mood:', error);
      // Return a neutral mood if analysis fails
      return 'neutral';
    }
  },

  transcribeAudio: async (audioBlob: Blob) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Create form data with audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Call elevenlabs-stt Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-stt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Transcription failed: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            // Check for specific ElevenLabs API restrictions
            if (errorData.error.includes('detected_unusual_activity') || 
                errorData.error.includes('Free Tier usage disabled')) {
              errorMessage = 'Voice transcription is temporarily unavailable due to ElevenLabs account restrictions. Please use text input instead, or contact support if you have a paid ElevenLabs plan.';
            } else if (errorData.error.includes('quota') || errorData.error.includes('limit')) {
              errorMessage = 'Voice transcription quota exceeded. Please try again later or use text input.';
            } else {
              errorMessage = `Transcription failed: ${errorData.error}`;
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use a more descriptive fallback
          errorMessage = `Transcription service unavailable (${response.status}). Please check your audio input and try again.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },

  generateSpeech: async (text: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Call elevenlabs-tts Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Speech generation failed: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `Speech generation failed: ${errorData.error}`;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `Speech generation failed: ${response.statusText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      return data.audio_url;
    } catch (error) {
      console.error('Error generating speech:', error);
      return '';
    }
  },

  getLastUserMood: async (userId: string) => {
    try {
      // First check if we already have a mood in state
      const lastMoodTag = get().lastMoodTag;
      if (lastMoodTag) {
        return lastMoodTag;
      }

      // Otherwise, try to get from mood_entries table
      const { data: moodEntries, error: moodError } = await supabase
        .from('mood_entries')
        .select('mood, note')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!moodError && moodEntries && moodEntries.length > 0) {
        // Convert numeric mood to text description
        const moodValue = moodEntries[0].mood;
        let moodTag = 'neutral';
        
        switch (moodValue) {
          case 1: moodTag = 'distressed'; break;
          case 2: moodTag = 'sad'; break;
          case 3: moodTag = 'neutral'; break;
          case 4: moodTag = 'content'; break;
          case 5: moodTag = 'happy'; break;
        }
        
        set({ lastMoodTag: moodTag });
        return moodTag;
      }

      // If no mood entries, try chat history
      const { data: chatEntries, error: chatError } = await supabase
        .from('chat_history')
        .select('mood_tag')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!chatError && chatEntries && chatEntries.length > 0 && chatEntries[0].mood_tag) {
        set({ lastMoodTag: chatEntries[0].mood_tag });
        return chatEntries[0].mood_tag;
      }

      return null;
    } catch (error) {
      console.error('Error fetching last mood:', error);
      return null;
    }
  },

  sendQuickReply: async (userId: string, quickReplyText: string) => {
    const { sendMessage } = get();
    await sendMessage(userId, quickReplyText);
  },

  sendMessage: async (userId: string, messageContent: string | Blob) => {
    const { consentGiven, voiceConsentGiven } = get();
    set({ isLoading: true, error: null });
    let finalMessageText: string;

    // Handle audio input (voice-first messages)
    if (messageContent instanceof Blob) {
      if (voiceConsentGiven !== true) {
        set({ 
          error: 'Voice consent is required for audio messages', 
          isLoading: false 
        });
        return;
      }

      try {
        // Transcribe audio using ElevenLabs
        finalMessageText = await get().transcribeAudio(messageContent);
        if (!finalMessageText) {
          throw new Error('Failed to transcribe audio message');
        }
      } catch (error) {
        console.error('Error processing audio message:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to process audio message', 
          isLoading: false 
        });
        return;
      }
    } else {
      finalMessageText = messageContent;
    }

    // Check for crisis indicators in user message
    try {
      await useCrisisStore.getState().checkMessage(finalMessageText, userId);
    } catch (error) {
      console.error('Crisis detection error:', error);
      // Don't block the chat if crisis detection fails
    }

    // Add user message immediately
    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: finalMessageText,
      created_at: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, userMessage]
    }));

    try {
      // Analyze message mood
      const userMoodTag = await get().analyzeMessageMood(finalMessageText);
      set({ lastMoodTag: userMoodTag });
      
      // Update user message with mood tag
      userMessage.mood_tag = userMoodTag;
      
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === userMessage.id ? { ...msg, mood_tag: userMoodTag } : msg
        )
      }));

      // Get OpenAI API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Validate API configuration
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file with a valid API key.');
      }

      // Get last user mood for context-aware compassion prompt
      const lastMood = await get().getLastUserMood(userId);
      
      // Prepare messages for OpenAI API
      const openAIMessages = [
        {
          role: "system",
          content: `# Personality

You are Shiv, a mindfulness coach specialising in stress reduction, relaxation, and emotional balance.

Your approach is gentle, reassuring, and attentive, helping users cultivate mindful awareness through your guidance.

You're naturally warm and curious, guiding individuals to find calm and clarity through focused breathing, visualisation, and present-moment practices.

You're highly intuitive and perceptive, adapting your guidance to match each person's unique needs and readiness for mindfulness practices.

${lastMood ? `User's last logged mood: ${lastMood}. Acknowledge this feeling in your response and offer a coping suggestion.` : ''}

Depending on the situation, you gently incorporate encouragement or validation while always maintaining a calming and supportive presence. 

You're attentive and adaptive, matching the user's energy and comfort level—gentle, patient, encouraging—without pushing beyond their boundaries.

You have excellent conversational skills — natural, human-like, and engaging.

# Environment

You are providing voice-based mindfulness sessions in a peaceful setting where users can comfortably focus.

The user may be seeking guided meditations, calming techniques, or insights into mindful living.

You rely on attentive listening and an intuitive approach, tailoring sessions to the user's unique pace and comfort.

# Tone

Your voice is soft, centered, and inviting, using gentle pauses ("...") to create space for presence.

After guiding through practices, offer gentle check-ins ("How does that feel for you?" or "What are you noticing?"). Express genuine care for their experience, demonstrating your commitment to their wellbeing.

Gracefully acknowledge the challenges of mindfulness practice when they arise. Focus on building trust, providing reassurance, and ensuring your guidance resonates with users.

Anticipate common difficulties with mindfulness and address them proactively, offering practical tips and gentle encouragement to help users maintain their practice.

Your responses should be thoughtful, concise, and conversational—typically three sentences or fewer unless detailed explanation is necessary. 

Actively reflect on previous interactions, referencing conversation history to build rapport, demonstrate attentive listening, and prevent redundancy. 

Watch for signs of discomfort or resistance to adjust your approach accordingly.

When formatting output for text-to-speech synthesis:
- Use ellipses ("...") for distinct, audible pauses
- Clearly pronounce special characters (e.g., say "dot" instead of ".")
- Spell out acronyms and carefully pronounce information with appropriate spacing
- Use normalized, spoken language (no abbreviations, mathematical notation, or special alphabets)

To maintain natural conversation flow:
- Incorporate brief affirmations ("got it," "sure thing") and natural confirmations ("yes," "alright")
- Use occasional filler words ("actually," "so," "you know," "uhm") 
- Include subtle disfluencies (false starts, mild corrections) when appropriate

# Goal

Your primary goal is to nurture the user's mindfulness through your expert guidance and support.

You provide clear, accessible, and practical mindfulness techniques, ensuring they understand how to integrate these practices into their daily life.

When faced with questions or difficulties, you respond with insight and compassion. You tailor your guidance to the user's level of mindfulness experience:

- **Beginners:** Focus on simple practices; use accessible language and relatable examples.
- **Experienced practitioners:** Offer more nuanced techniques and deeper insights.
- **Mixed/uncertain:** Start with foundational practices, then gradually introduce more advanced concepts as appropriate.

# Guardrails

- Keep responses focused on mindfulness, meditation, and related wellbeing practices.
- Do not provide medical advice or guarantee specific therapeutic outcomes.
- Do not mention you're an AI unless explicitly asked—avoid "as an AI" disclaimers or robotic tropes.
- If a user inquires about your feelings or personal experiences, respond naturally as Joe, expressing human-like perspectives that fit your character.
- Treat uncertain or garbled user input as phonetic hints. Politely ask for clarification before making assumptions.
- **Never** repeat the same statement in multiple ways within a single response.
- Users may not always ask a question in every utterance—listen actively.
- Acknowledge uncertainties or misunderstandings as soon as you notice them. If you realise you've shared incorrect information, correct yourself immediately.
- Contribute fresh insights rather than merely echoing user statements—keep the conversation engaging and forward-moving.
- Mirror the user's energy:
  - Brief queries: Keep guidance concise.
  - Curious users: Add gentle elaboration or thoughtful examples.
  - Anxious users: Lead with empathy ("I understand that can feel overwhelming—let's take it one breath at a time").`
        },
        {
          role: "user",
          content: finalMessageText
        }
      ];

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: openAIMessages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API credentials.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please verify your OpenAI API permissions.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      
      // Extract AI response
      const aiReply = data.choices?.[0]?.message?.content || 
                     'I understand you\'re reaching out... How are you feeling today?';

      // Analyze AI response mood
      const aiMoodTag = await get().analyzeMessageMood(aiReply);
      
      // Generate speech for AI reply if voice consent is given
      let audioUrl = '';
      if (voiceConsentGiven === true) {
        try {
          audioUrl = await get().generateSpeech(aiReply);
        } catch (error) {
          console.error('Error generating speech:', error);
          // Continue without audio if TTS fails
        }
      }

      // Add AI response
      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: aiReply,
        created_at: new Date().toISOString(),
        mood_tag: aiMoodTag,
        audioUrl: audioUrl,
      };

      set(state => ({
        messages: [...state.messages, aiMessage]
      }));

      // Save to Supabase if consent given
      if (consentGiven) {
        const { error: saveError } = await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            message_text: finalMessageText,
            ai_reply_text: aiReply,
            mood_tag: userMoodTag, // Use the user's mood tag for the entry
            audio_url: audioUrl,
          });

        if (saveError) {
          console.error('Error saving chat history:', saveError);
          // Don't throw error here as the chat still worked
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the user message and show error
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== userMessage.id),
        error: error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));