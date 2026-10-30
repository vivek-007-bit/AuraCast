import React, { useState } from 'react';
import { Cpu, CloudRain, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { getWeatherIconPath } from '../../utils/weatherIcons';
import { formatTemp } from '../../utils/formatters';

export default function HourlyPredictionSection({
  predictionData,
  hourlyForecast = [],
  isPredictionLoading,
  isWeatherLoading,
}) {
  const [activeTab, setActiveTab] = useState('ml'); // 'ml' | 'baseline'

  const mlPredictions = predictionData?.prediction?.hourly_predictions || [];

  return (
    <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-lg space-y-5">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Hourly Trajectory & Predictions
            </h3>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare on-demand machine learning predictions against external meteorological projections
          </p>
        </div>

        {/* View Mode Toggle Tabs */}
        <div className="flex rounded-lg bg-[#172032] p-1 border border-white/[0.06] self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('ml')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ml'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>6h ML Model</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('baseline')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'baseline'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>24h Baseline</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 6-HOUR CUSTOM ML PREDICTIONS */}
      {activeTab === 'ml' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="font-medium text-sky-300">AuraCast Random Forest Predictions</span>
              <span className="text-slate-400">• Dynamic 30-Day Training Context</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Horizons: +1h through +6h
            </span>
          </div>

          {/* Skeletons when loading */}
          {isPredictionLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#172032] border border-white/[0.05] rounded-xl p-3.5 h-32 flex flex-col justify-between"
                >
                  <Skeleton className="w-12 h-3" />
                  <Skeleton className="w-16 h-7 my-2" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-14 h-3" />
                </div>
              ))}
            </div>
          ) : mlPredictions.length > 0 ? (
            <div className="space-y-4">
              {/* Visual Temperature Trend Curve Mini-Bar / SVG */}
              <div className="bg-[#172032]/60 border border-white/[0.05] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 font-medium text-slate-300">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    <span>Predicted Temperature Curve</span>
                  </div>
                  <span className="text-[11px]">Next 6 Hours</span>
                </div>

                <div className="h-16 w-full flex items-end gap-2 pt-2">
                  {(() => {
                    const temps = mlPredictions.map((p) => p.temperature);
                    const minT = Math.min(...temps) - 1;
                    const maxT = Math.max(...temps) + 1;
                    const range = Math.max(maxT - minT, 1);

                    return mlPredictions.map((item, idx) => {
                      const heightPercent = Math.max(
                        15,
                        Math.min(100, ((item.temperature - minT) / range) * 100)
                      );
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-bold text-sky-300 opacity-90 group-hover:scale-110 transition-transform">
                            {formatTemp(item.temperature)}
                          </span>
                          <div
                            className="w-full bg-sky-500/20 hover:bg-sky-400/40 rounded-t-md transition-all duration-300 relative border-t-2 border-sky-400"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[9px] text-slate-400 font-mono">
                            {item.time}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* 6-Hour Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {mlPredictions.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#172032] border border-white/[0.06] hover:border-sky-500/30 rounded-xl p-3.5 flex flex-col justify-between text-center transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{item.time}</span>
                      <span className="text-[10px] font-mono text-sky-400 font-semibold">
                        +{idx + 1}h
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-extrabold text-white tracking-tight">
                        {formatTemp(item.temperature)}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">C</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-300 mt-0.5 truncate">
                        {item.condition_estimate}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.05] space-y-1 text-[10px]">
                      <div className="flex items-center justify-between text-sky-300 font-medium">
                        <span>Humidity</span>
                        <span>{item.humidity}% RH</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Rain Prob</span>
                        <span
                          className={`font-semibold ${
                            item.rain_probability > 50
                              ? 'text-rose-400'
                              : item.rain_probability > 25
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {Math.round(item.rain_probability)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-6 text-center text-xs text-slate-400">
              Model predictions currently generating or unavailable.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 24-HOUR BASELINE FORECAST (OPEN-METEO BASELINE) */}
      {activeTab === 'baseline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="font-medium text-indigo-300">Open-Meteo Meteorological Timeline</span>
              <span className="text-slate-400">• Full 24-Hour Horizon</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Scroll horizontally →
            </span>
          </div>

          {isWeatherLoading ? (
            <div className="flex gap-2.5 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-24 h-28 bg-[#172032] rounded-xl p-2.5 shrink-0">
                  <Skeleton className="w-12 h-3 mx-auto" />
                  <Skeleton className="w-8 h-8 rounded-full my-2 mx-auto" />
                  <Skeleton className="w-10 h-4 mx-auto" />
                </div>
              ))}
            </div>
          ) : hourlyForecast.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {hourlyForecast.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-24 bg-[#172032] border border-white/[0.06] hover:border-indigo-500/30 rounded-xl p-3 flex flex-col items-center justify-between text-center transition-colors"
                >
                  <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                  <img
                    src={getWeatherIconPath(item.icon)}
                    alt={item.condition}
                    className="w-7 h-7 my-2 object-contain"
                  />
                  <span className="text-sm font-bold text-white">
                    {formatTemp(item.temperature)}
                  </span>
                  <div className="mt-1 flex flex-col items-center gap-0.5 text-[10px] text-slate-400">
                    <span className="text-sky-300">{item.humidity}% RH</span>
                    {item.precipitation_prob != null && (
                      <span className="text-[9px] text-indigo-300">
                        {Math.round(item.precipitation_prob)}% rain
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-6 text-center text-xs text-slate-400">
              No 24-hour baseline forecast available for this location.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
