import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { JournalEntry } from '../../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

type RecentJournalEntriesProps = {
  entries: JournalEntry[];
  isLoading: boolean;
};

export const RecentJournalEntries: React.FC<RecentJournalEntriesProps> = ({
  entries,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="h-4 bg-gray-700 rounded-xl w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-xl w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentEntries = entries.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Journal Entries</CardTitle>
        <Link to="/journal">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentEntries.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-medium text-white">{entry.title}</h4>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{format(new Date(entry.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300 line-clamp-2">{entry.content}</p>
                  </div>
                  <Link to={`/journal/${entry.id}`}>
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      Read
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h4 className="text-gray-400">No journal entries yet</h4>
            <Link to="/journal/new">
              <Button variant="outline" className="mt-4">
                Write Your First Entry
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};