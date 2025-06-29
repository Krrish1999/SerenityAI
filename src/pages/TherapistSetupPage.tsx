import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { StripeConnectOnboarding } from '../components/stripe/StripeConnectOnboarding';
import { ServiceManagement } from '../components/stripe/ServiceManagement';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';

type TherapistSetupFormValues = {
  specialization: string;
  experience_years: number;
  description: string;
  rate_per_hour: number;
  education: string;
  certifications: string;
};

export const TherapistSetupPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TherapistSetupFormValues>();

  // Check if user is a therapist and redirect if not
  useEffect(() => {
    if (user && user.role !== 'therapist') {
      navigate('/dashboard');
      return;
    }

    // Load existing therapist profile if it exists
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('therapist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          setExistingProfile(data);
          // Pre-populate form with existing data
          setValue('specialization', data.specialization.join(', '));
          setValue('experience_years', data.experience_years);
          setValue('description', data.description);
          setValue('rate_per_hour', data.rate_per_hour);
          setValue('education', data.education.join(', '));
          setValue('certifications', data.certifications.join(', '));
        }
      } catch (error) {
        console.error('Error loading therapist profile:', error);
      }
    };

    loadExistingProfile();
  }, [user, navigate, setValue]);

  const onSubmit = async (data: TherapistSetupFormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Parse arrays from comma-separated strings
      const specializations = data.specialization
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const educationList = data.education
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const certificationsList = data.certifications
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const profileData = {
        user_id: user.id,
        specialization: specializations,
        experience_years: data.experience_years,
        description: data.description,
        rate_per_hour: data.rate_per_hour,
        education: educationList,
        certifications: certificationsList,
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        rating: existingProfile?.rating || 4.5
      };

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('therapist_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile (shouldn't happen with new signup flow, but just in case)
        const { error } = await supabase
          .from('therapist_profiles')
          .insert([profileData]);

        if (error) throw error;
      }

      setSubmitSuccess(true);
      
      // Redirect to therapists page after a short delay
      setTimeout(() => {
        navigate('/therapists');
      }, 2000);

    } catch (error) {
      console.error('Error updating therapist profile:', error);
      setSubmitError('Failed to update therapist profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Profile Updated Successfully!</h1>
          <p className="text-green-300 mb-6">
            Your therapist profile has been updated. You will now appear in the therapist directory.
          </p>
          <p className="text-gray-400 text-sm">
            Redirecting you to the therapists page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/profile')}
          className="mr-4 flex items-center  px-2 rounded-xl"
        >
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold text-gray-600">Complete Your Therapist Profile</h1>
      </div>

      {/* Stripe Connect Setup */}
      <div className="mb-8">
        <StripeConnectOnboarding />
      </div>

      {/* Service Management */}
      <div className="mb-8">
        <ServiceManagement />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <p className="text-gray-400 text-sm">
            Complete your profile to start appearing in the therapist directory and connect with patients.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Specializations"
              placeholder="e.g. Anxiety, Depression, Trauma, Relationships"
              helperText="Separate multiple specializations with commas"
              fullWidth
              {...register('specialization', { 
                required: 'Please enter at least one specialization' 
              })}
              error={errors.specialization?.message}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Years of Experience"
                type="number"
                min="0"
                max="50"
                fullWidth
                {...register('experience_years', { 
                  required: 'Years of experience is required',
                  min: { value: 0, message: 'Experience cannot be negative' },
                  max: { value: 50, message: 'Please enter a valid number of years' }
                })}
                error={errors.experience_years?.message}
              />

              <Input
                label="Rate per Hour ($)"
                type="number"
                min="50"
                max="500"
                step="5"
                fullWidth
                {...register('rate_per_hour', { 
                  required: 'Hourly rate is required',
                  min: { value: 50, message: 'Minimum rate is $50/hour' },
                  max: { value: 500, message: 'Maximum rate is $500/hour' }
                })}
                error={errors.rate_per_hour?.message}
              />
            </div>

            <TextArea
              label="Professional Description"
              placeholder="Describe your therapeutic approach, experience, and what makes you unique as a therapist..."
              rows={6}
              fullWidth
              {...register('description', { 
                required: 'Professional description is required',
                minLength: { value: 100, message: 'Description should be at least 100 characters' }
              })}
              error={errors.description?.message}
              helperText="This will be displayed to potential patients"
            />

            <Input
              label="Education"
              placeholder="e.g. Ph.D. in Clinical Psychology - Stanford University, M.A. in Counseling - UCLA"
              helperText="Separate multiple degrees with commas"
              fullWidth
              {...register('education', { 
                required: 'Educational background is required' 
              })}
              error={errors.education?.message}
            />

            <Input
              label="Certifications & Licenses"
              placeholder="e.g. Licensed Clinical Psychologist, Certified Trauma Therapist, EMDR Certified"
              helperText="Separate multiple certifications with commas"
              fullWidth
              {...register('certifications', { 
                required: 'At least one certification or license is required' 
              })}
              error={errors.certifications?.message}
            />

            {submitError && (
              <div className="flex items-start p-4 rounded-md bg-red-900/20 border border-red-700 text-red-300">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Profile Verification</p>
                  <p>
                    Your profile information will be reviewed for accuracy. Once approved, 
                    you'll be able to accept patient appointments and receive messages.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                icon={<Save className="w-4 h-4" />}
              >
                {existingProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};