import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function FallbackBanner({ message }) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  return (
    <div className="bg-[#111724] border border-sky-500/25 rounded-xl p-3 text-sky-200 flex items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span className="text-[11px] sm:text-xs leading-relaxed">{message}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-slate-400 hover:text-white p-0.5 transition-colors shrink-0"
        aria-label="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
