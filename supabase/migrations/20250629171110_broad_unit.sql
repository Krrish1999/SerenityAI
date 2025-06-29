/*
  # Fix therapist profile display names

  1. Update Therapist Data Structure
    - Create a view that properly joins therapist profiles with user names
    - Simplify data access for therapist information
    - Expose full_name from profiles table directly in the view
    
  2. Purpose
    - Fix issue where therapist UUIDs are showing instead of names
    - Provide a consistent way to access therapist information across the application
    - Maintain proper joins between profiles and therapist profiles
*/

-- Create a view that joins therapist_profiles with profiles
CREATE OR REPLACE VIEW therapist_profile_details AS
SELECT
  tp.id,
  tp.user_id,
  p.full_name,
  p.avatar_url,
  tp.specialization,
  tp.experience_years,
  tp.description,
  tp.rate_per_hour,
  tp.availability,
  tp.education,
  tp.certifications,
  tp.rating,
  tp.stripe_account_id,
  tp.stripe_onboarding_complete,
  tp.stripe_charges_enabled,
  tp.stripe_payouts_enabled,
  tp.cancellation_policy,
  tp.cancellation_fee_percentage,
  tp.reschedule_policy
FROM
  therapist_profiles tp
JOIN
  profiles p ON tp.user_id = p.id;

-- Enable secure access to the view
ALTER TABLE therapist_profile_details ENABLE ROW LEVEL SECURITY;

-- Create policies for the view
CREATE POLICY "All users can view therapist profile details"
  ON therapist_profile_details
  FOR SELECT
  TO authenticated
  USING (true);