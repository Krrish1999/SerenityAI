import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

type QuickReplyButtonsProps = {
  onSendReply: (message: string) => void;
  disabled?: boolean;
};

export const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({ 
  onSendReply, 
  disabled = false 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onSendReply("Tell me more about that")}
        disabled={disabled}
        className="flex items-center px-3 py-1.5 text-xs rounded-pill bg-white border-gray-300 text-gray-700 hover:bg-pastel-teal/20 hover:border-accent-teal hover:text-accent-teal shadow-sm"
      >
        <ArrowRight className="w-3 h-3 mr-1.5" />
        Tell me more
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => onSendReply("Please give me a practical tip for coping")}
        disabled={disabled}
        className="flex items-center px-3 py-1.5 text-xs rounded-pill bg-white border-gray-300 text-gray-700 hover:bg-pastel-teal/20 hover:border-accent-teal hover:text-accent-teal shadow-sm"
      >
        <HelpCircle className="w-3 h-3 mr-1.5" />
        Give me a tip
      </Button>
    </div>
  );
};