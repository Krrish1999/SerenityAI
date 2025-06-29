/*
  # Stripe Connect Integration Setup

  1. Database Schema Updates
    - Add Stripe Connect fields to therapist_profiles table
    - Create therapist_services table for service management
    - Create patient_subscriptions table for subscription tracking
    - Update appointments table for payment integration

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
*/

-- Add Stripe Connect fields to therapist_profiles table
DO $$
BEGIN
  -- Add stripe_account_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN stripe_account_id TEXT;
  END IF;

  -- Add stripe_onboarding_complete column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'stripe_onboarding_complete'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
  END IF;

  -- Add stripe_charges_enabled column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'stripe_charges_enabled'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Add stripe_payouts_enabled column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'stripe_payouts_enabled'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN stripe_payouts_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add free_session_credit to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'free_session_credit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN free_session_credit BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create therapist_services table
CREATE TABLE IF NOT EXISTS therapist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_profile_id UUID REFERENCES therapist_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  type TEXT NOT NULL CHECK (type IN ('one_time', 'subscription')),
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  billing_interval TEXT CHECK (billing_interval IN ('day', 'week', 'month', 'year')),
  session_quota INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on therapist_services
ALTER TABLE therapist_services ENABLE ROW LEVEL SECURITY;

-- Create policies for therapist_services
CREATE POLICY "Therapists can manage their own services"
  ON therapist_services
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM therapist_profiles 
      WHERE id = therapist_services.therapist_profile_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM therapist_profiles 
      WHERE id = therapist_services.therapist_profile_id
    )
  );

CREATE POLICY "All users can view active services"
  ON therapist_services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create patient_subscriptions table
CREATE TABLE IF NOT EXISTS patient_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  therapist_service_id UUID REFERENCES therapist_services(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  sessions_used_current_cycle INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on patient_subscriptions
ALTER TABLE patient_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_subscriptions
CREATE POLICY "Patients can view their own subscriptions"
  ON patient_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own subscriptions"
  ON patient_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can view subscriptions for their services"
  ON patient_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT tp.user_id 
      FROM therapist_profiles tp
      JOIN therapist_services ts ON tp.id = ts.therapist_profile_id
      WHERE ts.id = patient_subscriptions.therapist_service_id
    )
  );

-- Update appointments table for payment integration
DO $$
BEGIN
  -- Add therapist_service_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'therapist_service_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN therapist_service_id UUID REFERENCES therapist_services(id);
  END IF;

  -- Add stripe_payment_intent_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;

  -- Add stripe_subscription_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'free'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS therapist_services_therapist_profile_id_idx ON therapist_services(therapist_profile_id);
CREATE INDEX IF NOT EXISTS therapist_services_is_active_idx ON therapist_services(is_active);
CREATE INDEX IF NOT EXISTS patient_subscriptions_patient_id_idx ON patient_subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS patient_subscriptions_stripe_subscription_id_idx ON patient_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS appointments_stripe_payment_intent_id_idx ON appointments(stripe_payment_intent_id);