import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import { CallMeButton } from '../call/CallMeButton';

type CrisisCalloutProps = {
  onDismiss: () => void;
};

export const CrisisCallout: React.FC<CrisisCalloutProps> = ({ onDismiss }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5 my-4 shadow-md animate-fade-in">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-gray-800 font-medium mb-2">
            Would you like me to call you now for a personal check-in?
          </p>
          <p className="text-gray-600 text-sm mb-3">
            I can connect with you by phone for a more personal conversation.
          </p>
          
          <div className="flex items-center space-x-4">
            <CallMeButton />
            
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};