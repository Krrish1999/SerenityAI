# Stripe Integration Testing Guide

This guide provides detailed instructions for testing the Stripe integration in the MindWell application. It covers all payment flows, subscription management, and troubleshooting tips.

## 🔑 Prerequisites

Before testing, ensure you have:

1. Set up your environment variables in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. Configured Stripe webhook endpoints in your Stripe Dashboard:
   - URL: `https://your-domain.com/functions/v1/stripe-webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

## 🧪 Test Cards

Use these Stripe test cards to simulate different payment scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Declined payment |
| 4000 0025 0000 3155 | 3D Secure authentication |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 9987 | Lost card |
| 4000 0000 0000 9979 | Stolen card |

For all test cards:
- Expiration date: Any future date (e.g., 12/30)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

## 🔄 Testing Flows

### 1. Therapist Onboarding

1. **Create a therapist account**:
   - Sign up with a new email
   - Select "Therapist" role
   - Complete profile setup

2. **Connect with Stripe**:
   - Go to Therapist Setup page
   - Click "Start Stripe Setup"
   - Complete the Stripe Connect onboarding form
   - Use test data for all fields

3. **Verify onboarding**:
   - Return to the application
   - Check that Stripe Connect status shows "Fully activated"

### 2. Service Creation

1. **Create a one-time service**:
   - Go to Service Management section
   - Click "Add Service"
   - Fill in service details:
     - Name: "Initial Consultation"
     - Price: $100
     - Type: One-time session

2. **Create a subscription service**:
   - Click "Add Service" again
   - Fill in subscription details:
     - Name: "Monthly Therapy Plan"
     - Price: $350
     - Type: Subscription
     - Billing Interval: Monthly
     - Sessions Included: 4

### 3. One-Time Payment Flow

1. **Book a session as a patient**:
   - Log in as a patient
   - Browse therapists and select one
   - Choose a one-time service
   - Select date and time
   - Proceed to payment

2. **Complete payment**:
   - Enter test card details (4242 4242 4242 4242)
   - Submit payment
   - Verify success message

3. **Verify appointment creation**:
   - Check Appointments page
   - Confirm appointment details match booking
   - Verify payment status is "Paid"

### 4. Free Session Credit

1. **Book with free credit**:
   - Create a new patient account (has free session credit by default)
   - Book a one-time session
   - Verify "Free Session" message appears
   - Complete booking without entering payment

2. **Verify credit usage**:
   - Check that appointment shows "Free" payment status
   - Verify free session credit is now used (profile shows 0 credits)
   - Try booking another session - should require payment

### 5. Subscription Flow

1. **Subscribe to a plan**:
   - As a patient, select a therapist
   - Choose a subscription service
   - Complete checkout with test card

2. **Manage subscription**:
   - Go to Subscriptions page
   - Verify subscription details
   - Test pause/resume functionality
   - Test cancellation flow

3. **Book with subscription**:
   - Go to Appointments page
   - Book a new appointment
   - Verify it uses subscription quota instead of charging

### 6. Cancellation & Refunds

1. **Cancel appointment**:
   - Find an upcoming appointment
   - Click menu and select "Cancel"
   - Review cancellation policy
   - Complete cancellation

2. **Process refund (as therapist)**:
   - Log in as therapist
   - Find a paid appointment
   - Click menu and select "Process Refund"
   - Test both full and partial refunds

### 7. Rescheduling

1. **Reschedule appointment**:
   - Find an upcoming appointment
   - Click menu and select "Reschedule"
   - Select new date/time
   - Verify rescheduling fee notice (if applicable)
   - Complete rescheduling

2. **Verify rescheduled appointment**:
   - Check that original appointment is cancelled
   - Confirm new appointment appears with correct details
   - Verify "Rescheduled from" note

## 🔍 Webhook Testing

To test webhooks locally:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run webhook forwarding:
   ```
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```
3. Note the webhook signing secret and add it to your `.env`
4. Trigger webhook events:
   ```
   stripe trigger payment_intent.succeeded
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Payment fails with "Authentication Required"**:
   - This is expected with 3D Secure test cards
   - Follow the authentication prompt to complete payment

2. **Webhook errors**:
   - Check webhook signing secret is correct
   - Verify endpoint URL is accessible
   - Check Stripe Dashboard for webhook delivery attempts

3. **Stripe Connect issues**:
   - Ensure you're using test mode in Stripe Dashboard
   - Complete all required fields in onboarding
   - Check for error messages in browser console

4. **Subscription not activating**:
   - Verify webhook for `invoice.payment_succeeded` is configured
   - Check Stripe Dashboard for subscription status
   - Ensure database is updated via webhook handler

### Debugging Tools

1. **Stripe Dashboard**: View payments, subscriptions, and webhook events
2. **Stripe CLI**: Test webhooks and trigger events
3. **Browser Console**: Check for API errors
4. **Supabase Dashboard**: Examine database records and Edge Function logs

## 🔒 Security Considerations

- All API keys in this guide are for test mode only
- Never expose Stripe secret keys in client-side code
- Always use Stripe Elements for secure payment collection
- Process all payments server-side via Edge Functions
- Validate all webhook signatures

## 📊 Testing Checklist

- [ ] Therapist onboarding completed successfully
- [ ] Services created and visible to patients
- [ ] One-time payment processed successfully
- [ ] Free session credit applied correctly
- [ ] Subscription created and managed properly
- [ ] Appointment cancellation works with correct fee application
- [ ] Refunds processed correctly
- [ ] Rescheduling works with proper fee handling
- [ ] Webhooks properly update database records
- [ ] Error handling works for declined payments

For any issues not covered in this guide, refer to the [Stripe API Documentation](https://stripe.com/docs/api) or contact support.