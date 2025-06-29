import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0';
import Stripe from 'https://esm.sh/stripe@14.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if required environment variables are set
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl) {
      console.error('SUPABASE_URL environment variable not set');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_URL not set. Please configure Supabase Secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseAnonKey) {
      console.error('SUPABASE_ANON_KEY environment variable not set');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_ANON_KEY not set. Please configure Supabase Secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable not set');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: STRIPE_SECRET_KEY not set. Please configure Supabase Secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          details: userError.message 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No authenticated user found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if therapist profile exists
    const { data: therapistProfile, error: profileError } = await supabaseClient
      .from('therapist_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching therapist profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch therapist profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!therapistProfile) {
      return new Response(
        JSON.stringify({ error: 'Therapist profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    let accountId = therapistProfile.stripe_account_id;

    // Create Stripe Connect account if it doesn't exist
    if (!accountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        accountId = account.id;
      } catch (stripeError: any) {
        console.error('Stripe account creation error:', stripeError);
        
        // Handle specific Connect not enabled error
        if (stripeError.message && stripeError.message.includes('signed up for Connect')) {
          return new Response(
            JSON.stringify({ 
              error: 'Stripe Connect not enabled',
              message: 'Your Stripe account needs to have Connect enabled. Please visit your Stripe Dashboard, go to the Connect section, and enable Connect for your account. Then update your STRIPE_SECRET_KEY with a Connect-enabled API key.',
              helpUrl: 'https://stripe.com/docs/connect'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Re-throw other Stripe errors
        throw stripeError;
      }


      // Update therapist profile with Stripe account ID
      const { error: updateError } = await supabaseClient
        .from('therapist_profiles')
        .update({ stripe_account_id: accountId })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating therapist profile:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update therapist profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create account link for onboarding
    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.get('origin')}/therapist-setup?refresh=true`,
        return_url: `${req.headers.get('origin')}/therapist-setup?setup=complete`,
        type: 'account_onboarding',
      });
    } catch (stripeError: any) {
      console.error('Stripe account link creation error:', stripeError);
      
      // Handle specific Connect not enabled error
      if (stripeError.message && stripeError.message.includes('signed up for Connect')) {
        return new Response(
          JSON.stringify({ 
            error: 'Stripe Connect not enabled',
            message: 'Your Stripe account needs to have Connect enabled. Please visit your Stripe Dashboard, go to the Connect section, and enable Connect for your account. Then update your STRIPE_SECRET_KEY with a Connect-enabled API key.',
            helpUrl: 'https://stripe.com/docs/connect'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Re-throw other Stripe errors
      throw stripeError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        onboarding_url: accountLink.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stripe-connect-onboard:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});