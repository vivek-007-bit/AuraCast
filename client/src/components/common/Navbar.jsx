import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Cloud, BookOpen, Clock } from 'lucide-react';

export default function Navbar() {
  const [utcTime, setUtcTime] = useState('--:--:-- UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-white/[0.06] bg-[#090D14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:border-sky-400/50 transition-colors">
            <Cloud className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              AuraCast
            </span>
            <span className="hidden md:inline text-[11px] text-slate-400 font-normal">
              Weather & ML Forecast
            </span>
          </div>
        </NavLink>

        {/* Navigation & Live UTC Clock */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <nav className="flex items-center space-x-1 sm:space-x-1.5 mr-1 sm:mr-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-sky-300 bg-sky-500/10 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172032]'
                }`
              }
            >
              Weather
            </NavLink>
            <NavLink
              to="/model-docs"
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-sky-300 bg-sky-500/10 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172032]'
                }`
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Model Docs</span>
            </NavLink>
          </nav>

          {/* Live UTC Clock */}
          <div className="hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111724] border border-white/[0.06] text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{utcTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
