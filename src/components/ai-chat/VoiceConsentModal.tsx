import React from 'react';
import { Mic, Phone, Shield, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

type VoiceConsentModalProps = {
  onConsentGiven: (consent: boolean) => void;
};

export const VoiceConsentModal: React.FC<VoiceConsentModalProps> = ({ onConsentGiven }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-pastel-lavender text-accent-teal mr-3">
            <Mic className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Voice Features Consent</h2>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          MindWell offers voice messaging and phone calls to enhance your AI companion experience. 
          Before enabling these features, we need your permission to:
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start p-4 bg-pastel-lavender/30 rounded-xl border border-pastel-lavender/30 shadow-sm">
            <Mic className="w-5 h-5 text-accent-teal mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">Voice Message Recording</h3>
              <p className="text-sm text-gray-600 mt-1">
                Record your voice messages and convert them to text using secure speech recognition
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-pastel-sage/30 rounded-xl border border-pastel-sage/30 shadow-sm">
            <Phone className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">AI Phone Calls</h3>
              <p className="text-sm text-gray-600 mt-1">
                Place calls to your phone number for personalized AI support during crisis situations
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-1 text-blue-500" /> Privacy & Security
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
              Your voice data is processed securely
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
              Audio is encrypted in transit and at rest
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
              You can change this setting anytime in your profile
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
              Your phone number will only be used for AI companion calls
            </li>
          </ul>
        </div>
        
        <div className="flex justify-between">
          <Button
            onClick={() => onConsentGiven(true)}
            variant="accent"
            icon={<Check className="w-3 h-3" />}
          >
            Allow Voice Features
          </Button>
          <Button
            onClick={() => onConsentGiven(false)}
            variant="outline"
           
            icon={<X className="w-4 h-4" />}
          >
            Not Now
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          You can change these permissions anytime in your profile settings.
        </p>
      </div>
    </div>
  );
};