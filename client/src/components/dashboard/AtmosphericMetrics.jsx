import React from 'react';
import { Droplets, Gauge, Wind, Cloud, Eye, Sunrise, Sunset } from 'lucide-react';
import { MetricsGridSkeleton } from '../common/Skeleton';

export default function AtmosphericMetrics({ currentData, isLoading }) {
  if (isLoading || !currentData || !currentData.metrics) {
    return <MetricsGridSkeleton />;
  }

  const { metrics, sunrise, sunset } = currentData;

  const items = [
    {
      label: 'Humidity',
      value: `${metrics.humidity}%`,
      subtext: 'Relative humidity',
      icon: <Droplets className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      label: 'Pressure',
      value: `${Math.round(metrics.pressure)}`,
      unit: 'hPa',
      subtext: 'Atmospheric pressure',
      icon: <Gauge className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      label: 'Wind',
      value: `${metrics.wind_speed}`,
      unit: 'm/s',
      subtext: `${metrics.wind_direction_compass || 'N'} (${metrics.wind_direction_deg || 0}°)`,
      highlightSubtext: true,
      icon: <Wind className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      label: 'Cloudiness',
      value: `${metrics.cloudiness}%`,
      subtext: 'Sky coverage',
      icon: <Cloud className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      label: 'Visibility',
      value: `${metrics.visibility != null ? metrics.visibility : 10.0}`,
      unit: 'km',
      subtext: 'Clear sightline',
      icon: <Eye className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      label: 'Sun Cycle',
      customValue: (
        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-amber-400" /> Rise:
            </span>
            <span className="font-medium text-white">{sunrise || '--:--'}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sunset className="w-3 h-3 text-amber-500" /> Set:
            </span>
            <span className="font-medium text-white">{sunset || '--:--'}</span>
          </div>
        </div>
      ),
      subtext: 'Solar timeline',
      icon: <Sunrise className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-[#111724] border border-white/[0.07] rounded-xl p-3.5 flex flex-col justify-between min-h-[96px] shadow-sm hover:border-white/[0.12] transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-normal">
            <span>{item.label}</span>
            {item.icon}
          </div>
          <div className="mt-2">
            {item.customValue ? (
              item.customValue
            ) : (
              <div>
                <span className="text-xl font-bold text-white">{item.value}</span>
                {item.unit && (
                  <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                )}
              </div>
            )}
            <p
              className={`text-[10px] mt-0.5 truncate ${
                item.highlightSubtext ? 'text-sky-300 font-medium' : 'text-slate-400'
              }`}
            >
              {item.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
