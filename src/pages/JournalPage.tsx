import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Tag, Calendar, Filter } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useJournalStore } from '../store/journalStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export const JournalPage: React.FC = () => {
  const { entries, fetchJournalEntries, isLoading } = useJournalStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchJournalEntries(user.id);
    }
  }, [user]);
  
  // Extract all unique tags from journal entries
  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags || []))
  );
  
  const filteredEntries = entries.filter(entry => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => entry.tags?.includes(tag));
    
    // Filter by selected mood
    const matchesMood = selectedMood === null || entry.mood === selectedMood;
    
    return matchesSearch && matchesTags && matchesMood;
  });
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedMood(null);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600">Track your thoughts, feelings, and experiences</p>
        </div>
        <Link to="/journal/new">
          <Button 
          variant='outline'
            icon={<PlusCircle className="w-4 h-4 " />}
            className="mt-4 md:mt-0 flex items-center rounded-xl border border-gray-300 p-2 px-4 "
          >
            New Entry
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
            <div className="flex-1">
              <Input
                placeholder="Search your journal..."
                icon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </div>
            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {(selectedTags.length > 0 || selectedMood !== null) && '(Active)'}
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                    {allTags.length === 0 && (
                      <p className="text-sm text-gray-500">No tags found in your journal entries</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> Mood Filter
                  </h3>
                  <div className="flex space-x-3">
                    {[1, 2, 3, 4, 5].map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        className={`p-2 rounded-full transition-colors ${
                          selectedMood === mood
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                      >
                        {mood === 1 && '💔'}
                        {mood === 2 && '😔'}
                        {mood === 3 && '😐'}
                        {mood === 4 && '😊'}
                        {mood === 5 && '😄'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {(searchTerm || selectedTags.length > 0 || selectedMood !== null) && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-xl shadow-sm">
              <div className="h-5 bg-gray-200 rounded-xl w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <Link key={entry.id} to={`/journal/${entry.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{entry.title}</h2>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{format(new Date(entry.created_at), 'MMMM d, yyyy')}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {entry.mood === 1 && '💔 Terrible'}
                          {entry.mood === 2 && '😔 Bad'}
                          {entry.mood === 3 && '😐 Okay'}
                          {entry.mood === 4 && '😊 Good'}
                          {entry.mood === 5 && '😄 Great'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 hover:underline">Read more</div>
                  </div>
                  
                  <p className="mt-3 text-gray-600 line-clamp-3">
                    {entry.content}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
          <p className="text-gray-600 mb-6">
            {entries.length === 0
              ? "Start documenting your thoughts and feelings today."
              : "Try adjusting your search filters."}
          </p>
          {entries.length === 0 && (
            <Link to="/journal/new">
              <Button>Write Your First Entry</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};