import React, { useState } from 'react';
import { DollarSign, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatPriceFromDollars } from '../../lib/stripe';

type RefundModalProps = {
  appointmentId: string;
  paymentIntentId: string;
  amount: number;
  onRefund: (paymentIntentId: string, reason: string, amount?: number) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
};

export const RefundModal: React.FC<RefundModalProps> = ({
  appointmentId,
  paymentIntentId,
  amount,
  onRefund,
  onClose,
  isLoading = false
}) => {
  const [refundAmount, setRefundAmount] = useState<number>(amount);
  const [reason, setReason] = useState('');
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!reason) {
      setError('Please provide a reason for the refund');
      return;
    }

    if (isPartialRefund && (refundAmount <= 0 || refundAmount > amount)) {
      setError('Please enter a valid refund amount');
      return;
    }

    try {
      await onRefund(
        paymentIntentId, 
        reason, 
        isPartialRefund ? refundAmount : undefined
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process refund');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Process Refund
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="w-4 h-4" />} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Refund Details */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Refund Details</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>Appointment ID:</span>
                <span className="text-gray-400">{appointmentId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Original Amount:</span>
                <span className="text-white">{formatPriceFromDollars(amount)}</span>
              </div>
            </div>
          </div>

          {/* Refund Type */}
          <div>
            <h3 className="text-white font-medium mb-3">Refund Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio"
                  checked={!isPartialRefund}
                  onChange={() => setIsPartialRefund(false)}
                  className="sr-only"
                />
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  !isPartialRefund 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <div className="font-medium text-white">Full Refund</div>
                  <div className="text-xs text-gray-400 mt-1">{formatPriceFromDollars(amount)}</div>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  checked={isPartialRefund}
                  onChange={() => setIsPartialRefund(true)}
                  className="sr-only"
                />
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isPartialRefund 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <div className="font-medium text-white">Partial Refund</div>
                  <div className="text-xs text-gray-400 mt-1">Custom amount</div>
                </div>
              </label>
            </div>
          </div>

          {/* Partial Refund Amount */}
          {isPartialRefund && (
            <div>
              <h3 className="text-white font-medium mb-3">Refund Amount</h3>
              <Input
                type="number"
                min="0.01"
                max={amount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                icon={<DollarSign className="w-4 h-4" />}
                fullWidth
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <h3 className="text-white font-medium mb-3">Reason for Refund</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              placeholder="Please provide a reason for the refund..."
              rows={3}
              required
            />
          </div>

          {/* Important Notes */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">Important Notes</h4>
            <ul className="text-blue-400 text-sm space-y-1">
              <li>• Refunds typically process in 5-10 business days</li>
              <li>• Platform fees are non-refundable for partial refunds</li>
              <li>• The patient will be notified of the refund</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!reason || isLoading || (isPartialRefund && (refundAmount <= 0 || refundAmount > amount))}
              isLoading={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Process Refund
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};