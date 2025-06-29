/*
  # Add phone number field to profiles table

  1. Changes
    - Add phone_number column to profiles table
    - This will be used for the Call Me feature
*/

-- Add phone_number column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;