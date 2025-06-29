import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';

type MessageListProps = {
  messages: Message[];
};

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuthStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const date = formatMessageDate(message.created_at);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
              {date}
            </div>
          </div>
          
          <div className="space-y-3">
            {dateMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                    message.sender_id === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div>{message.content}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};