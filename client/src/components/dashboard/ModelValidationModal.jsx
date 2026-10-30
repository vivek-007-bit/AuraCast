import React, { useEffect } from 'react';
import { X, CheckCircle2, BarChart2, Activity } from 'lucide-react';

export default function ModelValidationModal({ isOpen, onClose, prediction }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !prediction) return null;

  const evalM = prediction.evaluation || {};
  const featureImportances = prediction.feature_importance || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D14]/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#111724] border border-white/[0.08] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#172032] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Model Validation
        </span>
        <h2 className="text-lg font-bold text-white mt-0.5">Time-Series Validation Metrics</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {evalM.split_method || 'Evaluated with time-aware chronological split (80% Train, 20% Test).'}
        </p>

        <div className="mt-4 space-y-4 text-xs">
          {/* Regression Metrics */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Temperature & Humidity Accuracy</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Temp MAE</span>
                <span className="text-sm font-semibold text-sky-300">
                  {evalM.temperature_mae != null ? `${evalM.temperature_mae} °C` : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Temp RMSE</span>
                <span className="text-sm font-semibold text-sky-300">
                  {evalM.temperature_rmse != null ? `${evalM.temperature_rmse} °C` : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Humidity MAE</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {evalM.humidity_mae != null ? `${evalM.humidity_mae} %` : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Humidity RMSE</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {evalM.humidity_rmse != null ? `${evalM.humidity_rmse} %` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Classification Metrics */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rain Classification Performance</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <span className="text-sm font-semibold text-emerald-300">
                  {evalM.rain_accuracy != null ? `${(evalM.rain_accuracy * 100).toFixed(1)}%` : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">F1 Score</span>
                <span className="text-sm font-semibold text-emerald-300">
                  {evalM.rain_f1 != null ? evalM.rain_f1.toFixed(2) : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="text-sm font-semibold text-emerald-300">
                  {evalM.rain_precision != null ? `${(evalM.rain_precision * 100).toFixed(1)}%` : '--'}
                </span>
              </div>
              <div className="bg-[#172032] p-2.5 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="text-sm font-semibold text-emerald-300">
                  {evalM.rain_recall != null ? `${(evalM.rain_recall * 100).toFixed(1)}%` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Feature Importances */}
          <div>
            <h4 className="font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Key Model Predictors (Feature Importance)</span>
            </h4>
            <div className="space-y-1.5">
              {Object.entries(featureImportances).map(([feat, weight]) => (
                <div
                  key={feat}
                  className="flex items-center justify-between text-xs bg-[#172032] p-2 rounded-lg border border-white/[0.05]"
                >
                  <span className="font-mono text-slate-300 text-[11px]">{feat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(weight * 200, 100)}%` }}
                      />
                    </div>
                    <span className="font-medium text-sky-300 w-8 text-right text-[11px]">
                      {weight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
