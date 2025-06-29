/*
  # Add payment features and cancellation policies

  1. New Tables
    - `payment_refunds`: Stores refund history
      - `id` (uuid, primary key)
      - `payment_intent_id` (text, reference to Stripe payment intent)
      - `refund_id` (text, Stripe refund ID)
      - `amount` (numeric, refund amount)
      - `reason` (text, reason for refund)
      - `status` (text, refund status)
      - `refunded_by` (uuid, user who processed the refund)
      - `created_at` (timestamp)

  2. Changes
    - Add `cancellation_policy` to therapist_profiles
    - Add `cancellation_fee_percentage` to therapist_profiles
    - Add `reschedule_policy` to therapist_profiles
    - Add `cancellation_reason` to appointments
    - Add `rescheduled_from` to appointments
    - Add `refund_status` to appointments
*/

-- Add payment_refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id TEXT NOT NULL,
  refund_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  refunded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on payment_refunds
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_refunds
CREATE POLICY "Therapists can view refunds they processed"
  ON payment_refunds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = refunded_by);

-- Add cancellation and rescheduling fields to therapist_profiles
DO $$
BEGIN
  -- Add cancellation_policy column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'cancellation_policy'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN cancellation_policy TEXT DEFAULT '24-hour cancellation policy. Cancellations within 24 hours may incur a fee.';
  END IF;

  -- Add cancellation_fee_percentage column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'cancellation_fee_percentage'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN cancellation_fee_percentage INTEGER DEFAULT 50;
  END IF;

  -- Add reschedule_policy column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles' AND column_name = 'reschedule_policy'
  ) THEN
    ALTER TABLE therapist_profiles ADD COLUMN reschedule_policy TEXT DEFAULT 'Free rescheduling up to 24 hours before appointment. Late rescheduling may incur a fee.';
  END IF;
END $$;

-- Add cancellation and rescheduling fields to appointments
DO $$
BEGIN
  -- Add cancellation_reason column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancellation_reason TEXT;
  END IF;

  -- Add rescheduled_from column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'rescheduled_from'
  ) THEN
    ALTER TABLE appointments ADD COLUMN rescheduled_from TIMESTAMPTZ;
  END IF;

  -- Add refund_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'refund_status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN refund_status TEXT CHECK (refund_status IN ('none', 'full', 'partial'));
  END IF;
END $$;