import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Users, CreditCard, AlertCircle, Pause, Play, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import { formatPriceFromDollars } from '../lib/stripe';
import { format, differenceInDays } from 'date-fns';

export const SubscriptionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    subscriptions, 
    isLoading, 
    error, 
    fetchSubscriptions, 
    cancelSubscription, 
    pauseSubscription, 
    resumeSubscription,
    clearError 
  } = useSubscriptionStore();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchSubscriptions(user.id);
    }
  }, [user, fetchSubscriptions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'past_due':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'canceled':
        return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'paused':
        return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getSessionsRemaining = (subscription: any) => {
    if (!subscription.service_quota) return null;
    return Math.max(0, subscription.service_quota - subscription.sessions_used_current_cycle);
  };

  const getDaysUntilRenewal = (subscription: any) => {
    return differenceInDays(new Date(subscription.current_period_end), new Date());
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      await cancelSubscription(subscriptionId, cancelReason);
      setCancelingId(null);
      setCancelReason('');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handlePause = async (subscriptionId: string) => {
    try {
      await pauseSubscription(subscriptionId);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleResume = async (subscriptionId: string) => {
    try {
      await resumeSubscription(subscriptionId);
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-gray-400  flex items-center rounded-xl px-2"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-500">Subscription Management</h1>
            <p className="text-gray-400">Manage your therapy subscription plans</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => user && fetchSubscriptions(user.id)}
          disabled={isLoading}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearError}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-700 rounded-xl w-48"></div>
                      <div className="h-4 bg-gray-700 rounded-xl w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded-xl w-20"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gray-700 rounded-xl"></div>
                    <div className="h-16 bg-gray-700 rounded-xl"></div>
                    <div className="h-16 bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="space-y-6">
          {subscriptions.map((subscription) => {
            const sessionsRemaining = getSessionsRemaining(subscription);
            const daysUntilRenewal = getDaysUntilRenewal(subscription);
            const usagePercentage = subscription.service_quota 
              ? (subscription.sessions_used_current_cycle / subscription.service_quota) * 100 
              : 0;

            return (
              <Card key={subscription.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{subscription.service_name}</CardTitle>
                      <p className="text-gray-400 mt-1">
                        with {subscription.therapist_name}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subscription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Price</span>
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {formatPriceFromDollars(subscription.price_amount || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        per {subscription.billing_interval}
                      </p>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Sessions Used</span>
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {subscription.sessions_used_current_cycle} / {subscription.service_quota}
                      </p>
                      {subscription.service_quota && (
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Next Billing</span>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {daysUntilRenewal} days
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {sessionsRemaining !== null && (
                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-300 font-medium">
                          {sessionsRemaining > 0 
                            ? `${sessionsRemaining} sessions remaining this cycle`
                            : 'No sessions remaining this cycle'
                          }
                        </span>
                        {sessionsRemaining === 0 && (
                          <span className="text-yellow-400 text-sm">
                            Renews in {daysUntilRenewal} days
                          </span>
                        )}
                      </div>
                      {sessionsRemaining === 0 && (
                        <p className="text-blue-400 text-sm">
                          Your sessions will reset on {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {subscription.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(subscription.stripe_subscription_id)}
                          disabled={isLoading}
                          icon={<Pause className="w-4 h-4" />}
                        >
                          Pause
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelingId(subscription.id)}
                          icon={<X className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {subscription.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResume(subscription.stripe_subscription_id)}
                        disabled={isLoading}
                        icon={<Play className="w-4 h-4" />}
                      >
                        Resume
                      </Button>
                    )}

                    {subscription.status === 'past_due' && (
                      <Button
                        size="sm"
                        onClick={() => navigate('/payment-methods')}
                        icon={<CreditCard className="w-4 h-4" />}
                      >
                        Update Payment Method
                      </Button>
                    )}
                  </div>

                  {/* Cancellation Form */}
                  {cancelingId === subscription.id && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                      <h4 className="text-red-300 font-medium mb-3">Cancel Subscription</h4>
                      <p className="text-red-400 text-sm mb-4">
                        Are you sure you want to cancel this subscription? You'll continue to have access until the end of your current billing period.
                      </p>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Optional: Let us know why you're canceling (helps us improve)"
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm mb-4"
                        rows={3}
                      />
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            setCancelingId(null);
                            setCancelReason('');
                          }}
                          variant="outline"
                        >
                          Keep Subscription
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCancel(subscription.stripe_subscription_id)}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm Cancellation
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No active subscriptions</h3>
            <p className="text-gray-400 mb-6">
              You don't have any active therapy subscriptions. Browse therapists to find subscription plans.
            </p>
            <Button onClick={() => navigate('/therapists')}>
              Find a Therapist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};