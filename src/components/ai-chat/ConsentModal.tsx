import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

type ConsentModalProps = {
  onConsentGiven: (consent: boolean) => void;
};

export const ConsentModal: React.FC<ConsentModalProps> = ({ onConsentGiven }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-pastel-teal text-accent-teal mr-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Chat History Settings</h2>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Do you want to save chat history for future reference? This helps us provide better support and allows you to review past conversations.
        </p>
        
        <div className="bg-neutral-light-gray rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Privacy Notice</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 mr-2 flex-shrink-0"></span>
              Your conversations are encrypted and secure
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 mr-2 flex-shrink-0"></span>
              Only you can access your chat history
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 mr-2 flex-shrink-0"></span>
              You can change this setting later in your profile
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 mr-2 flex-shrink-0"></span>
              Data is never shared with third parties
            </li>
          </ul>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={() => onConsentGiven(true)}
            className="flex-1 bg-accent-teal hover:bg-accent-teal/90 text-white flex items-center rounded-xl"
            icon={<Check className="w-4 h-4" />}
          >
            Yes, Save History
          </Button>
          <Button
            onClick={() => onConsentGiven(false)}
            variant="outline" 
            className="flex-1 flex items-center rounded-xl border border-gray-300"
            icon={<X className="w-4 h-4 " />}
          >
            No, Don't Save
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          You can change this preference anytime in your account settings.
        </p>
      </div>
    </div>
  );
};