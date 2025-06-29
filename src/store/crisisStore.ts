import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { detectCrisis, createMessageHash, CrisisDetectionResult } from '../utils/crisisDetection';

type CrisisState = {
  isModalOpen: boolean;
  currentDetection: CrisisDetectionResult | null;
  isLogging: boolean;
  error: string | null;
  
  // Actions
  checkMessage: (message: string, userId: string) => Promise<void>;
  openModal: (detection: CrisisDetectionResult) => void;
  closeModal: () => void;
  logUserResponse: (userId: string, response: string) => Promise<void>;
  clearError: () => void;
};

export const useCrisisStore = create<CrisisState>((set, get) => ({
  isModalOpen: false,
  currentDetection: null,
  isLogging: false,
  error: null,

  checkMessage: async (message: string, userId: string) => {
    try {
      // Perform crisis detection
      const detection = detectCrisis(message);
      
      if (detection.isDetected) {
        console.log('Crisis detected:', detection);
        
        // Log the crisis event
        await get().logCrisisEvent(userId, message, detection);
        
        // Open intervention modal
        set({ currentDetection: detection, isModalOpen: true });
      }
    } catch (error) {
      console.error('Error in crisis detection:', error);
      set({ error: 'Failed to process message for crisis detection' });
    }
  },

  openModal: (detection: CrisisDetectionResult) => {
    set({ currentDetection: detection, isModalOpen: true });
  },

  closeModal: () => {
    set({ isModalOpen: false, currentDetection: null });
  },

  logUserResponse: async (userId: string, response: string) => {
    const { currentDetection } = get();
    if (!currentDetection) return;

    set({ isLogging: true });
    
    try {
      // Update the existing crisis event with user response
      const { error } = await supabase
        .from('crisis_events')
        .update({ user_response: response })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      console.log('Crisis response logged:', response);
    } catch (error) {
      console.error('Error logging crisis response:', error);
      set({ error: 'Failed to log crisis response' });
    } finally {
      set({ isLogging: false });
    }
  },

  logCrisisEvent: async (userId: string, message: string, detection: CrisisDetectionResult) => {
    try {
      const messageHash = createMessageHash(message);
      
      const crisisEvent = {
        user_id: userId,
        detected_at: new Date().toISOString(),
        trigger_keywords: detection.triggeredKeywords,
        severity_level: detection.level,
        message_context_hash: messageHash,
        user_response: null // Will be updated when user responds
      };

      const { error } = await supabase
        .from('crisis_events')
        .insert([crisisEvent]);

      if (error) throw error;
      
      console.log('Crisis event logged successfully');
    } catch (error) {
      console.error('Error logging crisis event:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));