import React from 'react';
import { Cloud, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#090D14] mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-slate-300">AuraCast Weather Platform</span>
            <span>•</span>
            <span>Fast Full-Stack React + Django Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/model-docs" className="hover:text-sky-300 transition-colors">
              Model Architecture
            </Link>
            <span>•</span>
            <span className="text-slate-400">v2.0.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
