import React from 'react';
import { HeroSkeleton } from '../common/Skeleton';
import { formatCoordinate, formatTemp } from '../../utils/formatters';
import { getWeatherIconPath } from '../../utils/weatherIcons';

export default function CurrentWeatherHero({ weatherData, isLoading }) {
  if (isLoading || !weatherData || !weatherData.current) {
    return (
      <div className="lg:col-span-2 bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[260px]">
        <HeroSkeleton />
      </div>
    );
  }

  const { location, current } = weatherData;
  const metrics = current.metrics || {};
  const iconSrc = getWeatherIconPath(current.icon);

  return (
    <div className="lg:col-span-2 bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[260px] relative overflow-hidden">
      {/* Location & Condition Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-sky-400 tracking-wide uppercase bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {current.source ? current.source.toUpperCase() : 'LIVE OBSERVATION'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
            {location.city}
            {location.country ? `, ${location.country}` : ''}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {location.state ? `${location.state} • ` : ''}
            {formatCoordinate(location.latitude, location.longitude)}
          </p>
        </div>

        {/* Condition Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#172032] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-sm">
          <img
            src={iconSrc}
            alt={current.condition || 'Weather'}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Temperature & Secondary Details */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
              {formatTemp(metrics.temperature)}
            </span>
            <span className="text-lg text-slate-400 font-normal ml-1">C</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-[#172032] border border-white/[0.08] font-medium text-slate-200">
              {current.description || current.condition}
            </span>
            <span className="text-slate-400">
              Feels like{' '}
              <span className="text-white font-medium">
                {formatTemp(metrics.feels_like)}C
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[#172032] border border-white/[0.06] rounded-lg px-3 py-2 self-start sm:self-auto text-slate-300">
          <div>
            <span className="text-slate-400 text-[11px] block">High / Low</span>
            <span className="font-medium text-white">
              {formatTemp(metrics.temp_max)} / {formatTemp(metrics.temp_min)}
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.08]"></div>
          <div>
            <span className="text-slate-400 text-[11px] block">Updated</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {current.observed_at || '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
