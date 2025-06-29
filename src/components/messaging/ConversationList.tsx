import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useMessageStore } from '../../store/messageStore';
import { UserCircle, Check } from 'lucide-react';

type ConversationListProps = {
  onSelectConversation: (userId: string) => void;
  selectedConversationId: string | null;
};

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const { conversations, isLoading } = useMessageStore();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-3 border-b">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          className={`w-full p-3 flex items-center hover:bg-gray-50 transition-colors duration-200 ${
            selectedConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="relative flex-shrink-0">
            {conversation.avatar_url ? (
              <img
                src={conversation.avatar_url}
                alt={conversation.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-10 h-10 text-gray-400" />
            )}
            {conversation.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          
          <div className="ml-3 text-left flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {conversation.full_name}
              </h4>
              {conversation.lastMessageTime && (
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                </span>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              {conversation.lastMessage ? (
                <p className="text-xs text-gray-500 truncate flex-1 max-w-[80%]">
                  {conversation.lastMessage}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">No messages yet</p>
              )}
              
              <div className="ml-1 flex-shrink-0">
                {conversation.unreadCount === 0 && conversation.lastMessage && (
                  <Check className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};