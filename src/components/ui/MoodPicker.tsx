import React from 'react';
import { Frown, Meh, Smile, Laugh as LaughSquint, HeartCrack } from 'lucide-react';

type MoodPickerProps = {
  selectedMood: number;
  onChange: (mood: number) => void;
};

export const MoodPicker: React.FC<MoodPickerProps> = ({ selectedMood, onChange }) => {
  const moods = [
    { value: 1, icon: <HeartCrack className="w-8 h-8 text-red-500" />, label: 'Terrible' },
    { value: 2, icon: <Frown className="w-8 h-8 text-orange-500" />, label: 'Bad' },
    { value: 3, icon: <Meh className="w-8 h-8 text-yellow-500" />, label: 'Okay' },
    { value: 4, icon: <Smile className="w-8 h-8 text-green-400" />, label: 'Good' },
    { value: 5, icon: <LaughSquint className="w-8 h-8 text-emerald-500" />, label: 'Great' },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <label className="block text-base font-semibold text-gray-400">
        How are you feeling today?
      </label>
      
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            className={`flex flex-col items-center p-4 rounded-3xl  transition-all duration-300 ${
              selectedMood === mood.value
                ? 'bg-pastel-lavender scale-105 shadow-md'
                : 'bg-white hover:bg-pastel-teal/20 hover:scale-105 border border-gray-200'
            }`}
            onClick={() => onChange(mood.value)}
          >
            {mood.icon}
            <span className="mt-2 text-xs font-medium transition-colors">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};