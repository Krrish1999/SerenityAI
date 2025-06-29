import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { JournalEntry } from '../components/journal/JournalEntry';
import { useJournalStore } from '../store/journalStore';

export const JournalEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEntry, fetchJournalEntry, isLoading, error } = useJournalStore();

  useEffect(() => {
    if (id) {
      fetchJournalEntry(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded-xl w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-1/3 mb-8"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-3/4 mb-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate('/journal')}>Back to Journal</Button>
      </div>
    );
  }

  if (!currentEntry) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Journal Entry Not Found</h2>
        <p className="text-gray-600 mb-6">The journal entry you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/journal')}>Back to Journal</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/journal')}
        >
          Back to Journal
        </Button>
      </div>
      
      <JournalEntry entry={currentEntry} />
    </div>
  );
};