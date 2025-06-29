import React, { useEffect, useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, RefreshCw, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePaymentStore } from '../store/paymentStore';
import { useAuthStore } from '../store/authStore';
import { formatPriceFromDollars } from '../lib/stripe';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const EarningsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { earnings, isLoading, error, fetchEarnings, clearError } = usePaymentStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'this_month' | 'last_month' | 'last_3_months' | 'all_time'>('this_month');

  useEffect(() => {
    if (user) {
      fetchEarnings(user.id);
    }
  }, [user, fetchEarnings]);

  const getFilteredEarnings = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'this_month':
        startDate = startOfMonth(now);
        break;
      case 'last_month':
        startDate = startOfMonth(subMonths(now, 1));
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 3));
        break;
      default:
        return earnings;
    }

    return earnings.filter(earning => {
      const earningDate = new Date(earning.payment_date);
      return earningDate >= startDate;
    });
  };

  const filteredEarnings = getFilteredEarnings();

  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.net_amount, 0);
  const totalRevenue = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  const totalFees = filteredEarnings.reduce((sum, earning) => sum + earning.platform_fee, 0);
  const sessionCount = filteredEarnings.length;

  const averageSessionValue = sessionCount > 0 ? totalRevenue / sessionCount : 0;

  const exportEarnings = () => {
    const csvContent = [
      ['Date', 'Patient', 'Service', 'Amount', 'Platform Fee', 'Net Amount'].join(','),
      ...filteredEarnings.map(earning => [
        format(new Date(earning.payment_date), 'yyyy-MM-dd'),
        earning.patient_name,
        earning.service_name,
        earning.amount.toFixed(2),
        earning.platform_fee.toFixed(2),
        earning.net_amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnings-${selectedPeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            onClick={() => navigate('/doctor-dashboard')}
           
          >
            Back
          </Button>
          <div className='pl-2 ml-2'>
            <h1 className="text-2xl font-bold text-gray-500">Earnings Dashboard</h1>
            <p className="text-gray-400">Track your therapy session earnings and payouts</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={exportEarnings}
            disabled={filteredEarnings.length === 0}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => user && fetchEarnings(user.id)}
            disabled={isLoading}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'this_month', label: 'This Month' },
          { key: 'last_month', label: 'Last Month' },
          { key: 'last_3_months', label: 'Last 3 Months' },
          { key: 'all_time', label: 'All Time' }
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatPriceFromDollars(totalEarnings)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  After platform fees
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
                <p className="text-sm text-gray-400">Gross Revenue</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatPriceFromDollars(totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Before platform fees
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sessions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {sessionCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Completed sessions
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Session Value</p>
                <p className="text-2xl font-bold text-teal-400">
                  {formatPriceFromDollars(averageSessionValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Per session (gross)
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Gross Revenue</span>
                <span className="text-white font-medium">
                  {formatPriceFromDollars(totalRevenue)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Platform Fees (5%)</span>
                <span className="text-red-400 font-medium">
                  -{formatPriceFromDollars(totalFees)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Your Earnings (95%)</span>
                <span className="text-green-400 font-medium">
                  {formatPriceFromDollars(totalEarnings)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Earnings History
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
          ) : filteredEarnings.length > 0 ? (
            <div className="space-y-4">
              {filteredEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {earning.service_name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {earning.patient_name} • {format(new Date(earning.payment_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-green-400">
                      +{formatPriceFromDollars(earning.net_amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Gross: {formatPriceFromDollars(earning.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Fee: {formatPriceFromDollars(earning.platform_fee)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No earnings yet</h3>
              <p className="text-gray-400 mb-6">
                Your earnings from completed sessions will appear here.
              </p>
              <Button onClick={() => navigate('/therapist-setup')}>
                Complete Profile Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};