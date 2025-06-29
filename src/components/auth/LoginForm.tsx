import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const { login, error, loading, user, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setFocus
  } = useForm<LoginFormValues>();
  
  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setFormError(null);
  }, [clearError]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = user.role === 'therapist' ? '/doctor-dashboard' : '/dashboard';
      navigate(redirectPath);
    }
  }, [user, navigate]);
  
  // Focus on email field when component mounts
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);
  
  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    clearError();
    
    try {
      await login(data.email, data.password);
      // Navigation will happen automatically via the useEffect above
    } catch (error: any) {
      console.error('Login submission error:', error);
      setFormError(error.message || 'Failed to login. Please check your credentials.');
    }
  };
  
  const displayError = error || formError;
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your MindWell account</p>
        </div>
        
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{displayError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            id="email"
            placeholder='elsa@gmail.com'
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
            autoComplete="current-password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>
          
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};