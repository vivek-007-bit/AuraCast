import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export default function ErrorBanner({ title, message, onRetry, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 text-rose-200 flex items-start gap-3 text-xs shadow-md">
      <AlertCircle className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold text-xs text-rose-100">{title || 'Unable to Load Weather Data'}</h4>
        <p className="text-rose-200/80 mt-0.5 text-[11px] leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800/80 rounded border border-rose-500/30 text-[11px] font-medium text-rose-100 transition-colors flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Try again</span>
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-rose-400 hover:text-white p-0.5 transition-colors"
          aria-label="Close error alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
