import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { PhoneNumberInput } from '../components/ui/PhoneNumberInput';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Lock, Camera, Save, AlertTriangle, Phone, Shield, UserCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ProfileFormValues = {
  full_name: string;
  email: string;
  role: 'patient' | 'therapist';
  bio: string;
  phone_number: string;
  consent_given: boolean;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const ProfilePage: React.FC = () => {
  const { user, fetchUser, logout } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(user?.consent_given || false);
  
  const { 
    register: registerProfile, 
    handleSubmit: handleSubmitProfile, 
    formState: { errors: profileErrors },
    setValue: setProfileValue
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      role: user?.role || 'patient',
      bio: user?.bio || '',
      phone_number: user?.phone_number || '',
      consent_given: user?.consent_given || false,
    }
  });
  
  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    watch: watchPassword,
    reset: resetPassword
  } = useForm<PasswordFormValues>();
  
  const newPassword = watchPassword('newPassword');
  const navigate = useNavigate();
  
  const handlePhoneNumberChange = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber);
    setPhoneError(null);
    setProfileValue('phone_number', newPhoneNumber);
  };
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  const handleConsentChange = (checked: boolean) => {
    setConsentGiven(checked);
    setProfileValue('consent_given', checked);
  };
  
  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    setPhoneError(null);
    
    try {
      // Validate phone number if provided
      if (phoneNumber && !phoneNumber.includes('+')) {
        setPhoneError('Please select a valid country code and phone number');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          phone_number: phoneNumber || null,
          consent_given: consentGiven,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await fetchUser();
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const onUpdatePassword = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) throw error;
      
      resetPassword();
      setPasswordSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-4 overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <button className="text-sm text-blue-400 hover:underline">
                    Change photo
                  </button>
                </div>
                
                <h3 className="text-lg font-medium text-white mt-2">{user.full_name}</h3>
                <p className="text-gray-400">{user.email}</p>
                
                {user.phone_number && (
                  <div className="mt-2 flex items-center text-gray-400">
                    <Phone className="w-4 h-4 mr-1" />
                    <span className="text-sm">{user.phone_number}</span>
                  </div>
                )}

                {user.consent_given && (
                  <div className="mt-2 flex items-center text-green-400">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm">Phone features enabled</span>
                  </div>
                )}
                
                <div className="mt-6 w-full">
                  <div className="text-sm text-gray-500 mb-2">Member since</div>
                  <div className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {user.role === 'therapist' && (
                <div className="mt-6 w-full">
                  <Link to="/therapist-setup" className="w-full">
                    <Button fullWidth variant="outline">
                      Complete your profile
                    </Button>
                  </Link>
                   
                </div>
              )}
               {/* Logout Button */}
              <div className="mt-8 w-full">
                <Button
                  fullWidth
                  variant="danger"                  
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
           
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                <Input
                  label="Full Name"
                  icon={<User className="h-5 w-5" />}
                  fullWidth
                  {...registerProfile('full_name', { required: 'Full name is required' })}
                  error={profileErrors.full_name?.message}
                />
                
                <Input
                  label="Email"
                  icon={<Mail className="h-5 w-5" />}
                  disabled
                  fullWidth
                  {...registerProfile('email')}
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Account Type</label>
                  <div className="flex items-center space-x-4 p-3  rounded-md">
                    <div className="flex items-center">
                      {user.role === 'therapist' ? (
                        <UserCircle className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <User className="w-5 h-5 text-blue-400 mr-2" />
                      )}
                      <span className="text-gray-500 font-medium">
                        {user.role === 'therapist' ? 'Therapist' : 'Patient'}
                      </span>
                    </div>
                    {user.role === 'therapist' && (
                      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-600 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Contact support to change your account type
                  </p>
                </div>
                
                <PhoneNumberInput
                  label="Phone Number"
                  value={phoneNumber}
              
                  onChange={handlePhoneNumberChange}
                  error={phoneError || ""}
                  disabled={isUpdating}
                  placeholder="Enter your phone number"
                />

                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => handleConsentChange(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-600 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Enable Phone Features
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Allow MindWell to call you for AI coaching sessions. Your phone number will be used securely and never shared with third parties.
                      </div>
                    </div>
                  </label>
                </div>
                
                <TextArea
                  label="Bio"
                  placeholder="Tell us a bit about yourself..."
                  fullWidth
                  rows={4}
                  {...registerProfile('bio')}
                />
                
                {updateError && (
                  <div className="flex items-start p-3 rounded-md bg-red-900/20 border border-red-700 text-red-300">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{updateError}</p>
                  </div>
                )}
                
                {updateSuccess && (
                  <div className="flex items-start p-3 rounded-md bg-green-900/20 border border-green-700 text-green-300">
                    <Save className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Profile updated successfully!</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    disabled={isUpdating}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  fullWidth
                  {...registerPassword('currentPassword', { 
                    required: 'Current password is required' 
                  })}
                  error={passwordErrors.currentPassword?.message}
                />
                
                <Input
                  label="New Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  fullWidth
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    } 
                  })}
                  error={passwordErrors.newPassword?.message}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  fullWidth
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your new password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                  error={passwordErrors.confirmPassword?.message}
                />
                
                {passwordError && (
                  <div className="flex items-start p-3 rounded-md bg-red-900/20 border border-red-700 text-red-300">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{passwordError}</p>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="flex items-start p-3 rounded-md bg-green-900/20 border border-green-700 text-green-300">
                    <Save className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Password updated successfully!</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    isLoading={isUpdatingPassword}
                    disabled={isUpdatingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};