import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type PatientSubscription = {
  id: string;
  patient_id: string;
  therapist_service_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'paused';
  current_period_start: string;
  current_period_end: string;
  sessions_used_current_cycle: number;
  created_at: string;
  updated_at: string;
  // Joined data
  service_name?: string;
  service_quota?: number;
  therapist_name?: string;
  price_amount?: number;
  billing_interval?: string;
};

type SubscriptionState = {
  subscriptions: PatientSubscription[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSubscriptions: (userId: string) => Promise<void>;
  createSubscription: (serviceId: string) => Promise<string>; // Returns checkout session ID
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>;
  pauseSubscription: (subscriptionId: string) => Promise<void>;
  resumeSubscription: (subscriptionId: string) => Promise<void>;
  updateSessionUsage: (subscriptionId: string, sessionsUsed: number) => Promise<void>;
  clearError: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchSubscriptions: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .select(`
          *,
          therapist_services!inner (
            name,
            session_quota,
            price_amount,
            billing_interval,
            therapist_profiles!inner (
              user_id,
              profiles:user_id (
                full_name
              )
            )
          )
        `)
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subscriptions: PatientSubscription[] = data.map(sub => ({
        ...sub,
        service_name: sub.therapist_services.name,
        service_quota: sub.therapist_services.session_quota,
        price_amount: sub.therapist_services.price_amount,
        billing_interval: sub.therapist_services.billing_interval,
        therapist_name: sub.therapist_services.therapist_profiles.profiles.full_name,
      }));

      set({ subscriptions });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ error: 'Failed to load subscriptions' });
    } finally {
      set({ isLoading: false });
    }
  },

  createSubscription: async (serviceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ service_id: serviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      return data.checkout_session_id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create subscription' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Update local state
      const subscriptions = get().subscriptions.map(sub =>
        sub.stripe_subscription_id === subscriptionId
          ? { ...sub, status: 'canceled' as const }
          : sub
      );
      set({ subscriptions });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to cancel subscription' });
    } finally {
      set({ isLoading: false });
    }
  },

  pauseSubscription: async (subscriptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/pause-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pause subscription');
      }

      // Update local state
      const subscriptions = get().subscriptions.map(sub =>
        sub.stripe_subscription_id === subscriptionId
          ? { ...sub, status: 'paused' as const }
          : sub
      );
      set({ subscriptions });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to pause subscription' });
    } finally {
      set({ isLoading: false });
    }
  },

  resumeSubscription: async (subscriptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/resume-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume subscription');
      }

      // Update local state
      const subscriptions = get().subscriptions.map(sub =>
        sub.stripe_subscription_id === subscriptionId
          ? { ...sub, status: 'active' as const }
          : sub
      );
      set({ subscriptions });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to resume subscription' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSessionUsage: async (subscriptionId: string, sessionsUsed: number) => {
    try {
      const { error } = await supabase
        .from('patient_subscriptions')
        .update({ sessions_used_current_cycle: sessionsUsed })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Update local state
      const subscriptions = get().subscriptions.map(sub =>
        sub.id === subscriptionId
          ? { ...sub, sessions_used_current_cycle: sessionsUsed }
          : sub
      );
      set({ subscriptions });
    } catch (error) {
      console.error('Error updating session usage:', error);
    }
  },

  clearError: () => set({ error: null }),
}));