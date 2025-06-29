import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageCircle, X, Shield, Heart } from 'lucide-react';
import { Button } from '../ui/Button';

type CrisisInterventionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (response: 'contacted_help' | 'dismissed' | 'saved_resources') => void;
  severityLevel: 'high' | 'medium' | 'low';
};

export const CrisisInterventionModal: React.FC<CrisisInterventionModalProps> = ({
  isOpen,
  onClose,
  onResponse,
  severityLevel
}) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    onResponse('dismissed');
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleContactHelp = () => {
    onResponse('contacted_help');
    onClose();
  };

  const handleSaveResources = () => {
    onResponse('saved_resources');
    // Keep modal open so user can still access resources
  };

  const getModalConfig = () => {
    switch (severityLevel) {
      case 'high':
        return {
          title: 'Immediate Support Available',
          message: 'It sounds like you\'re going through an incredibly difficult time. You don\'t have to face this alone.',
          urgency: 'high',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      case 'medium':
        return {
          title: 'Support Resources',
          message: 'I notice you might be struggling. There are people who want to help and support you.',
          urgency: 'medium',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          title: 'Mental Health Resources',
          message: 'If you\'re experiencing emotional distress, these resources can provide support.',
          urgency: 'low',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500'
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        className={`bg-white rounded-xl shadow-lg max-w-lg w-full border ${config.borderColor} ${config.bgColor} ${
          isClosing ? 'animate-pulse' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-full bg-white shadow-sm ${config.iconColor} mr-3`}>
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{config.title}</h2>
          </div>
          <button
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start mb-6 bg-white p-4 rounded-xl shadow-sm">
            <Heart className="w-5 h-5 text-accent-coral mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 leading-relaxed">{config.message}</p>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-neutral-light-gray rounded-xl p-5 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-accent-teal" />
              Crisis Support Numbers
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="text-gray-800 font-medium">National Suicide Prevention Lifeline</p>
                  <p className="text-gray-500 text-sm">24/7 emotional support</p>
                </div>
                <a 
                  href="tel:988" 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                  onClick={() => onResponse('contacted_help')}
                >
                  Call 988
                </a>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="text-gray-800 font-medium">Crisis Text Line</p>
                  <p className="text-gray-500 text-sm">Text support available</p>
                </div>
                <a 
                  href="sms:741741" 
                  className="bg-accent-teal hover:bg-accent-teal/90 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                  onClick={() => onResponse('contacted_help')}
                >
                  Text HOME
                </a>
              </div>

              {severityLevel === 'high' && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                  <div>
                    <p className="text-gray-800 font-medium">Emergency Services</p>
                    <p className="text-red-600 text-sm">For immediate danger</p>
                  </div>
                  <a 
                    href="tel:911" 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                    onClick={() => onResponse('contacted_help')}
                  >
                    Call 911
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleContactHelp}
              className="flex-1 bg-accent-teal hover:bg-accent-teal/90 text-white font-medium"
              icon={<MessageCircle className="w-4 h-4" />}
            >
              Connect with Professional
            </Button>
            
            <Button
              onClick={handleSaveResources}
              variant="outline" 
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Save Resources
            </Button>
          </div>

          {/* Additional Support Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 flex items-start">
              <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
              Your safety and wellbeing matter. Professional counselors are available 24/7 and conversations are confidential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};