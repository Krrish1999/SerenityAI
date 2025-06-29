/*
  # Create AI Chat History Table

  1. New Tables
    - `chat_history`: Stores conversation history between users and AI
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `message_text` (text, user's message)
      - `ai_reply_text` (text, AI's response)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_history` table
    - Add policies for authenticated users to manage their own chat history
*/

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  ai_reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);