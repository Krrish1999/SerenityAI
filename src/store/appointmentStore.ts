import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';

type AppointmentState = {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: (userId: string) => Promise<void>;
  createAppointment: (therapistId: string, clientId: string, dateTime: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => Promise<void>;
  rescheduleAppointment: (appointmentId: string, newDateTime: string, reason?: string) => Promise<void>;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,
  
  fetchAppointments: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Check if user is a therapist
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const isTherapist = profile?.role === 'therapist';
      
      // Get therapist profile ID if user is a therapist
      let therapistProfileId;
      if (isTherapist) {
        const { data: therapistProfile } = await supabase
          .from('therapist_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        therapistProfileId = therapistProfile?.id;
      }

      // Enhanced query that joins with related tables
      const query = `
        *,
        therapist_profile:therapist_id (
          *,
          profiles!therapist_profiles_user_id_fkey (
            full_name
          )
        ),
        client:client_id (
          full_name
        ),
        therapist_service:therapist_service_id (
          name,
          price_amount,
          currency,
          type
        )
      `;

      const { data, error } = await supabase
        .from('appointments')
        .select(query)
        .or(
          isTherapist && therapistProfileId 
            ? `therapist_id.eq.${therapistProfileId},client_id.eq.${userId}` 
            : `client_id.eq.${userId}`
        )
        .order('date_time', { ascending: true });
        
      if (error) throw error;
      
      set({ appointments: data as Appointment[] });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ error: 'Failed to load appointments' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createAppointment: async (therapistId: string, clientId: string, dateTime: string) => {
    set({ isLoading: true });
    
    try {
      const newAppointment = {
        therapist_id: therapistId,
        client_id: clientId,
        date_time: dateTime,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select();
        
      if (error) throw error;
      
      // Update local state
      const appointments = get().appointments;
      set({ appointments: [...appointments, data[0] as Appointment] });
    } catch (error) {
      console.error('Error creating appointment:', error);
      set({ error: 'Failed to create appointment' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateAppointmentStatus: async (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      // Update local state
      const appointments = get().appointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status } 
          : appointment
      );
      
      set({ appointments });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      set({ error: 'Failed to update appointment status' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  rescheduleAppointment: async (appointmentId: string, newDateTime: string, reason?: string) => {
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

      const response = await fetch(`${supabaseUrl}/functions/v1/reschedule-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          new_date_time: newDateTime,
          reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule appointment');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to reschedule appointment' });
    } finally {
      set({ isLoading: false });
    }
  }
}));