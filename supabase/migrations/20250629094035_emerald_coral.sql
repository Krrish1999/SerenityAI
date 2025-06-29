/*
  # Enhance chat_history table for voice messages and emotion tracking

  1. Changes
    - Add `mood_tag` column to store the emotional state detected in each message
    - Add `audio_url` column to store the URL of the AI's voice response

  2. Purpose
    - Support voice-to-voice messaging feature
    - Enable emotion tracking throughout conversations
    - Allow for contextual compassion in AI responses
*/

-- Add mood_tag and audio_url columns to chat_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_history' AND column_name = 'mood_tag'
  ) THEN
    ALTER TABLE chat_history ADD COLUMN mood_tag TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_history' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE chat_history ADD COLUMN audio_url TEXT;
  END IF;
END $$;