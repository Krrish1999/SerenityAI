import React, { useState } from 'react';
import { Send, PaperclipIcon } from 'lucide-react';
import { Button } from '../ui/Button';

type MessageInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t bg-white p-3 flex items-center space-x-2"
    >
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        disabled={disabled}
      >
        <PaperclipIcon className="w-5 h-5" />
      </button>
      
      <input
        type="text"
        className="flex-1 border-0 focus:ring-0 focus:outline-none p-2 bg-gray-100 rounded-full"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
      
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};