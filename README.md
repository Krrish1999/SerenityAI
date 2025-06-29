# Serenity Ai - Mental Health & Wellness Platform

Serenity Ai is a comprehensive mental health and wellness platform designed to connect users with professional therapists, provide tools for self-care, and offer accessible resources for improved mental well-being. Our mission is to empower individuals on their journey to mental wellness through a secure, intuitive, and feature-rich application.

## ✨ Features

Serenity Ai is built with a robust set of features catering to both patients seeking support and therapists providing services.

### 🔐 User Management & Authentication

* **Secure Authentication**: Users can securely sign up and log in using email and password.
* **Role-Based Access**: Differentiates between `patient` and `therapist` roles, providing tailored experiences and access to specific features.
* **Profile Management**: Users can update their full name, bio, phone number, and manage consent for phone features.
* **Password Management**: Users can securely update their account password.

### 🧘 Patient Dashboard & Self-Care Tools

* **Personalized Dashboard**: A central hub providing a snapshot of the user's wellness journey, including journal entry count, session credits, upcoming appointments, and current mood streak.
* **Mood Tracker**:
  * **Log Mood**: Users can log their mood daily with optional notes, selecting from a 5-point scale.
  * **Mood Trends**: Visualizes mood data over different time ranges (day, week, month, year) using interactive charts to help users identify patterns.
* **Journaling**:
  * **Create & Edit Entries**: Users can write, edit, and save journal entries with titles, content, mood ratings, and tags.
  * **View & Search**: Browse all past entries, search by keywords, and filter by mood or tags for easy reflection.
* **Quick Actions**: Convenient shortcuts to frequently used features like AI Chat, New Journal Entry, and Resources.

### 🗣️ AI Companion & Crisis Support

* **AI Chat**: Engage in conversational AI sessions with an AI mindfulness coach for support, guidance, and mindfulness exercises.
* **Chat History Consent**: Users can opt-in to save their chat history for future reference and personalized support.
* **Crisis Intervention System**:
  * **Automated Detection**: Detects crisis-related keywords in user messages and triggers an intervention modal.
  * **Emergency Resources**: Provides immediate access to national crisis hotlines and emergency services.
  * **User Response Logging**: Records how users interact with the crisis modal (e.g., contacted help, dismissed, saved resources) for therapist awareness.
* **AI Voice Call**: Initiate a phone call with the AI mindfulness coach for a more personal, voice-based interaction (requires phone number and consent).

### 🧑‍⚕️ Therapist & Appointment Management

* **Therapist Directory**: Browse a list of licensed therapists, search by name or specialization, and view detailed profiles.
* **Therapist Profiles**: Comprehensive profiles including specialization, experience, description, hourly rates, education, certifications, and client ratings.
* **Service Management (Therapists)**:
  * **Create & Manage Services**: Therapists can define and manage their service offerings, including one-time sessions and subscription plans.
  * **Flexible Pricing**: Set custom prices, billing intervals (weekly, monthly, yearly), and session quotas for subscription plans.
  * **Stripe Product Integration**: Services are automatically synced with Stripe Products and Prices for seamless payment processing.
* **Appointment Booking**:
  * **Select Service**: Patients can choose from a therapist's available services (one-time or subscription).
  * **Date & Time Selection**: Intuitive interface to select available appointment slots.
  * **Free Session Credit**: New patients receive a complimentary first session credit for one-time services.
* **Appointment Tracking**:
  * **View Appointments**: Both patients and therapists can view their scheduled, completed, and cancelled appointments.
  * **Reschedule & Cancel**: Patients can reschedule or cancel appointments, with built-in cancellation policy and fee handling.
  * **Refund Processing (Therapists)**: Therapists can process full or partial refunds for paid appointments.
* **Earnings Dashboard (Therapists)**:
  * **Financial Overview**: Track gross revenue, net earnings (after platform fees), and total sessions.
  * **Detailed History**: View a breakdown of all transactions, including patient name, service, amount, and fees.
  * **Export Data**: Export earnings data to CSV for financial record-keeping.

### 💬 Secure Messaging

* **Direct Messaging**: Patients and therapists can send secure, encrypted messages to each other.
* **Conversation List**: View all active conversations with unread message indicators.
* **Real-time Updates**: Messages are updated in real-time for smooth communication.

### 📚 Educational Resources

* **Resource Library**: Access a curated collection of articles, guides, and self-help tools related to mental health and wellness.
* **Search & Filter**: Easily find relevant resources by searching keywords or filtering by categories.
* **Detailed Content**: View full articles with rich content and relevant imagery.

### 👨‍⚕️ Doctor Dashboard (Therapist-Specific)

* **Patient Overview**: A dedicated dashboard for therapists to manage their patients.
* **Patient List**: View a list of all assigned patients with quick summaries including age, status (stable, monitoring, crisis), average mood, and last activity.
* **Patient Search & Filter**: Search for patients by name or email and filter by status (stable, monitoring, crisis).
* **Patient Profile**: Detailed view of individual patient profiles, including:
  * **Key Metrics**: Average mood, journal entry count, engagement score, next session.
  * **Mood Trends**: Visual chart of the patient's mood over time.
  * **Journal Entries**: Access to the patient's journal entries (with appropriate consent/permissions).
  * **Crisis Alerts**: Panel displaying any detected crisis events for the patient, including severity and user response.
  * **Direct Messaging**: Communicate directly with the patient from their profile.
* **Crisis Alerts Panel**: Centralized view of all recent crisis events detected across their patient base.

### 💳 Payment & Subscription Integration

* **Stripe Connect**: Seamlessly integrates with Stripe Connect for therapists to accept payments directly.
  * **Onboarding Flow**: Guides therapists through the Stripe Connect onboarding process to set up their payment accounts.
  * **Status Tracking**: Displays the status of the therapist's Stripe account (onboarding complete, charges enabled, payouts enabled).
* **Stripe Elements**: Utilizes Stripe Elements for secure and compliant payment collection on the client-side.
* **Webhook Handling**: Backend webhooks process payment and subscription events from Stripe, ensuring data consistency.
* **Subscription Management**: Patients can view, pause, resume, and cancel their therapy subscriptions.

## 🚀 Technology Stack

Serenity Ai is built using modern web technologies to ensure a fast, scalable, and maintainable application.

* **Frontend**:
  * **React**: A JavaScript library for building user interfaces.
  * **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
  * **Zustand**: A small, fast, and scalable bear-bones state-management solution.
  * **React Router DOM**: For declarative routing in React applications.
  * **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
  * **Lucide React**: A collection of beautiful and customizable open-source icons.
  * **Chart.js & React-Chartjs-2**: For creating interactive data visualizations.
  * **date-fns**: A modern JavaScript date utility library.
  * **React Hook Form**: For efficient and flexible form validation.
* **Backend & Database**:
  * **Supabase**: An open-source Firebase alternative providing:
    * **PostgreSQL Database**: Robust and scalable relational database.
    * **Authentication**: User authentication and authorization.
    * **Row Level Security (RLS)**: Fine-grained access control to database rows.
    * **Edge Functions**: Serverless functions (Deno) for handling sensitive operations like Stripe API calls and Twilio integration.
* **Payment Processing**:
  * **Stripe**: Industry-leading payment processing platform for handling one-time payments, subscriptions, and therapist payouts via Stripe Connect.
* **AI & Communication**:
  * **OpenAI**: Powers the AI Companion for conversational interactions.
  * **Twilio**: Enables voice calls for the AI Companion feature.
  * **ElevenLabs**: Provides realistic text-to-speech for the AI voice calls.

## ⚙️ Setup and Installation

Follow these steps to get Serenity Ai up and running on your local machine.

### Prerequisites

* Node.js (v18 or higher)
* npm or Yarn
* A Supabase project
* Stripe account (for full payment features)
* OpenAI API key (for AI Chat)
* Twilio account (for AI Voice Call)
* ElevenLabs account (for AI Voice Call)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Serenity Ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root of your project based on `.env.example` and fill in your credentials:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs Configuration (for Edge Functions)
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Twilio Configuration (for Edge Functions)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

**Important Notes for Supabase**:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` can be found in your Supabase project settings under API.
- For Edge Functions, you'll need to set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for admin functions) as Supabase Secrets.

### 4. Database Setup

The database schema is defined in the `supabase/migrations` directory. You can apply these migrations to your Supabase project.

**Key Tables**:
- `profiles`: User profiles, roles, and contact info.
- `journal_entries`: Patient journal data.
- `mood_entries`: Patient mood tracking.
- `therapist_profiles`: Therapist-specific details.
- `therapist_services`: Services offered by therapists (one-time, subscriptions).
- `appointments`: Scheduled sessions.
- `messages`: Direct messages between users.
- `chat_history`: AI chat logs.
- `crisis_events`: Logs of detected crisis indicators.
- `patient_subscriptions`: Tracks patient subscriptions to therapist services.
- `payment_refunds`: Records of processed refunds.

### 5. Deploy Supabase Edge Functions

The application relies on several Supabase Edge Functions. You'll need to deploy these from the `supabase/functions` directory.

- `cancel-subscription`
- `create-payment-intent`
- `create-stripe-service`
- `create-subscription`
- `media-stream`
- `place-call`
- `process-refund`
- `reschedule-appointment`
- `stripe-connect-onboard`
- `stripe-connect-status`
- `stripe-webhook`
- `twiml`

**Important for Edge Functions**:
- Ensure your `.env` variables (especially Stripe, Twilio, ElevenLabs keys) are also set as Supabase Secrets in your Supabase project.
- For `stripe-webhook`, you'll need to configure a webhook endpoint in your Stripe Dashboard pointing to your deployed `stripe-webhook` Edge Function URL. Refer to `STRIPE_TESTING_GUIDE.md` for details on required events.

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

This will start the development server, usually at http://localhost:5173.

## 🧪 Testing

The project includes a detailed guide for testing the Stripe integration. Please refer to `STRIPE_TESTING_GUIDE.md` in the root directory for comprehensive instructions on testing payment flows, subscriptions, and troubleshooting.

### Testing User Accounts

For testing purposes, you can use these sample accounts with different roles:

**Therapist accounts:**
- Email: `dr.johnson@Serenity Ai.com` - Anxiety specialist
- Email: `dr.patel@Serenity Ai.com` - Relationship counselor
- Email: `dr.thompson@Serenity Ai.com` - Trauma specialist

**Patient accounts:**
- Email: `alice.johnson@email.com` - Anxiety patient
- Email: `bob.smith@email.com` - Depression patient
- Email: `emma.brown@email.com` - Grief counseling

All test accounts use the password: `Password123!`

## 🌐 Deployment

This application can be easily deployed to platforms like Netlify or Vercel. Follow these steps for deployment:

1. Build the project: `npm run build`
2. Configure environment variables on your hosting platform
3. Deploy the contents of the `dist` folder

Ensure all environment variables from `.env.example` are correctly configured in your deployment environment.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to open an issue or submit a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

- **Authentication errors:** Make sure your Supabase credentials are correctly configured in `.env`
- **Stripe integration issues:** Check the `STRIPE_TESTING_GUIDE.md` for solutions
- **Database connectivity:** Verify your Supabase project is running and RLS policies are correctly set up

For more help, please open an issue on the repository.
