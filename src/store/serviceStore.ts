import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type TherapistService = {
  id: string;
  therapist_profile_id: string;
  name: string;
  description?: string;
  price_amount: number;
  currency: string;
  type: 'one_time' | 'subscription';
  stripe_product_id: string;
  stripe_price_id: string;
  billing_interval?: 'day' | 'week' | 'month' | 'year';
  session_quota?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ServiceState = {
  services: TherapistService[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchServices: (therapistProfileId: string) => Promise<void>;
  createService: (service: Omit<TherapistService, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<TherapistService>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  clearError: () => void;
};

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async (therapistProfileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('therapist_services')
        .select('*')
        .eq('therapist_profile_id', therapistProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ services: data as TherapistService[] });
    } catch (error) {
      console.error('Error fetching services:', error);
      set({ error: 'Failed to load services' });
    } finally {
      set({ isLoading: false });
    }
  },

  createService: async (service) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('therapist_services')
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      
      const currentServices = get().services;
      set({ services: [data as TherapistService, ...currentServices] });
    } catch (error) {
      console.error('Error creating service:', error);
      set({ error: 'Failed to create service' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateService: async (serviceId: string, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('therapist_services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      
      const currentServices = get().services;
      const updatedServices = currentServices.map(service => 
        service.id === serviceId ? data as TherapistService : service
      );
      set({ services: updatedServices });
    } catch (error) {
      console.error('Error updating service:', error);
      set({ error: 'Failed to update service' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteService: async (serviceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('therapist_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      const currentServices = get().services;
      const filteredServices = currentServices.filter(service => service.id !== serviceId);
      set({ services: filteredServices });
    } catch (error) {
      console.error('Error deleting service:', error);
      set({ error: 'Failed to delete service' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));