import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type PaymentRecord = {
  id: string;
  user_id: string;
  therapist_service_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'free';
  stripe_payment_intent_id?: string;
  stripe_refund_id?: string;
  appointment_id?: string;
  created_at: string;
  refunded_at?: string;
  refund_reason?: string;
  service_name?: string;
  therapist_name?: string;
};

export type EarningsRecord = {
  id: string;
  therapist_id: string;
  service_id: string;
  patient_name: string;
  service_name: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  payment_date: string;
  appointment_id: string;
};

export type PaymentMethod = {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
};

type PaymentState = {
  paymentHistory: PaymentRecord[];
  earnings: EarningsRecord[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPaymentHistory: (userId: string) => Promise<void>;
  fetchEarnings: (therapistId: string) => Promise<void>;
  fetchPaymentMethods: (userId: string) => Promise<void>;
  processRefund: (paymentIntentId: string, reason: string, amount?: number) => Promise<void>;
  addPaymentMethod: (userId: string) => Promise<string>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  clearError: () => void;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  paymentHistory: [],
  earnings: [],
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchPaymentHistory: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          therapist_service:therapist_service_id (
            name,
            price_amount,
            currency,
            therapist_profiles!inner (
              user_id,
              profiles:user_id (
                full_name
              )
            )
          )
        `)
        .eq('client_id', userId)
        .not('payment_status', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const paymentHistory: PaymentRecord[] = data.map(appointment => ({
        id: appointment.id,
        user_id: userId,
        therapist_service_id: appointment.therapist_service?.id || '',
        amount: appointment.therapist_service?.price_amount || 0,
        currency: appointment.therapist_service?.currency || 'usd',
        status: appointment.payment_status as PaymentRecord['status'],
        stripe_payment_intent_id: appointment.stripe_payment_intent_id,
        appointment_id: appointment.id,
        created_at: appointment.created_at,
        service_name: appointment.therapist_service?.name,
        therapist_name: appointment.therapist_service?.therapist_profiles?.profiles?.full_name,
      }));

      set({ paymentHistory });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      set({ error: 'Failed to load payment history' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEarnings: async (therapistId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get therapist profile ID first
      const { data: therapistProfile } = await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('user_id', therapistId)
        .maybeSingle();

      if (!therapistProfile) {
        // Therapist profile doesn't exist yet - return empty earnings
        set({ earnings: [] });
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          created_at,
          payment_status,
          therapist_service:therapist_service_id (
            name,
            price_amount
          ),
          client:client_id (
            full_name
          )
        `)
        .eq('therapist_id', therapistProfile.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const earnings: EarningsRecord[] = data.map(appointment => {
        const amount = appointment.therapist_service?.price_amount || 0;
        const platformFee = amount * 0.05; // 5% platform fee
        const netAmount = amount - platformFee;

        return {
          id: appointment.id,
          therapist_id: therapistId,
          service_id: appointment.therapist_service?.id || '',
          patient_name: appointment.client?.full_name || 'Unknown',
          service_name: appointment.therapist_service?.name || 'Unknown Service',
          amount,
          platform_fee: platformFee,
          net_amount: netAmount,
          status: appointment.payment_status,
          payment_date: appointment.created_at,
          appointment_id: appointment.id,
        };
      });

      set({ earnings });
    } catch (error) {
      console.error('Error fetching earnings:', error);
      set({ error: 'Failed to load earnings' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPaymentMethods: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // This would typically call a Stripe API via Edge Function
      // For now, we'll return empty array as payment methods are handled by Stripe Elements
      set({ paymentMethods: [] });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      set({ error: 'Failed to load payment methods' });
    } finally {
      set({ isLoading: false });
    }
  },

  processRefund: async (paymentIntentId: string, reason: string, amount?: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/process-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          reason,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process refund');
      }

      // Update local state
      const paymentHistory = get().paymentHistory.map(payment => 
        payment.stripe_payment_intent_id === paymentIntentId
          ? { ...payment, status: 'refunded' as const, refund_reason: reason }
          : payment
      );
      set({ paymentHistory });
    } catch (error) {
      console.error('Error processing refund:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to process refund' });
    } finally {
      set({ isLoading: false });
    }
  },

  addPaymentMethod: async (userId: string) => {
    // This would return a setup intent client secret for adding payment methods
    // Implementation would be similar to payment intent creation
    throw new Error('Payment method management via Stripe Customer Portal');
  },

  removePaymentMethod: async (paymentMethodId: string) => {
    // Implementation for removing payment methods
    throw new Error('Payment method management via Stripe Customer Portal');
  },

  setDefaultPaymentMethod: async (paymentMethodId: string) => {
    // Implementation for setting default payment method
    throw new Error('Payment method management via Stripe Customer Portal');
  },

  clearError: () => set({ error: null }),
}));