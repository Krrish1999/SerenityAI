/*
  # Add INSERT policy for therapist profiles

  1. Security
    - Add policy for authenticated users to insert their own therapist profiles
    - Policy ensures users can only create profiles for themselves (auth.uid() = user_id)

  2. Changes
    - CREATE POLICY for INSERT operations on therapist_profiles table
    - Allows authenticated users to insert profiles where the user_id matches their auth.uid()
*/

CREATE POLICY "Users can insert their own therapist profile"
  ON therapist_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);