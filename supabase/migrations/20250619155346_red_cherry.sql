/*
  # Fix RLS policies for profiles table

  1. Security Changes
    - Drop existing policies that use incorrect `uid()` function
    - Add correct policies using `auth.uid()` function
    - Add INSERT policy to allow users to create their own profiles
    - Add SELECT policy to allow users to read their own profiles
    - Add UPDATE policy to allow users to update their own profiles

  2. Policy Details
    - INSERT: Allow authenticated users to insert their own profile data
    - SELECT: Allow authenticated users to read their own profile data  
    - UPDATE: Allow authenticated users to update their own profile data
*/

-- Drop existing policies that use incorrect uid() function
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Add correct policies using auth.uid()
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);