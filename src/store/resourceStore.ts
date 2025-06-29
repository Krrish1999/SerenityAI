import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Resource } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

type ResourceState = {
  resources: Resource[];
  featuredResources: Resource[];
  currentResource: Resource | null;
  categories: string[]; // Categories like 'Article', 'Video', etc.
  isLoading: boolean;
  error: string | null;
  realtimeSubscription: RealtimeChannel | null;
  fetchResources: () => Promise<void>;
  fetchFeaturedResources: () => Promise<void>;
  fetchResourceById: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchResources: (query: string, category?: string) => Promise<void>;
  setupRealtimeSubscription: () => void;
  cleanupRealtimeSubscription: () => void;
};

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  featuredResources: [],
  currentResource: null,
  categories: [],
  isLoading: false,
  error: null,
  realtimeSubscription: null,
  
  fetchResources: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ resources: data as Resource[] });

      // Setup realtime subscription after initial fetch
      get().setupRealtimeSubscription();
    } catch (error) {
      console.error('Error fetching resources:', error);
      set({ error: 'Failed to load resources' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setupRealtimeSubscription: () => {
    // Clean up any existing subscription first
    get().cleanupRealtimeSubscription();
    
    // Subscribe to changes on the resources table
    const subscription = supabase
      .channel('resources-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'resources' 
        }, 
        (payload) => {
          // Handle different events
          if (payload.eventType === 'INSERT') {
            // Add new resource to the list
            const newResource = payload.new as Resource;
            set(state => ({ 
              resources: [newResource, ...state.resources] 
            }));
          } else if (payload.eventType === 'UPDATE') {
            // Update existing resource in the list
            const updatedResource = payload.new as Resource;
            set(state => ({
              resources: state.resources.map(resource => 
                resource.id === updatedResource.id ? updatedResource : resource
              ),
              // Update current resource if it's the one being viewed
              currentResource: state.currentResource?.id === updatedResource.id 
                ? updatedResource 
                : state.currentResource
            }));
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted resource from the list
            const deletedId = payload.old.id;
            set(state => ({
              resources: state.resources.filter(resource => resource.id !== deletedId)
            }));
          }
        })
      .subscribe();
      
    set({ realtimeSubscription: subscription });
  },
  
  cleanupRealtimeSubscription: () => {
    const { realtimeSubscription } = get();
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription);
      set({ realtimeSubscription: null });
    }
  },
  
  fetchFeaturedResources: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ featuredResources: data as Resource[] });
    } catch (error) {
      console.error('Error fetching featured resources:', error);
      set({ error: 'Failed to load featured resources' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchResourceById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentResource: data as Resource });
    } catch (error) {
      console.error('Error fetching resource:', error);
      set({ error: 'Failed to load resource' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { resources } = get();
      
      // Try to get categories from stored resources first
      if (resources.length > 0) {
        // Extract all categories from existing resources
        const allCategories = resources.flatMap(item => item.category || []);
        // Remove duplicates
        const uniqueCategories = [...new Set(allCategories)];
        
        if (uniqueCategories.length > 0) {
          set({ categories: uniqueCategories });
          set({ isLoading: false });
          return;
        }
      }
      
      // Fetch categories from the database if no resources are cached
      const { data, error } = await supabase
        .from('resources')
        .select('category')
        .not('category', 'is', null);
        
      if (error) throw error;
      
      // Extract all categories and flatten the array
      const allCategories = data.flatMap(item => item.category);
      // Remove duplicates
      const uniqueCategories = [...new Set(allCategories)];
      
      set({ categories: uniqueCategories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to load categories' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  searchResources: async (query: string, category?: string) => {
    set({ isLoading: true });

    set({ error: null });
    try {
      // Build the query gradually
      const baseQuery = supabase.from('resources').select('*');
      let resourceQuery = baseQuery;

      // Apply search filter if query exists
      if (query) {
        resourceQuery = resourceQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      // Apply category filter if specified
      if (category) {
        resourceQuery = resourceQuery.contains('category', [category]);
      }
      
      // Always order by latest
      resourceQuery = resourceQuery.order('created_at', { ascending: false });
      
      // Execute the query
      const { data, error } = await resourceQuery;
        
      if (error) throw error;
      set({ resources: data as Resource[] });
    } catch (error) {
      console.error('Error searching resources:', error);
      set({ error: 'Failed to search resources' });
    } finally {
      set({ isLoading: false });
    }
  },
}));