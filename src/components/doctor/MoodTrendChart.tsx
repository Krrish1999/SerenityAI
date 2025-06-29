import React from 'react';
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
  ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type MoodTrendChartProps = {
  data: Array<{ date: string; mood: number }>;
};

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data }) => {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Mood Rating',
        data: data.map(d => d.mood),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#1D4ED8',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      x: {
        grid: {
          color: '#E5E7EB',
          display: true,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
        border: {
          color: '#D1D5DB',
        },
      },
      y: {
        min: 1,
        max: 5,
        grid: {
          color: '#E5E7EB',
          display: true,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          callback: (value: any) => `${value}/5`,
        },
        border: {
          color: '#D1D5DB',
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3B82F6',
        hoverBorderColor: '#1D4ED8',
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-neutral-light-gray/50 rounded-lg border border-gray-200">
        <p className="font-medium">No mood data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};