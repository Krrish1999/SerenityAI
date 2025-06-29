import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useStripeStore } from '../../store/stripeStore';
import { useAuthStore } from '../../store/authStore';

export const StripeConnectOnboarding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { 
    connectStatus, 
    isLoading, 
    error, 
    initiateStripeOnboarding, 
    checkStripeConnectStatus, 
    clearError 
  } = useStripeStore();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);

  // Check URL parameters for onboarding status
  useEffect(() => {
    const onboardingComplete = searchParams.get('onboarding');
    const refreshParam = searchParams.get('refresh');

    if (onboardingComplete === 'complete') {
      setShowSuccess(true);
      // Check status after successful onboarding
      setTimeout(() => {
        checkStripeConnectStatus();
      }, 1000);
    } else if (refreshParam === 'true') {
      setShowRefresh(true);
    }
  }, [searchParams, checkStripeConnectStatus]);

  // Check Stripe Connect status on component mount
  useEffect(() => {
    if (user) {
      checkStripeConnectStatus();
    }
  }, [checkStripeConnectStatus, user]);

  const handleStartOnboarding = async () => {
    clearError();
    const onboardingUrl = await initiateStripeOnboarding();
    
    if (onboardingUrl) {
      // Redirect to Stripe onboarding
      window.location.href = onboardingUrl;
    }
  };

  const handleRefreshStatus = () => {
    checkStripeConnectStatus();
    setShowRefresh(false);
  };

  const getStatusText = () => {
    if (!connectStatus) return 'Not started';
    
    if (connectStatus.onboarding_complete && connectStatus.charges_enabled && connectStatus.payouts_enabled) {
      return 'Fully activated';
    } else if (connectStatus.onboarding_complete) {
      return 'Onboarding complete, pending verification';
    } else {
      return 'Onboarding in progress';
    }
  };

  const getStatusColor = () => {
    if (!connectStatus) return 'text-gray-400';
    
    if (connectStatus.onboarding_complete && connectStatus.charges_enabled && connectStatus.payouts_enabled) {
      return 'text-green-400';
    } else if (connectStatus.onboarding_complete) {
      return 'text-yellow-400';
    } else {
      return 'text-blue-400';
    }
  };

  const isFullyActivated = connectStatus?.onboarding_complete && connectStatus?.charges_enabled && connectStatus?.payouts_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Stripe Connect Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-300 font-medium">Onboarding Completed!</p>
              <p className="text-green-400 text-sm mt-1">
                Your Stripe Connect account has been set up. It may take a few minutes for all features to be activated.
              </p>
            </div>
          </div>
        )}

        {/* Refresh Message */}
        {showRefresh && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-medium">Onboarding Incomplete</p>
              <p className="text-yellow-400 text-sm mt-1">
                It looks like you didn't complete the onboarding process. You can try again or refresh your status.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Status Section */}
        <div className="space-y-4 focus:ring-2 ">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-600">Account Status</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isLoading}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className=" border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Overall Status</span>
                <div className={`w-3 h-3 rounded-full ${
                  isFullyActivated ? 'bg-green-500' : 
                  connectStatus?.onboarding_complete ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>

            <div className="  border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Accept Payments</span>
                <div className={`w-3 h-3 rounded-full ${
                  connectStatus?.charges_enabled ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
              <p className={`text-sm font-medium ${
                connectStatus?.charges_enabled ? 'text-green-400' : 'text-gray-400'
              }`}>
                {connectStatus?.charges_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            <div className=" border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Receive Payouts</span>
                <div className={`w-3 h-3 rounded-full ${
                  connectStatus?.payouts_enabled ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
              <p className={`text-sm font-medium ${
                connectStatus?.payouts_enabled ? 'text-green-400' : 'text-gray-400'
              }`}>
                {connectStatus?.payouts_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        {connectStatus?.requirements && connectStatus.requirements.currently_due?.length > 0 && (
          <div className="bg-gray-600 border border-yellow-700 rounded-lg p-4">
            <h4 className="text-yellow-300 font-medium mb-2">Action Required</h4>
            <p className="text-yellow-400 text-sm mb-3">
              The following information is needed to complete your account setup:
            </p>
            <ul className="text-yellow-400 text-sm space-y-1">
              {connectStatus.requirements.currently_due.map((requirement: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                  {requirement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!connectStatus?.onboarding_complete ? (
            <Button
              onClick={handleStartOnboarding}
              disabled={isLoading}
              isLoading={isLoading}
              className=" p-2 w-full bg-transparent border rounded-xl px-2 ml-2 flex text-center items-center border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 focus:ring-2 focus:ring-accent-teal/50"
              icon={<ExternalLink  />}
            >
              {connectStatus?.account_id ? 'Continue Onboarding' : 'Start Stripe Setup'}
            </Button>
          ) : (
            <div className="flex-1 text-center">
              <div className="inline-flex items-center text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Stripe Connect Setup Complete
              </div>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-gray-600 border border-blue-600/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">About Stripe Connect</h4>
          <ul className="text-blue-400 text-sm space-y-1">
            <li>• Securely accept payments from patients</li>
            <li>• Set your own session rates and payment terms</li>
            <li>• Get paid directly to your bank account</li>
            <li>• Platform fee of 2.9% + 30¢ per transaction</li>
            <li>• All financial data is encrypted and PCI compliant</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};