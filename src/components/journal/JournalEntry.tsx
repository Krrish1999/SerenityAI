import React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { JournalEntry as JournalEntryType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useJournalStore } from '../../store/journalStore';

type JournalEntryProps = {
  entry: JournalEntryType;
  showActions?: boolean;
};

export const JournalEntry: React.FC<JournalEntryProps> = ({
  entry,
  showActions = true,
}) => {
  const { deleteJournalEntry, isLoading } = useJournalStore();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      await deleteJournalEntry(entry.id);
      navigate('/journal');
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return '💔';
      case 2: return '😔';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '😄';
      default: return '😐';
    }
  };

  const getMoodText = (mood: number) => {
    switch (mood) {
      case 1: return 'Terrible';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Great';
      default: return 'Okay';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{entry.title}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{format(new Date(entry.created_at), 'MMMM d, yyyy')}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
                <span>Feeling {getMoodText(entry.mood)}</span>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => navigate(`/journal/edit/${entry.id}`)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-4 h-4 text-red-500" />}
                onClick={handleDelete}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {entry.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
      {entry.tags && entry.tags.length > 0 && (
        <CardFooter className="border-t pt-4">
          <div className="flex items-center">
            <Tag className="w-4 h-4 text-gray-500 mr-2" />
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};