import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string, role: 'patient' | 'therapist') => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  initializeAuth: async () => {
    if (get().initialized) return;
    
    set({ loading: true, error: null });
    try {
      // Check if there's a stored session that might be invalid
      const storedSession = localStorage.getItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
      
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = Math.floor(Date.now() / 1000);
          
          // Check if the refresh token exists and if the access token is expired
          if (!sessionData.refresh_token || 
              (sessionData.expires_at && sessionData.expires_at < now)) {
            // Clear potentially invalid session data
            localStorage.removeItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
            await supabase.auth.signOut();
          }
        } catch (e) {
          // Invalid session data format, clear it
          localStorage.removeItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
          await supabase.auth.signOut();
        }
      }
      
      // Now fetch the user
      await get().fetchUser();
      set({ initialized: true });
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      // Clear any problematic session state
      localStorage.removeItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
      await supabase.auth.signOut();
      set({ user: null, error: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },
  fetchUser: async () => {
    if (!get().initialized) {
      set({ loading: true, error: null });
    }
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        // Check if the error is related to invalid refresh token
        if (sessionError.message?.includes('Invalid Refresh Token') || 
            sessionError.message?.includes('refresh_token_not_found') ||
            sessionError.message?.includes('Refresh Token Not Found')) {
          // Clear the invalid session and set user to null
          localStorage.removeItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
          await supabase.auth.signOut();
          set({ user: null, error: null });
          return;
        }
        throw sessionError;
      }

      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          set({ user: data as User });
        } else {
          set({ user: null });
        }
      } else {
        set({ user: null });
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      
      // Check if the error is related to authentication/refresh token issues
      if (error.message?.includes('Invalid Refresh Token') || 
          error.message?.includes('refresh_token_not_found') ||
          error.message?.includes('Refresh Token Not Found') ||
          error.message?.includes('JWT expired')) {
        // Clear the invalid session and set user to null without showing error
        localStorage.removeItem('sb-ipfljxhqrwbdxvjnluuf-auth-token');
        await supabase.auth.signOut();
        set({ user: null, error: null });
      } else {
        set({ error: 'Failed to fetch user information' });
      }
    } finally {
      if (!get().initialized) {
        set({ loading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error('Failed to fetch user profile');
        }
        
        // If profile doesn't exist, create one
        if (!profile) {
          console.log('Profile not found, creating new profile for user:', data.user.id);
          
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name || 
                          'User';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email.trim().toLowerCase(),
              full_name: fullName,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Profile creation error:', createError);
            throw new Error('Failed to create user profile. Please contact support.');
          }
          
          profile = newProfile;
        }
        
        set({ user: profile as User, error: null });
      } else {
        throw new Error('Login failed - no user data returned');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, full_name, role) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password,
        options: {
          data: {
            full_name: full_name.trim(),
            role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create profile immediately after signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email.trim().toLowerCase(),
            full_name: full_name.trim(),
            role,
            created_at: new Date().toISOString(),
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Throw the error to prevent inconsistent state
          throw new Error('Failed to create user profile. Please try again or contact support.');
        }
        
        // If user is a therapist, create a basic therapist profile
        if (role === 'therapist') {
          const { error: therapistProfileError } = await supabase
            .from('therapist_profiles')
            .insert({
              user_id: data.user.id,
              specialization: ['General Counseling'],
              experience_years: 1,
              description: `I am a licensed therapist dedicated to helping clients achieve better mental health. Please contact me to learn more about my approach and specializations.`,
              rate_per_hour: 100.00,
              availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              education: ['Licensed Mental Health Professional'],
              certifications: ['Licensed Therapist'],
              rating: 4.5
            });
            
          if (therapistProfileError) {
            console.error('Therapist profile creation error:', therapistProfileError);
            // Don't throw error here as basic profile was created successfully
          }
        }
        
        // If email confirmation is disabled, the user should be logged in automatically
        if (data.session) {
          // User is automatically logged in
          await get().fetchUser();
        } else {
          // Email confirmation required
          set({ 
            error: null,
            user: null 
          });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password does not meet requirements. Please choose a stronger password.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Failed to create user profile')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ error: 'Logout failed. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },
}));