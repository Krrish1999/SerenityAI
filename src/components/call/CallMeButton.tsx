import React, { useState } from 'react';
import { Phone, Loader2, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

export const CallMeButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();

  const handleCallMe = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Check if user has given consent
    if (!user.consent_given) {
      setError('Please enable consent in your profile to use phone features');
      return;
    }

    // Check if user has a phone number
    if (!user.phone_number) {
      setError('Please add a phone number to your profile first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Construct the correct edge function URL
      const functionUrl = `${supabaseUrl}/functions/v1/place-call`;
      
      console.log('Calling edge function at:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          
          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text as is
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (textError) {
          console.error('Error reading response text:', textError);
        }

        // Provide specific error messages for common issues
        if (response.status === 404) {
          errorMessage = 'Call service not available. Please contact support.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please try logging in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        setError(errorMessage);
        return;
      }

      // Check if response has JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText);
        setError('Invalid response from server. Please try again.');
        return;
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (data.success) {
        setSuccess(true);
        console.log('Call placed successfully:', data.callSid);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Network error placing call:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to call service. Please try again later.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Log to Sentry if available
      if (window.Sentry) {
        window.Sentry.captureException(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Show different states based on user setup
  if (!user.consent_given) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Enable consent to use phone features</span>
      </div>
    );
  }

  if (!user.phone_number) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Phone className="w-4 h-4" />
        <span className="text-sm">Add phone number to enable calls</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={handleCallMe}
        disabled={isLoading}
        className="bg-accent-coral hover:bg-accent-coral/90 text-white font-medium px-4 py-2 rounded-pill shadow-md transition-all duration-200 flex items-center space-x-2 animate-bounce-gentle"
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Calling...</span>
          </>
        ) : (
          <>
            <Phone className="w-5 h-5" />
            <span> Call Me</span>
          </>
        )}
      </Button>
      
      {success && (
        <div className="flex items-center space-x-1 text-green-500 text-xs animate-pulse-slow">
          <Phone className="w-3.5 h-3.5" />
          <span>Calling you now... 📞</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-500 text-xs max-w-xs bg-red-50 p-1.5 rounded shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </div>
  );
};