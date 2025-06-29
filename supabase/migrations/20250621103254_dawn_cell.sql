/*
  # Fix mood_logs table and policies

  1. New Tables
    - `mood_logs` table (if not exists)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `logged_at` (timestamp)
      - `text` (text)
      - `mood_tag` (varchar)

  2. Security
    - Drop existing incorrect policies that use `uid()`
    - Create correct policies using `auth.uid()`
    - Enable RLS on mood_logs table

  3. Performance
    - Add index for efficient querying
*/

-- Create mood_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  text TEXT NOT NULL,
  mood_tag VARCHAR(20)
);

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that may use incorrect uid() function
DROP POLICY IF EXISTS "Users can view their own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users can insert their own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users can delete their own mood logs" ON mood_logs;

-- Create correct policies using auth.uid()
CREATE POLICY "Users can view their own mood logs"
  ON mood_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
  ON mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON mood_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS mood_logs_user_logged_at_idx ON mood_logs(user_id, logged_at DESC);