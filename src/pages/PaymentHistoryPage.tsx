import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Calendar, DollarSign, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePaymentStore } from '../store/paymentStore';
import { useAuthStore } from '../store/authStore';
import { formatPriceFromDollars } from '../lib/stripe';
import { format } from 'date-fns';

export const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { paymentHistory, isLoading, error, fetchPaymentHistory, clearError } = usePaymentStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed' | 'refunded' | 'free'>('all');

  useEffect(() => {
    if (user) {
      fetchPaymentHistory(user.id);
    }
  }, [user, fetchPaymentHistory]);

  const filteredPayments = paymentHistory.filter(payment => 
    filter === 'all' || payment.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'free':
        return <CheckCircle className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'failed':
        return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'refunded':
        return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'free':
        return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const getTotalByStatus = (status: string) => {
    return filteredPayments
      .filter(payment => payment.status === status)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
            
          >
            Back
          </Button>
          <div className='ml-3'>
            <h1 className="text-2xl font-bold text-gray-600">Payment History</h1>
            <p className="text-gray-400">View and manage your payment transactions</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => user && fetchPaymentHistory(user.id)}
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
            <AlertCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatPriceFromDollars(getTotalByStatus('paid'))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatPriceFromDollars(getTotalByStatus('pending'))}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Refunded</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatPriceFromDollars(getTotalByStatus('refunded'))}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Free Sessions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {paymentHistory.filter(p => p.status === 'free').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'paid', 'pending', 'failed', 'refunded', 'free'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({paymentHistory.filter(p => p.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded-xl w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded-xl w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded-xl w-20"></div>
                </div>
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {payment.service_name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {payment.therapist_name && `with ${payment.therapist_name} • `}
                        {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {payment.stripe_payment_intent_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {payment.stripe_payment_intent_id}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {payment.status === 'free' ? 'Free' : formatPriceFromDollars(payment.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {filter === 'all' ? 'No payments yet' : `No ${filter} payments`}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'Your payment history will appear here once you book sessions.' 
                  : `You don't have any ${filter} payments.`}
              </p>
              <Button onClick={() => navigate('/therapists')}>
                Find a Therapist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};