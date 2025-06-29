import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

type SignupFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'therapist';
};

export const SignupForm: React.FC = () => {
  const { signup, error, loading, user, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setFocus
  } = useForm<SignupFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    }
  });
  
  const watchPassword = watch("password");
  const watchRole = watch("role");
  
  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setFormError(null);
  }, [clearError]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Focus on full name field when component mounts
  useEffect(() => {
    setFocus('fullName');
  }, [setFocus]);
  
  const onSubmit = async (data: SignupFormValues) => {
    setFormError(null);
    clearError();
    setSignupSuccess(false);
    
    try {
      await signup(data.email, data.password, data.fullName, data.role);
      
      // Check if user was automatically logged in (email confirmation disabled)
      if (user) {
        navigate('/dashboard');
      } else {
        // Email confirmation required
        setSignupSuccess(true);
      }
    } catch (error: any) {
      console.error('Signup submission error:', error);
      setFormError(error.message || 'Failed to create account. Please try again.');
    }
  };
  
  const displayError = error || formError;
  
  if (signupSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
          <p className="text-gray-600 mb-6">
            Please check your email to confirm your account before logging in.
          </p>
          <Link to="/login">
            <Button fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join MindWell and start your wellness journey</p>
        </div>
        
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{displayError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            id="fullName"
            icon={<User className="h-5 w-5" />}
            fullWidth
            autoComplete="name"
            {...register('fullName', { 
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain letters and spaces'
              }
            })}
            error={errors.fullName?.message}
          />
          
          <Input
            label="Email"
            type="email"
            id="email"
            icon={<Mail className="h-5 w-5" />}
            fullWidth
            autoComplete="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              } 
            })}
            error={errors.email?.message}
          />
          
          <Input
            label="Password"
            type="password"
            id="password"
            icon={<Lock className="h-5 w-5" />}
            fullWidth
            autoComplete="new-password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
              }
            })}
            error={errors.password?.message}
            helperText="Must be at least 8 characters with a mix of letters, numbers and symbols"
          />
          
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            icon={<Lock className="h-5 w-5" />}
            fullWidth
            autoComplete="new-password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === watchPassword || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio"
                  value="patient"
                  {...register('role', { required: 'Please select your role' })}
                  className="sr-only"
                />
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  watchRole === 'patient' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">Patient</div>
                      <div className="text-xs text-gray-400">Seeking mental health support</div>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  value="therapist"
                  {...register('role', { required: 'Please select your role' })}
                  className="sr-only"
                />
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  watchRole === 'therapist' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Therapist</div>
                      <div className="text-xs text-gray-400">Providing mental health services</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="text-sm text-red-400">{errors.role.message}</p>
            )}
          </div>
          
          {watchRole === 'therapist' && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Therapist Account Verification</p>
                  <p>Your account will require verification before you can access therapist features. You'll be contacted within 2-3 business days to complete the verification process.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="agree_terms"
              name="agree_terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="agree_terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>
          
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};