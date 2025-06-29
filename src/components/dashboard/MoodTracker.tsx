import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MoodPicker } from '../ui/MoodPicker';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  Filler
} from 'chart.js';
import { useMoodStore } from '../../store/moodStore';
import { useAuthStore } from '../../store/authStore';
import { 
  subDays, 
  subMonths, 
  subYears, 
  startOfDay, 
  endOfDay, 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  eachHourOfInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  parseISO,
  addHours,
  addDays,
  addWeeks,
  addMonths
} from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = 'day' | 'week' | 'month' | 'year';

export const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState(3);
  const [note, setNote] = useState('');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const { entries, fetchMoodEntries, addMoodEntry, isLoading } = useMoodStore();
  const { user } = useAuthStore();

  const timeRanges = [
    { key: 'day' as TimeRange, label: 'Day', description: 'Today' },
    { key: 'week' as TimeRange, label: 'Week', description: 'Last 7 Days' },
    { key: 'month' as TimeRange, label: 'Month', description: 'Last 30 Days' },
    { key: 'year' as TimeRange, label: 'Year', description: 'Last 365 Days' }
  ];

  // Fetch mood entries based on selected range
  useEffect(() => {
    if (user) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (selectedRange) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
      }

      fetchMoodEntries(user.id, startDate.toISOString(), endDate.toISOString());
    }
  }, [user, selectedRange, fetchMoodEntries]);

  // Process mood data for chart display
  const processMoodData = () => {
    if (!entries.length) {
      return { labels: [], data: [], averageMood: 0 };
    }

    const now = new Date();
    let intervals: Date[];
    let formatString: string;

    switch (selectedRange) {
      case 'day':
        intervals = eachHourOfInterval({
          start: startOfDay(now),
          end: endOfDay(now)
        });
        formatString = 'HH:mm';
        break;
      case 'week':
        intervals = eachDayOfInterval({
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
        formatString = 'EEE';
        break;
      case 'month':
        intervals = eachWeekOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
        formatString = 'MMM d';
        break;
      case 'year':
        intervals = eachMonthOfInterval({
          start: startOfYear(now),
          end: endOfYear(now)
        });
        formatString = 'MMM';
        break;
      default:
        intervals = eachDayOfInterval({
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
        formatString = 'EEE';
    }

    const labels = intervals.map(interval => format(interval, formatString));
    const data: number[] = [];

    // Group entries by intervals and calculate averages
    intervals.forEach(interval => {
      let nextInterval: Date;
      
      switch (selectedRange) {
        case 'day':
          nextInterval = addHours(interval, 1);
          break;
        case 'week':
          nextInterval = addDays(interval, 1);
          break;
        case 'month':
          nextInterval = addWeeks(interval, 1);
          break;
        case 'year':
          nextInterval = addMonths(interval, 1);
          break;
        default:
          nextInterval = addDays(interval, 1);
      }

      const entriesInInterval = entries.filter(entry => {
        const entryDate = parseISO(entry.created_at);
        return isWithinInterval(entryDate, { start: interval, end: nextInterval });
      });

      if (entriesInInterval.length > 0) {
        const avgMood = entriesInInterval.reduce((sum, entry) => sum + entry.mood, 0) / entriesInInterval.length;
        data.push(avgMood);
      } else {
        data.push(0);
      }
    });

    // Calculate overall average mood
    const totalMoodSum = entries.reduce((sum, entry) => sum + entry.mood, 0);
    const averageMood = entries.length > 0 ? totalMoodSum / entries.length : 0;

    return { labels, data, averageMood };
  };

  const { labels, data, averageMood } = processMoodData();
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Mood',
        data,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
          return gradient;
        },
        borderColor: '#3B82F6',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1D4ED8',
        pointBorderWidth: 2,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const mood = context.parsed.y;
            if (mood === 0) return 'No data';
            return `Mood: ${mood.toFixed(1)}/5`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 10,
        },
        border: {
          display: false,
        },
      },
      y: {
        display: false,
        min: 0,
        max: 5,
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await addMoodEntry(user.id, selectedMood, note);
      setNote('');
      setSelectedMood(3); // Reset to neutral after logging
    }
  };

  const getCurrentRangeDescription = () => {
    const range = timeRanges.find(r => r.key === selectedRange);
    return range ? range.description : 'Last 7 Days';
  };

  const getTrendPercentage = () => {
    if (entries.length < 2) return null;
    
    const recentEntries = entries.slice(0, Math.floor(entries.length / 2));
    const olderEntries = entries.slice(Math.floor(entries.length / 2));
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.mood, 0) / olderEntries.length;
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    return percentage;
  };

  const trendPercentage = getTrendPercentage();
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-md">
      <div className="mb-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h3 className="text-gray-800 text-2xl font-bold mb-4">Mood Trend</h3>
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-gray-800 text-4xl font-bold tracking-tight">
                  {averageMood > 0 ? averageMood.toFixed(1) : '—'}
                </span>
                <span className="text-gray-600 text-lg">/5</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 text-sm">{getCurrentRangeDescription()}</span>
                {trendPercentage !== null && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className={`text-sm font-semibold ${
                      trendPercentage > 0 ? 'text-green-400' : trendPercentage < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Time Range Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
              {timeRanges.map((range) => (
                <button
                  key={range.key}
                  onClick={() => setSelectedRange(range.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedRange === range.key
                      ? 'bg-accent-teal text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 hover:scale-105'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="h-64 mb-6">
          {data.some(d => d > 0) ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center bg-neutral-light-gray/50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="text-gray-600 text-2xl mb-3">📊</div>
                <p className="text-gray-600 text-base font-medium">No mood data for {getCurrentRangeDescription().toLowerCase()}</p>
                <p className="text-gray-500 text-sm mt-1">Log your first mood entry below to see your trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent entries count */}
        {entries.length > 0 && (
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {entries.length} mood {entries.length === 1 ? 'entry' : 'entries'} recorded
            </p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Log Your Mood Right Now</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <MoodPicker
              selectedMood={selectedMood}
              onChange={setSelectedMood}
            />
            
            <TextArea
              label="Notes (optional)"
              placeholder="What's influencing your mood today? Share any thoughts, events, or feelings..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              rows={3}
            />
            
            <Button 
              type="submit"
              className="w-full py-4 font-bold text-base bg-accent-teal rounded-xl text-white"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving Mood...' : 'Save Mood Entry'}
            </Button>
          </div>
        </form>

        {/* Tip for hourly logging */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-700 text-sm">
            💡 <strong>Tip:</strong> You can log your mood multiple times throughout the day to track how you're feeling hour by hour. This helps identify patterns and triggers.
          </p>
        </div>
      </div>
    </div>
  );
};