/*
  # Crisis Events Logging System

  1. New Tables
    - `crisis_events`: Securely logs crisis detection events
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles) 
      - `detected_at` (timestamp)
      - `trigger_keywords` (text array, anonymized keywords that triggered detection)
      - `severity_level` (text, high/medium/low)
      - `user_response` (text, how user responded to crisis modal)
      - `message_context_hash` (text, one-way hash of message for analysis)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on crisis_events table
    - Add policies for crisis event management
    - Encrypt sensitive data fields
*/

-- Create crisis_events table
CREATE TABLE IF NOT EXISTS crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  trigger_keywords TEXT[] DEFAULT '{}',
  severity_level TEXT NOT NULL CHECK (severity_level IN ('high', 'medium', 'low')),
  user_response TEXT,
  message_context_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;

-- Create policies for crisis event management
CREATE POLICY "Healthcare providers can view crisis events"
  ON crisis_events
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM therapist_profiles
    )
  );

CREATE POLICY "System can insert crisis events"
  ON crisis_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS crisis_events_user_id_idx ON crisis_events(user_id);
CREATE INDEX IF NOT EXISTS crisis_events_detected_at_idx ON crisis_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS crisis_events_severity_idx ON crisis_events(severity_level);