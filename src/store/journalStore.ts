import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { JournalEntry } from '../types';

type JournalState = {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
  fetchJournalEntries: (userId: string) => Promise<void>;
  fetchJournalEntry: (entryId: string) => Promise<void>;
  createJournalEntry: (userId: string, title: string, content: string, mood: number, tags?: string[]) => Promise<void>;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (entryId: string) => Promise<void>;
};

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  
  fetchJournalEntries: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ entries: data as JournalEntry[] });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      set({ error: 'Failed to load journal entries' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchJournalEntry: async (entryId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();
        
      if (error) throw error;
      
      set({ currentEntry: data as JournalEntry });
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      set({ error: 'Failed to load journal entry' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createJournalEntry: async (userId: string, title: string, content: string, mood: number, tags?: string[]) => {
    set({ isLoading: true });
    
    try {
      const newEntry = {
        user_id: userId,
        title,
        content,
        mood,
        tags: tags || [],
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([newEntry])
        .select();
        
      if (error) throw error;
      
      // Update local state
      const entries = get().entries;
      set({ entries: [data[0] as JournalEntry, ...entries] });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      set({ error: 'Failed to create journal entry' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateJournalEntry: async (entryId: string, updates: Partial<JournalEntry>) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', entryId);
        
      if (error) throw error;
      
      // Update local state
      const entries = get().entries.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
      
      set({ 
        entries,
        currentEntry: get().currentEntry?.id === entryId 
          ? { ...get().currentEntry!, ...updates } 
          : get().currentEntry
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      set({ error: 'Failed to update journal entry' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteJournalEntry: async (entryId: string) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
        
      if (error) throw error;
      
      // Update local state
      const entries = get().entries.filter(entry => entry.id !== entryId);
      set({ 
        entries,
        currentEntry: get().currentEntry?.id === entryId ? null : get().currentEntry
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      set({ error: 'Failed to delete journal entry' });
    } finally {
      set({ isLoading: false });
    }
  },
}));