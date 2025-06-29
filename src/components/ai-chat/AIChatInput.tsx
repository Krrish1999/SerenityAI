import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, MicOff, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAIChatStore } from '../../store/aiChatStore';

type AIChatInputProps = {
  onSend: (message: string | Blob) => void;
  isLoading?: boolean;
};

export const AIChatInput: React.FC<AIChatInputProps> = ({ onSend, isLoading = false }) => {
  const [message, setMessage] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const { user } = useAuthStore();
  const { voiceConsentGiven } = useAIChatStore();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = async () => {
    // Check voice consent
    if (voiceConsentGiven !== true) {
      // The consent modal will be shown by the parent component
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSend(audioBlob);
        
        // Stop all tracks of the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Reset state
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer for UI
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Automatically stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 15000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access your microphone. Please check your device permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border-t border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getUserInitials(user?.full_name || 'User')
          )}
        </div>
        
        {/* Input Container */}
        <div className="flex-1 flex items-center space-x-3 bg-white rounded-2xl px-4 py-3 border border-gray-300 shadow-sm">
          {isRecording ? (
            <div className="flex-1 flex items-center">
              <div className="animate-pulse flex items-center text-red-500 mr-2">
                <Mic className="w-5 h-5" />
                <span className="ml-2 text-sm">Recording... {formatRecordingTime(recordingTime)}</span>
              </div>
              <button
                type="button"
                className="ml-auto text-red-500 hover:text-red-600 transition-colors p-1"
                onClick={stopRecording}
              >
                <MicOff className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
              />
              
              {/* Only show microphone button if voice consent is given or not yet asked */}
              {voiceConsentGiven !== false && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-accent-coral transition-colors p-1"
                  disabled={isLoading}
                  onMouseDown={startRecording}
                  onTouchStart={startRecording}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        
        {/* Send Button */}
        <Button
          type="submit"
          disabled={(!message.trim() && !isRecording) || isLoading}
          className="bg-accent-teal hover:bg-accent-teal/90 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
          isLoading={isLoading}
        >
          Send
        </Button>
      </form>
    </div>
  );
};