import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type TherapistSearchProps = {
  onSearch: (query: string, specializations: string[]) => void;
  isLoading: boolean;
};

const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Trauma',
  'Relationships',
  'Stress',
  'Self-esteem',
  'Grief',
  'Family',
  'Addiction',
  'LGBTQ+',
];

export const TherapistSearch: React.FC<TherapistSearchProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  const toggleSpecialization = (specialization: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specialization)
        ? prev.filter((s) => s !== specialization)
        : [...prev, specialization]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedSpecializations);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedSpecializations([]);
    onSearch('', []);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSearch}>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search therapists by name, specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-5 w-5" />}
          >
            Filters {selectedSpecializations.length > 0 && `(${selectedSpecializations.length})`}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Search
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((specialization) => (
                <button
                  key={specialization}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSpecializations.includes(specialization)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleSpecialization(specialization)}
                >
                  {specialization}
                </button>
              ))}
            </div>
            
            {(query || selectedSpecializations.length > 0) && (
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};