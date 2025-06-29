/*
  # Create therapist_profile_details view

  1. New Views
    - `therapist_profile_details`: Joins therapist_profiles with profiles
      - Provides easy access to therapist data including full_name from profiles table
      - Simplifies queries that need both therapist and basic profile data

  2. Security
    - Relies on the security of the underlying tables (therapist_profiles and profiles)
    - Both underlying tables already have RLS enabled with appropriate policies
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