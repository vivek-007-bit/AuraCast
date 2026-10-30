import React from 'react';
import { Zap, ChevronRight, AlertTriangle, RotateCcw } from 'lucide-react';
import { PredictionCardSkeleton } from '../common/Skeleton';

export default function PrecipitationRiskCard({
  predictionData,
  isLoading,
  isError,
  onRetry,
  onOpenModelModal,
}) {
  if (isLoading) {
    return (
      <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[260px]">
        <PredictionCardSkeleton />
      </div>
    );
  }

  if (isError || !predictionData || !predictionData.prediction) {
    return (
      <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[260px]">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Prediction Status</span>
          </div>
          <h3 className="text-base font-semibold text-white">Prediction Unavailable</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Could not compute on-demand ML predictions right now. Live weather observation above remains fully active.
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="self-start px-3.5 py-1.5 bg-[#172032] hover:bg-[#1E2A40] text-sky-400 rounded-lg border border-white/[0.08] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry Prediction</span>
          </button>
        )}
      </div>
    );
  }

  const { prediction } = predictionData;
  const rainProb = prediction.rain_probability_next_24h ?? 0;
  const riskLevel = prediction.rain_risk_level || 'Low';

  // Gauge circumference: 2 * π * 40 ≈ 251.2
  const strokeDashoffset = 251.2 - 251.2 * (rainProb / 100);

  let riskColor = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
  let gaugeColor = 'text-emerald-400';
  let descText = 'Precipitation is unlikely over the next 24 hours.';

  if (riskLevel === 'Moderate') {
    riskColor = 'text-amber-300 bg-amber-500/10 border-amber-500/20';
    gaugeColor = 'text-amber-400';
    descText = 'Possible isolated showers or scattered rain.';
  } else if (riskLevel === 'High' || riskLevel === 'Very High') {
    riskColor = 'text-rose-300 bg-rose-500/10 border-rose-500/20';
    gaugeColor = 'text-rose-400';
    descText = 'High probability of continuous rain or thunderstorms.';
  }

  return (
    <div className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[260px] relative">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-sky-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Precipitation Risk
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#172032] border border-white/[0.06] text-slate-300 font-mono">
            30-Day Model
          </span>
        </div>
        <h3 className="text-sm font-semibold text-white mt-1">24-Hour Rain Probability</h3>
      </div>

      {/* Probability Circular Gauge Display */}
      <div className="my-3 flex items-center justify-center gap-5">
        <div className="relative w-22 h-22 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-800/80 stroke-current"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className={`${gaugeColor} stroke-current transition-all duration-700 ease-out`}
              strokeWidth="9"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{Math.round(rainProb)}%</span>
            <span className="text-[9px] uppercase text-slate-400 font-medium tracking-wider">
              Chance
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] text-slate-400">Risk Level:</div>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded border text-xs font-semibold ${riskColor}`}
            >
              {riskLevel} Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug pt-0.5">{descText}</p>
        </div>
      </div>

      {/* Model Metrics Modal Trigger */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">Random Forest Ensemble</span>
        <button
          type="button"
          onClick={onOpenModelModal}
          className="text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Model Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
