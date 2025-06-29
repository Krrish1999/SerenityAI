import React from 'react';
import { Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type CancellationPolicyProps = {
  onAccept: () => void;
  onDecline: () => void;
  sessionPrice: number;
  showActions?: boolean;
};

export const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
  onAccept,
  onDecline,
  sessionPrice,
  showActions = true
}) => {
  const cancellationFee = sessionPrice * 0.5; // 50% fee for late cancellation

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Cancellation Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Free Cancellation */}
          <div className="flex items-start space-x-3 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-green-300 font-medium">Free Cancellation</h3>
              <p className="text-green-400 text-sm mt-1">
                Cancel up to 24 hours before your session for a full refund
              </p>
            </div>
          </div>

          {/* Late Cancellation */}
          <div className="flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-300 font-medium">Late Cancellation (2-24 hours)</h3>
              <p className="text-yellow-400 text-sm mt-1">
                Cancellations made 2-24 hours before session incur a 50% fee (${cancellationFee.toFixed(2)})
              </p>
            </div>
          </div>

          {/* No-Show */}
          <div className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-300 font-medium">No-Show or Last Minute</h3>
              <p className="text-red-400 text-sm mt-1">
                Cancellations within 2 hours or no-shows are charged the full session fee
              </p>
            </div>
          </div>
        </div>

        {/* Rescheduling */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-3">Rescheduling Policy</h4>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
              Free rescheduling up to 24 hours before your session
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
              Rescheduling within 24 hours may incur the same fees as cancellation
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
              Emergency rescheduling (medical, family emergency) reviewed case-by-case
            </li>
          </ul>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Important Notes</h4>
          <ul className="text-blue-400 text-sm space-y-1">
            <li>• All times are based on the scheduled session time</li>
            <li>• Therapists may waive fees for exceptional circumstances</li>
            <li>• Free sessions (using credits) follow the same policy</li>
            <li>• Subscription plans: missed sessions count toward your quota</li>
          </ul>
        </div>

        {showActions && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept & Continue
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};