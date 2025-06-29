import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bot, AlertTriangle, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AIChatMessageList } from '../components/ai-chat/AIChatMessageList';
import { AIChatInput } from '../components/ai-chat/AIChatInput';
import { ConsentModal } from '../components/ai-chat/ConsentModal';
import { CrisisInterventionModal } from '../components/ai-chat/CrisisInterventionModal';
import { CrisisCallout } from '../components/ai-chat/CrisisCallout';
import { VoiceConsentModal } from '../components/ai-chat/VoiceConsentModal';
import { CallMeButton } from '../components/call/CallMeButton';
import { useAIChatStore } from '../store/aiChatStore';
import { useCrisisStore } from '../store/crisisStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { detectCrisis } from '../utils/crisisDetection';

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [showCrisisCallout, setShowCrisisCallout] = useState(false);
  const {
    messages,
    isLoading,
    error,
    consentGiven,
    voiceConsentGiven,
    init,
    setConsent,
    setVoiceConsent,
    sendMessage,
    fetchChatHistory,
    clearError,
  } = useAIChatStore();

  const {
    isModalOpen: isCrisisModalOpen,
    currentDetection,
    closeModal: closeCrisisModal,
    logUserResponse,
  } = useCrisisStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user && consentGiven === true) {
      fetchChatHistory(user.id);
    }
  }, [user, consentGiven, fetchChatHistory]);

  // Effect to check for crisis indicators in the latest message
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only check if the message is from the user
      if (latestMessage.sender === 'user') {
        const detection = detectCrisis(latestMessage.content);
        if (detection.isDetected) {
          setShowCrisisCallout(true);
        }
      }
    }
  }, [messages]);

  const handleConsentGiven = (consent: boolean) => {
    setConsent(consent);
    if (consent && user) {
      fetchChatHistory(user.id);
    }
  };

  const handleVoiceConsentGiven = (consent: boolean) => {
    setVoiceConsent(consent);
  };

  const handleSendMessage = (messageContent: string | Blob) => {
    if (user) {
      sendMessage(user.id, messageContent);
    }
  };

  const handleCrisisResponse = async (response: 'contacted_help' | 'dismissed' | 'saved_resources') => {
    if (user) {
      await logUserResponse(user.id, response);
    }
    
    if (response === 'contacted_help') {
      closeCrisisModal();
    } else if (response === 'dismissed') {
      closeCrisisModal();
    }
    
    // If they contacted help or saved resources, hide the callout
    if (response !== 'dismissed') {
      setShowCrisisCallout(false);
    }
  };
  
  const handleDismissCallout = () => {
    setShowCrisisCallout(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-accent-teal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[700px] bg-neutral-off-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4 text-gray-600" />}
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-gray-600 flex items-center px-2 rounded-xl hover:text-accent-teal"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl h-full flex flex-col border border-gray-200 shadow-md">
        {/* Header with title and tabs */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Mindfulness Companion</h1>
          <div className="flex border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 rounded-t-lg ${
                activeTab === 'chat'
                  ? 'text-accent-teal border-accent-teal bg-pastel-teal/10'
                  : 'text-gray-600 border-transparent hover:text-accent-teal hover:bg-gray-50'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ml-6 rounded-t-lg ${
                activeTab === 'call'
                  ? 'text-accent-teal border-accent-teal bg-pastel-teal/10'
                  : 'text-gray-600 border-transparent hover:text-accent-teal hover:bg-gray-50'
              }`}
            >
              Call
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 w-5 h-5 mr-2" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <>
            <AIChatMessageList messages={messages} isLoading={isLoading} />
            
            {/* Crisis Callout (conditionally rendered) */}
            {showCrisisCallout && (
              <div className="px-6">
                <CrisisCallout onDismiss={handleDismissCallout} />
              </div>
            )}
            <AIChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-light-gray/50 p-4 rounded-xl m-6">
            <div className="text-center">
              <div className="p-5 rounded-full bg-pastel-teal shadow-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Phone className="w-10 h-10 text-accent-teal" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Voice Call with AI Coach</h3>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Connect with your AI mindfulness coach through a personal phone call. 
                It's a great way to practice mindfulness exercises with voice guidance.
              </p>
              <CallMeButton />
            </div>
          </div>
        )}
      </div>

      {/* Consent Modals */}
      {consentGiven === null && (
        <ConsentModal onConsentGiven={handleConsentGiven} />
      )}
      
      {consentGiven === true && voiceConsentGiven === null && (
        <VoiceConsentModal onConsentGiven={handleVoiceConsentGiven} />
      )}

      {/* Crisis Intervention Modal */}
      <CrisisInterventionModal
        isOpen={isCrisisModalOpen}
        onClose={closeCrisisModal}
        onResponse={handleCrisisResponse}
        severityLevel={currentDetection?.level || 'low'}
      />
    </div>
  );
};