import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { PatientSummary, PatientDetails, Message } from '../types';

type DoctorState = {
  patients: PatientSummary[];
  selectedPatient: PatientSummary | null;
  patientDetails: PatientDetails | null;
  patientMessages: Message[];
  moodData: Array<{ date: string; mood: number }>;
  journalEntries: any[];
  crisisEvents: any[];
  crisisAlerts: any[];
  stats: {
    total_patients: number;
    active_patients: number;
    upcoming_appointments: number;
    avg_patient_engagement: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPatients: (doctorId: string) => Promise<void>;
  fetchCrisisAlerts: (doctorId: string) => Promise<void>;
  fetchDoctorStats: (doctorId: string) => Promise<void>;
  selectPatient: (patientId: string) => void;
  fetchPatientDetails: (patientId: string) => Promise<void>;
  fetchPatientMoodData: (patientId: string) => Promise<void>;
  fetchPatientJournal: (patientId: string) => Promise<void>;
  fetchPatientCrisisEvents: (patientId: string) => Promise<void>;
  fetchPatientMessages: (doctorId: string, patientId: string) => Promise<void>;
  sendPatientMessage: (doctorId: string, patientId: string, content: string) => Promise<void>;
};

export const useDoctorStore = create<DoctorState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  patientDetails: null,
  patientMessages: [],
  moodData: [],
  journalEntries: [],
  crisisEvents: [],
  crisisAlerts: [],
  stats: {
    total_patients: 0,
    active_patients: 0,
    upcoming_appointments: 0,
    avg_patient_engagement: 0,
  },
  isLoading: false,
  error: null,

  fetchPatients: async (doctorId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get patients who have appointments with this doctor
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          client_id,
          profiles:client_id (
            id,
            full_name,
            email,
            created_at
          )
        `)
        .eq('therapist_id', doctorId);

      if (error) throw error;

      // Get unique patients and their additional data
      const uniquePatientIds = [...new Set(data.map(item => item.client_id))];
      const patientPromises = uniquePatientIds.map(async (patientId) => {
        // Get patient profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', patientId)
          .single();

        // Get mood data for average calculation
        const { data: moodData } = await supabase
          .from('mood_entries')
          .select('mood')
          .eq('user_id', patientId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Get journal count
        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', patientId);

        // Check for crisis alerts
        const { data: crisisData } = await supabase
          .from('crisis_events')
          .select('*')
          .eq('user_id', patientId)
          .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('detected_at', { ascending: false })
          .limit(1);

        // Get next appointment
        const { data: nextAppointment } = await supabase
          .from('appointments')
          .select('date_time')
          .eq('client_id', patientId)
          .eq('therapist_id', doctorId)
          .eq('status', 'scheduled')
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(1);

        // Calculate age
        const birthYear = new Date(profile?.created_at || '').getFullYear();
        const age = new Date().getFullYear() - birthYear + 20; // Mock age calculation

        // Calculate engagement score (mock)
        const engagementScore = Math.min(100, Math.max(0, 
          (journalCount || 0) * 10 + (moodData?.length || 0) * 5 + Math.random() * 20
        ));

        // Calculate average mood
        const avgMood = moodData && moodData.length > 0 
          ? moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length 
          : 3;

        // Determine status
        let status: 'stable' | 'monitoring' | 'crisis' = 'stable';
        if (crisisData && crisisData.length > 0) {
          status = crisisData[0].severity_level === 'high' ? 'crisis' : 'monitoring';
        } else if (avgMood < 2.5) {
          status = 'monitoring';
        }

        return {
          id: patientId,
          full_name: profile?.full_name || 'Unknown',
          age,
          status,
          avg_mood: Math.round(avgMood * 10) / 10,
          journal_count: journalCount || 0,
          engagement_score: Math.round(engagementScore),
          has_crisis_alert: crisisData && crisisData.length > 0,
          next_appointment: nextAppointment?.[0]?.date_time,
          last_activity: profile?.created_at,
          last_mood_entry: moodData?.[0]?.created_at,
        } as PatientSummary;
      });

      const patients = await Promise.all(patientPromises);
      set({ patients, isLoading: false });
    } catch (error) {
      console.error('Error fetching patients:', error);
      set({ error: 'Failed to fetch patients', isLoading: false });
    }
  },

  fetchCrisisAlerts: async (doctorId: string) => {
    try {
      // Get recent crisis events for all patients of this doctor
      const { data, error } = await supabase
        .from('crisis_events')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('detected_at', { ascending: false });

      if (error) throw error;

      const crisisAlerts = data.map(alert => ({
        ...alert,
        patient_name: alert.profiles.full_name
      }));

      set({ crisisAlerts });
    } catch (error) {
      console.error('Error fetching crisis alerts:', error);
    }
  },

  fetchDoctorStats: async (doctorId: string) => {
    try {
      const { patients } = get();
      
      // Calculate stats from current patients
      const totalPatients = patients.length;
      const activePatients = patients.filter(p => 
        p.last_activity && 
        new Date(p.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      
      const upcomingAppointments = patients.filter(p => p.next_appointment).length;
      const avgEngagement = patients.length > 0 
        ? patients.reduce((sum, p) => sum + p.engagement_score, 0) / patients.length
        : 0;

      set({
        stats: {
          total_patients: totalPatients,
          active_patients: activePatients,
          upcoming_appointments: upcomingAppointments,
          avg_patient_engagement: Math.round(avgEngagement),
        }
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  },

  selectPatient: (patientId: string) => {
    const { patients } = get();
    const patient = patients.find(p => p.id === patientId);
    set({ selectedPatient: patient || null });
  },

  fetchPatientDetails: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      set({ patientDetails: data });
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  },

  fetchPatientMoodData: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood, created_at')
        .eq('user_id', patientId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const moodData = data.map(entry => ({
        date: entry.created_at,
        mood: entry.mood
      }));

      set({ moodData });
    } catch (error) {
      console.error('Error fetching mood data:', error);
    }
  },

  fetchPatientJournal: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      set({ journalEntries: data });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  },

  fetchPatientCrisisEvents: async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('crisis_events')
        .select('*')
        .eq('user_id', patientId)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      set({ crisisEvents: data });
    } catch (error) {
      console.error('Error fetching crisis events:', error);
    }
  },

  fetchPatientMessages: async (doctorId: string, patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${doctorId},recipient_id.eq.${patientId}),and(sender_id.eq.${patientId},recipient_id.eq.${doctorId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ patientMessages: data });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  sendPatientMessage: async (doctorId: string, patientId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: doctorId,
          recipient_id: patientId,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      const { patientMessages } = get();
      set({ patientMessages: [...patientMessages, data] });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
}));