import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Skeleton } from '../common/Skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler
);

export default function HistoricalTrends({ historicalData, isLoading }) {
  const [metricKey, setMetricKey] = useState('temperature');

  if (isLoading || !historicalData) {
    return (
      <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-32 h-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#172032] rounded-xl p-3">
              <Skeleton className="w-20 h-3 mb-1" />
              <Skeleton className="w-14 h-6" />
            </div>
          ))}
        </div>
        <Skeleton className="h-56 sm:h-64 w-full rounded-xl" />
      </div>
    );
  }

  const {
    avg_temperature,
    min_temperature,
    max_temperature,
    avg_humidity,
    total_precipitation,
    recent_trend = [],
  } = historicalData;

  const labels = recent_trend.map((d) => d.time);

  let values = [];
  let labelName = 'Temperature (°C)';
  let borderColor = '#38bdf8';
  let backgroundColor = 'rgba(56, 189, 248, 0.08)';

  if (metricKey === 'temperature') {
    values = recent_trend.map((d) => d.temperature);
    labelName = 'Temperature (°C)';
    borderColor = '#38bdf8';
    backgroundColor = 'rgba(56, 189, 248, 0.08)';
  } else if (metricKey === 'humidity') {
    values = recent_trend.map((d) => d.humidity);
    labelName = 'Humidity (%)';
    borderColor = '#22d3ee';
    backgroundColor = 'rgba(34, 211, 238, 0.08)';
  } else if (metricKey === 'precipitation') {
    values = recent_trend.map((d) => d.precipitation);
    labelName = 'Precipitation (mm)';
    borderColor = '#818cf8';
    backgroundColor = 'rgba(129, 140, 248, 0.25)';
  } else if (metricKey === 'wind_speed') {
    values = recent_trend.map((d) => d.wind_speed);
    labelName = 'Wind Speed (m/s)';
    borderColor = '#f59e0b';
    backgroundColor = 'rgba(245, 158, 11, 0.08)';
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: labelName,
        data: values,
        borderColor,
        backgroundColor,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#172032',
        titleColor: '#e2e8f0',
        bodyColor: borderColor,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 7,
          font: { size: 10 },
        },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-lg space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Recent Observations & Trends
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Past 30 days of historical data retrieved for this location
          </p>
        </div>

        {/* Metric Toggle Tabs */}
        <div className="flex rounded-lg bg-[#172032] p-1 border border-white/[0.06] self-start sm:self-auto text-xs font-medium">
          {[
            { key: 'temperature', label: 'Temp (°C)' },
            { key: 'humidity', label: 'Humidity (%)' },
            { key: 'precipitation', label: 'Precip (mm)' },
            { key: 'wind_speed', label: 'Wind (m/s)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMetricKey(tab.key)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                metricKey === tab.key
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block">30-Day Mean Temp</span>
          <span className="text-base font-bold text-white">
            {avg_temperature != null ? `${avg_temperature}°C` : '--'}
          </span>
        </div>
        <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block">30-Day Temp Range</span>
          <span className="text-base font-bold text-white">
            {min_temperature != null ? `${min_temperature}°` : '--'} /{' '}
            {max_temperature != null ? `${max_temperature}°` : '--'}
          </span>
        </div>
        <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block">30-Day Mean Humidity</span>
          <span className="text-base font-bold text-white">
            {avg_humidity != null ? `${avg_humidity}%` : '--'}
          </span>
        </div>
        <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 block">30-Day Total Rain</span>
          <span className="text-base font-bold text-white">
            {total_precipitation != null ? `${total_precipitation} mm` : '--'}
          </span>
        </div>
      </div>

      {/* Trend Chart Canvas */}
      <div className="relative h-56 sm:h-64 w-full">
        {metricKey === 'precipitation' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
