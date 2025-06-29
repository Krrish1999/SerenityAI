/*
  # Add consent_given column to profiles table

  1. Changes
    - Add `consent_given` column to profiles table with default false
    - This enables users to opt-in to phone call features

  2. Security
    - No changes to RLS policies needed
*/

-- Add consent_given column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'consent_given'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consent_given BOOLEAN DEFAULT false;
  END IF;
END $$;