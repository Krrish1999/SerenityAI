import React, { useEffect, useRef } from 'react'; 
import { Bot, MessageCircle } from 'lucide-react';
import { AIChatMessage } from '../../types';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useAIChatStore } from '../../store/aiChatStore';
import { AudioPlayer } from './AudioPlayer';
import { QuickReplyButtons } from './QuickReplyButtons';

type AIChatMessageListProps = {
  messages: AIChatMessage[];
  isLoading?: boolean;
};

export const AIChatMessageList: React.FC<AIChatMessageListProps> = ({ 
  messages, 
  isLoading = false 
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { sendQuickReply } = useAIChatStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to render mood emoji based on mood tag
  const renderMoodEmoji = (moodTag?: string) => {
    if (!moodTag) return null;
    
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😔',
      anxious: '😰',
      angry: '😠',
      frustrated: '😤',
      hopeful: '🙂',
      grateful: '🙏',
      neutral: '😐',
      fearful: '😨',
      stressed: '😓',
      overwhelmed: '😩',
      excited: '😃',
      calm: '😌',
      reflective: '🤔',
      distressed: '😢',
      content: '🙂',
    };

    const emoji = moodEmojis[moodTag] || '😐';
    
    return (
      <span 
        className="inline-flex items-center justify-center text-xs bg-gray-700 rounded-full p-1 ml-2" 
        title={`Mood: ${moodTag}`}
      >
        {emoji}
      </span>
    );
  };

  const handleQuickReply = (replyText: string) => {
    if (user) {
      sendQuickReply(user.id, replyText);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="p-4 rounded-full bg-pastel-teal w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-accent-teal" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-3">Welcome to your Mindfulness Companion</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            I'm here to listen and provide support for your wellbeing journey. Feel free to share what's on your mind, 
            ask questions about mental health, or just have a conversation. How are you feeling today?
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className="flex flex-col">
          {message.sender === 'ai' ? (
            // AI messages on the left
            <div className="flex items-start space-x-3 mb-6">
              {/* AI Avatar */}
              <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center text-accent-teal text-sm font-medium flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              
              {/* AI Message */}
              <div className="flex flex-col flex-1">
                <div className="text-gray-700 text-sm font-medium mb-1">
                  <span>AI Assistant</span>
                  {renderMoodEmoji(message.mood_tag)}
                </div>
                
                {/* AI Message Bubble */}
                <div className="chat-bubble-ai max-w-md">
                  <p className="text-sm leading-relaxed text-gray-700">{message.content}</p>
                  
                  {/* Audio Player (if audioUrl is available) */}
                  {message.audioUrl && (
                    <AudioPlayer audioUrl={message.audioUrl} />
                  )}
                </div>
                
                {/* Quick Reply Buttons */}
                <QuickReplyButtons 
                  onSendReply={handleQuickReply}
                  disabled={isLoading} 
                />
              </div>
            </div>
          ) : (
            // User messages on the right
            <div className="flex items-start justify-end space-x-3 mb-6">
              {/* User Message */}
              <div className="flex flex-col flex-1 items-end">
                <div className="text-gray-700 text-sm font-medium mb-1">
                  <span>{user?.full_name || 'You'}</span>
                  {renderMoodEmoji(message.mood_tag)}
                </div>
                
                <div className="chat-bubble-user max-w-md">
                  <p className="text-sm leading-relaxed text-gray-700">{message.content}</p>
                </div>
              </div>
              
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
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        // AI typing indicator on the left
        <div className="flex items-start space-x-3 mb-6 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center text-accent-teal text-sm font-medium flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          
          <div className="flex flex-col flex-1">
            <div className="text-gray-700 text-sm font-medium mb-1">
              AI Assistant
            </div>
            
            <div className="chat-bubble-ai max-w-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-teal rounded-xl animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-teal rounded-xl animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-teal rounded-xl animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is typing...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};