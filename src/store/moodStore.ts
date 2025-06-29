import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { MoodEntry } from '../types';

type MoodState = {
  entries: MoodEntry[];
  isLoading: boolean;
  error: string | null;
  fetchMoodEntries: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  addMoodEntry: (userId: string, mood: number, note?: string) => Promise<void>;
};

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  
  fetchMoodEntries: async (userId: string, startDate?: string, endDate?: string) => {
    set({ isLoading: true });
    try {
      let query = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId);
        
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ entries: data as MoodEntry[] });
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      set({ error: 'Failed to load mood entries' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addMoodEntry: async (userId: string, mood: number, note?: string) => {
    set({ isLoading: true });
    
    try {
      const newEntry = {
        user_id: userId,
        mood,
        note: note || '',
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('mood_entries')
        .insert([newEntry]);
        
      if (error) throw error;
      
      // Refresh the mood entries after adding - maintain current date range
      const currentRange = get().entries.length > 0 ? 'current' : 'all';
      await get().fetchMoodEntries(userId);
    } catch (error) {
      console.error('Error adding mood entry:', error);
      set({ error: 'Failed to add mood entry' });
    } finally {
      set({ isLoading: false });
    }
  },
}));