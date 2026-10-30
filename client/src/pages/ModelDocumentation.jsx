import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Database, Cpu, Activity, AlertCircle, Terminal } from 'lucide-react';

export default function ModelDocumentation() {
  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto">
      {/* Page Header & Breadcrumb */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-sky-300 transition-colors">
            Weather Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Model Documentation</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Architecture & Methodology</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              How Our Weather Prediction Model Works
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
              A transparent look at the on-demand, location-specific time-series machine learning pipeline powering AuraCast's short-range precipitation and meteorological forecasting.
            </p>
          </div>
          <Link
            to="/"
            className="self-start md:self-auto px-4 py-2 bg-[#172032] hover:bg-[#1E2A40] text-sky-400 hover:text-sky-300 border border-white/[0.08] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Table of Contents Quick Navigation */}
      <section className="bg-[#111724] border border-white/[0.07] rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Documentation Index
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {[
            { id: '#section-architecture', label: '1. Architecture' },
            { id: '#section-overview', label: '2. Overview' },
            { id: '#section-data-sources', label: '3. Data Sources' },
            { id: '#section-preprocessing', label: '4. Preprocessing' },
            { id: '#section-features', label: '5. Feature Engineering' },
            { id: '#section-ml-models', label: '6. ML Models' },
            { id: '#section-prediction-flow', label: '7. Prediction Flow' },
            { id: '#section-forecast-interpretation', label: '8. Forecast Output' },
            { id: '#section-limitations', label: '9. Limitations' },
            { id: '#section-evaluation', label: '10. Model Evaluation' },
            { id: '#section-tech-stack', label: '11. Technical Details' },
          ].map((item) => (
            <a
              key={item.id}
              href={item.id}
              className="p-2 rounded-lg bg-[#172032] text-slate-300 hover:text-sky-300 hover:border-sky-500/30 border border-white/[0.04] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* 1. Architecture Flow Diagram */}
      <section id="section-architecture" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">End-to-End Pipeline Architecture</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The diagram below illustrates how telemetry is ingested, sanitized, transformed into structured features, and processed through Scikit-Learn Random Forest estimators to produce actionable weather predictions.
        </p>

        <div className="pt-2 overflow-x-auto">
          <div className="min-w-[640px] space-y-3 font-mono text-xs">
            {/* Stage 1: Ingestion */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#172032] border border-sky-500/30 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-sky-400 font-semibold block uppercase">Real-Time Ingestion</span>
                <strong className="text-slate-100 text-xs mt-1 block">OpenWeather API</strong>
                <span className="text-[11px] text-slate-400 font-sans">Current Temperature, Humidity, Wind, Pressure, Sky Condition</span>
              </div>
              <div className="bg-[#172032] border border-indigo-500/30 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-indigo-400 font-semibold block uppercase">Historical Ingestion</span>
                <strong className="text-slate-100 text-xs mt-1 block">Open-Meteo Archive API</strong>
                <span className="text-[11px] text-slate-400 font-sans">30-Day Chronological Hourly Dataset (~720 Observations)</span>
              </div>
            </div>

            <div className="text-center text-slate-500">↓</div>

            {/* Stage 2: Preprocessing */}
            <div className="bg-[#172032] border border-emerald-500/30 rounded-xl p-3.5 text-center">
              <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Data Cleaning & Validation (preprocessing.py)</span>
              <strong className="text-slate-100 text-xs mt-1 block">Time-Series Sanitization & Missing Value Fill</strong>
              <span className="text-[11px] text-slate-400 font-sans">Strict chronological sort → forward/backward fill → physical bounds clipping → target generation</span>
            </div>

            <div className="text-center text-slate-500">↓</div>

            {/* Stage 3: Feature Engineering */}
            <div className="bg-[#172032] border border-purple-500/30 rounded-xl p-3.5 text-center">
              <span className="text-[10px] text-purple-400 font-semibold block uppercase">Feature Engineering (features.py)</span>
              <strong className="text-slate-100 text-xs mt-1 block">30 Derived Meteorological & Temporal Predictors</strong>
              <span className="text-[11px] text-slate-400 font-sans">Cyclical sin/cos hour & month, lag features (1h, 2h, 3h, 6h), 6h & 24h rolling stats, 3h pressure trend</span>
            </div>

            <div className="text-center text-slate-500">↓</div>

            {/* Stage 4: Dynamic Training & Inference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#172032] border border-amber-500/30 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-amber-400 font-semibold block uppercase">Classification</span>
                <strong className="text-slate-100 text-xs mt-1 block">RandomForestClassifier</strong>
                <span className="text-[11px] text-slate-400 font-sans">24-Hour Precipitation Risk & Probability Gauge</span>
              </div>
              <div className="bg-[#172032] border border-cyan-500/30 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-cyan-400 font-semibold block uppercase">Multi-Horizon Regression</span>
                <strong className="text-slate-100 text-xs mt-1 block">12x RandomForestRegressor</strong>
                <span className="text-[11px] text-slate-400 font-sans">+1h to +6h Temperature & Relative Humidity Trajectories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overview */}
      <section id="section-overview" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Overview</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">On-Demand, Location-Specific Intelligence</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional global numerical weather prediction (NWP) models run on supercomputers with multi-hour delay cycles. AuraCast complements NWP baseline forecasts by training on-demand, hyper-local Scikit-Learn ensemble models directly on the past 30 days of chronological hourly observations specific to the user's exact coordinates.
        </p>
      </section>

      {/* 3. Data Sources */}
      <section id="section-data-sources" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Data Ingestion</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Authoritative Weather Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-sky-300 text-sm">OpenWeather API</h4>
            <p className="text-slate-300 leading-relaxed">
              Provides live, sub-second telemetry including ambient temperature, apparent feels-like temperature, barometric pressure, wind velocity, compass heading, and visual sky condition.
            </p>
          </div>
          <div className="bg-[#172032] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-indigo-300 text-sm">Open-Meteo Historical Archive</h4>
            <p className="text-slate-300 leading-relaxed">
              Provides the past 720 hours (30 days) of continuous, chronological observations without missing frames for empirical training and local trend analysis.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Preprocessing */}
      <section id="section-preprocessing" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Data Preprocessing</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Strict Chronological Sanitation</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          To prevent data leakage in time-series forecasting, observations are strictly sorted chronologically. Missing sensor telemetry is filled using forward fill followed by backward fill. Physical values are constrained: humidity is clipped to [0, 100], and precipitation and wind speed cannot fall below zero.
        </p>
      </section>

      {/* 5. Feature Engineering */}
      <section id="section-features" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Feature Engineering</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">The 30 Input Predictors</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The pipeline computes cyclical signals to capture diurnal and seasonal oscillations smoothly:
        </p>
        <div className="bg-[#172032] p-3 rounded-lg font-mono text-xs text-sky-300 space-y-1">
          <div>sin_hour = sin(2 * π * hour / 24)</div>
          <div>cos_hour = cos(2 * π * hour / 24)</div>
          <div>sin_month = sin(2 * π * (month - 1) / 12)</div>
          <div>cos_month = cos(2 * π * (month - 1) / 12)</div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          It also computes lag variables (1h, 2h, 3h, 6h) for temperature, humidity, and pressure; rolling statistics (6h & 24h rolling means and standard deviations); and a 3-hour pressure trend indicator.
        </p>
      </section>

      {/* 6. ML Models */}
      <section id="section-ml-models" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Machine Learning Models</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Random Forest Ensembles</h2>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            AuraCast employs Scikit-Learn Random Forests because of their robustness to non-linear meteorological dynamics, low risk of overfitting on bounded historical windows, and fast training times suitable for serverless worker execution.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Precipitation Classifier:</strong> RandomForestClassifier with balanced class weights to reliably detect rare rain events.</li>
            <li><strong className="text-slate-200">Direct Multi-Step Regressors:</strong> 6 separate temperature regressors and 6 humidity regressors to predict exact future trajectories without error accumulation.</li>
          </ul>
        </div>
      </section>

      {/* 7. Limitations */}
      <section id="section-limitations" className="bg-[#111724] border border-white/[0.07] rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Operational Constraints</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Known Boundaries</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          AuraCast's on-demand models are designed for short-range horizons (next 6 to 24 hours). They do not model long-range atmospheric advection or synoptic front movements over multi-week horizons. For long-term multi-day outlooks, global NWP forecasts should always be referenced.
        </p>
      </section>
    </div>
  );
}
