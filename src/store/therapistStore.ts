import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { TherapistProfile, TherapistProfileDetails } from '../types';

type TherapistState = {
  therapists: TherapistProfileDetails[];
  currentTherapist: TherapistProfileDetails | null;
  isTherapist: boolean;
  isLoading: boolean;
  error: string | null;
  fetchTherapists: () => Promise<void>;
  fetchTherapistById: (id: string) => Promise<void>;
  searchTherapists: (query: string, specializations?: string[]) => Promise<void>;
  checkTherapistStatus: (userId: string) => Promise<void>;
};

export const useTherapistStore = create<TherapistState>((set) => ({
  therapists: [],
  currentTherapist: null,
  isTherapist: false,
  isLoading: false,
  error: null,
  
  fetchTherapists: async () => {
    try {
      const { data, error } = await supabase
        .from('therapist_profile_details')
        .select('*')
        .order('rating', { ascending: false });
        
      if (error) throw error;
      
      set({ therapists: data as TherapistProfileDetails[] });
    } catch (error) {
      console.error('Error fetching therapists:', error);
      set({ error: 'Failed to load therapists' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchTherapistById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('therapist_profile_details')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentTherapist: data as TherapistProfileDetails });
    } catch (error) {
      console.error('Error fetching therapist:', error);
      set({ error: 'Failed to load therapist information' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  searchTherapists: async (query: string, specializations?: string[]) => {
    set({ isLoading: true });
    try {
      let supabaseQuery = supabase
        .from('therapist_profile_details')
        .select('*');
      if (specializations && specializations.length > 0) {
        supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%, description.ilike.%${query}%`);
      }
      
      const { data, error } = await supabaseQuery;
        
      if (error) throw error;
      
      set({ therapists: data as TherapistProfileDetails[] });
    } catch (error) {
      console.error('Error searching therapists:', error);
      set({ error: 'Failed to search therapists' });
    } finally {
      set({ isLoading: false });
    }
  },

  checkTherapistStatus: async (userId: string) => {
    try {
      // First check user role in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      const isTherapistRole = profile?.role === 'therapist';
      
      // Also check if they have a therapist profile
      if (isTherapistRole) {
        const { data, error } = await supabase
          .from('therapist_profiles')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (error) throw error;
        
        set({ isTherapist: data && data.length > 0 });
      } else {
        set({ isTherapist: false });
      }
    } catch (error) {
      console.error('Error checking therapist status:', error);
      set({ isTherapist: false });
    }
  },
}));