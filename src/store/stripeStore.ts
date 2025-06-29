import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type StripeConnectStatus = {
  onboarding_complete: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  account_id: string | null;
  requirements?: any;
};

type StripeState = {
  connectStatus: StripeConnectStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initiateStripeOnboarding: () => Promise<string | null>;
  checkStripeConnectStatus: () => Promise<void>;
  clearError: () => void;
};

export const useStripeStore = create<StripeState>((set, get) => ({
  connectStatus: null,
  isLoading: false,
  error: null,

  initiateStripeOnboarding: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-connect-onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Stripe onboarding');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate Stripe onboarding');
      }

      return data.onboarding_url;
    } catch (error) {
      console.error('Error initiating Stripe onboarding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Stripe onboarding';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  checkStripeConnectStatus: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-connect-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check Stripe Connect status');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to check Stripe Connect status');
      }

      set({ 
        connectStatus: {
          onboarding_complete: data.onboarding_complete,
          charges_enabled: data.charges_enabled,
          payouts_enabled: data.payouts_enabled,
          account_id: data.account_id,
          requirements: data.requirements,
        }
      });
    } catch (error) {
      console.error('Error checking Stripe Connect status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check Stripe Connect status';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));