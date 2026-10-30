import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/dashboard/SearchBar';
import CurrentWeatherHero from '../components/dashboard/CurrentWeatherHero';
import PrecipitationRiskCard from '../components/dashboard/PrecipitationRiskCard';
import AtmosphericMetrics from '../components/dashboard/AtmosphericMetrics';
import HourlyPredictionSection from '../components/dashboard/HourlyPredictionSection';
import HistoricalTrends from '../components/dashboard/HistoricalTrends';
import ModelValidationModal from '../components/dashboard/ModelValidationModal';
import ErrorBanner from '../components/common/ErrorBanner';
import FallbackBanner from '../components/common/FallbackBanner';
import { fetchCurrentWeather, fetchPrediction } from '../services/api';

export default function WeatherDashboard() {
  const [currentParams, setCurrentParams] = useState({ city: 'Kolkata' });
  const [weatherData, setWeatherData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);

  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [isPredictionLoading, setIsPredictionLoading] = useState(true);
  const [isPredictionError, setIsPredictionError] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Progressive Loading Orchestrator
  const loadWeather = useCallback(async (params) => {
    setCurrentParams(params);
    setGlobalError(null);
    setIsWeatherLoading(true);
    setIsPredictionLoading(true);
    setIsPredictionError(false);

    let resolvedCoords = null;

    // STEP 1: Fast Instant Weather Fetch (<200ms)
    try {
      const data = await fetchCurrentWeather(params);
      setWeatherData(data);
      setIsWeatherLoading(false);

      if (data?.location?.latitude != null && data?.location?.longitude != null) {
        resolvedCoords = {
          lat: data.location.latitude,
          lon: data.location.longitude,
        };
      }
    } catch (err) {
      console.error('Failed to load current weather:', err);
      setIsWeatherLoading(false);
      setIsPredictionLoading(false);
      setGlobalError(err.message || 'Unable to retrieve weather data for this location.');
      return;
    }

    // STEP 2: Asynchronous ML Prediction & 30-Day Historical Analysis
    if (resolvedCoords) {
      try {
        const pred = await fetchPrediction(resolvedCoords);
        setPredictionData(pred);
        setIsPredictionLoading(false);
      } catch (predErr) {
        console.warn('ML Prediction pipeline failed:', predErr);
        setIsPredictionLoading(false);
        setIsPredictionError(true);
      }
    } else {
      setIsPredictionLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadWeather({ city: 'Kolkata' });
  }, [loadWeather]);

  const handleSearchCity = (city) => {
    loadWeather({ city });
  };

  const handleSearchCoords = (lat, lon, cityName) => {
    loadWeather({ lat, lon, city: cityName });
  };

  const handleRetryPrediction = () => {
    if (weatherData?.location?.latitude != null && weatherData?.location?.longitude != null) {
      setIsPredictionLoading(true);
      setIsPredictionError(false);
      fetchPrediction({
        lat: weatherData.location.latitude,
        lon: weatherData.location.longitude,
      })
        .then((pred) => {
          setPredictionData(pred);
          setIsPredictionLoading(false);
        })
        .catch((err) => {
          console.warn('Retry prediction failed:', err);
          setIsPredictionLoading(false);
          setIsPredictionError(true);
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <SearchBar
        onSearchCity={handleSearchCity}
        onSearchCoords={handleSearchCoords}
        isSearching={isWeatherLoading}
      />

      {/* Global Weather Error Alert */}
      {globalError && (
        <ErrorBanner
          message={globalError}
          onRetry={() => loadWeather(currentParams)}
          onClose={() => setGlobalError(null)}
        />
      )}

      {/* Fallback Notice Banner */}
      {weatherData?.is_fallback && weatherData?.message && (
        <FallbackBanner message={weatherData.message} />
      )}

      {/* Progressive Top Row: Current Weather Hero (2 cols) + Precipitation Risk (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CurrentWeatherHero
          weatherData={weatherData}
          isLoading={isWeatherLoading}
        />
        <PrecipitationRiskCard
          predictionData={predictionData}
          isLoading={isPredictionLoading}
          isError={isPredictionError}
          onRetry={handleRetryPrediction}
          onOpenModelModal={() => setIsModelModalOpen(true)}
        />
      </div>

      {/* Atmospheric Metrics Grid (6 subtle indicators) */}
      <AtmosphericMetrics
        currentData={weatherData?.current}
        isLoading={isWeatherLoading}
      />

      {/* Mandatory Redesigned Hourly Section (6h ML Model + 24h Baseline + Temp Curve) */}
      <HourlyPredictionSection
        predictionData={predictionData}
        hourlyForecast={weatherData?.hourly_forecast}
        isPredictionLoading={isPredictionLoading}
        isWeatherLoading={isWeatherLoading}
      />

      {/* Historical Trends & 30-Day Context */}
      <HistoricalTrends
        historicalData={predictionData?.historical}
        isLoading={isPredictionLoading}
      />

      {/* Informative Methodology Footer Card */}
      <div className="bg-[#111724] border border-white/[0.06] rounded-xl p-4 sm:p-5">
        <h4 className="text-xs font-semibold text-slate-300">About the Predictive Model</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          AuraCast evaluates 30 days of chronological hourly observations specific to the selected coordinates. The pipeline extracts cyclical diurnal features, barometric pressure trends, and autoregressive lag variables to train Scikit-Learn Random Forest estimators on demand for short-range precipitation probability and multi-horizon hourly forecasts.
        </p>
      </div>

      {/* Model Validation & Evaluation Metrics Modal */}
      <ModelValidationModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        prediction={predictionData?.prediction}
      />
    </div>
  );
}
