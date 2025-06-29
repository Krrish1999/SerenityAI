/*
  # Add user roles to profiles table

  1. Changes
    - Add `role` column to profiles table with default 'patient'
    - Add check constraint to ensure role is either 'patient' or 'therapist'
    - Update existing profiles to have 'patient' role by default

  2. Security
    - No changes to RLS policies needed
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'patient' NOT NULL;
  END IF;
END $$;

-- Add check constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('patient', 'therapist'));
  END IF;
END $$;

-- Update existing therapist profiles to have therapist role
UPDATE profiles 
SET role = 'therapist' 
WHERE id IN (
  SELECT user_id FROM therapist_profiles
);