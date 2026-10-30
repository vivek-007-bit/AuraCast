"""
Master Weather Orchestrator Service
Coordinates Geocoding, Current Weather, Real Historical Observations, and ML Pipeline.
Supports Progressive Loading (Instant Current Weather + Asynchronous ML Prediction).
Includes In-Memory TTL Caching for high-performance serverless execution.
"""

import logging
import os
import time
from typing import Any, Dict, Optional, Tuple
from django.conf import settings

from ml.models import ml_pipeline
from services.geocoding import geocoding_service
from services.historical import historical_service
from services.openweather import openweather_service

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self):
        # In-memory TTL cache: key -> (timestamp, data)
        self._bundle_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._current_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._prediction_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._cache_ttl_seconds = getattr(settings, "CACHE_TTL_SECONDS", 600)  # 10 minutes cache

    def _get_cache_key(self, lat: float, lon: float) -> str:
        return f"{round(float(lat), 2)}:{round(float(lon), 2)}"

    def resolve_location(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Resolve geographical coordinates and location info."""
        if city and city.strip():
            locations = geocoding_service.search_locations(city.strip())
            if not locations:
                raise ValueError(f"City '{city}' could not be resolved to geographical coordinates.")
            top_loc = locations[0]
            return {
                "city": top_loc["name"],
                "country": top_loc["country"],
                "state": top_loc.get("state"),
                "latitude": float(top_loc["latitude"]),
                "longitude": float(top_loc["longitude"]),
                "timezone": None,
            }
        elif lat is not None and lon is not None:
            return geocoding_service.resolve_coordinates(float(lat), float(lon))
        else:
            default_city = getattr(settings, "DEFAULT_CITY", "Kolkata")
            default_lat = getattr(settings, "DEFAULT_LAT", 22.5726)
            default_lon = getattr(settings, "DEFAULT_LON", 88.3639)
            default_country = getattr(settings, "DEFAULT_COUNTRY", "IN")
            return {
                "city": default_city,
                "country": default_country,
                "state": "West Bengal",
                "latitude": default_lat,
                "longitude": default_lon,
                "timezone": "Asia/Kolkata",
            }

    def get_current_weather_bundle(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Fast, lightweight current weather retrieval.
        Returns location, live OpenWeather observation, and 24-hour baseline forecast.
        """
        location = self.resolve_location(city=city, lat=lat, lon=lon)
        cache_key = self._get_cache_key(location["latitude"], location["longitude"])
        now_ts = time.time()

        if cache_key in self._current_cache:
            saved_ts, cached_resp = self._current_cache[cache_key]
            if now_ts - saved_ts < self._cache_ttl_seconds:
                # Update location details in cached payload
                cached_copy = dict(cached_resp)
                cached_copy["location"] = location
                return cached_copy

        # 1. Fetch Current Weather
        current_weather, is_fallback = openweather_service.get_current_weather_sync(
            location["latitude"], location["longitude"]
        )

        # 2. Fetch 24-Hour Baseline Hourly Forecast
        hourly_forecast = historical_service.get_hourly_forecast_baseline(
            location["latitude"], location["longitude"]
        )

        fallback_msg = (
            "OpenWeather API key not detected or rate-limited. Using Open-Meteo as high-precision fallback."
            if is_fallback
            else None
        )

        response = {
            "status": "success",
            "location": location,
            "current": current_weather,
            "hourly_forecast": hourly_forecast,
            "is_fallback": is_fallback,
            "message": fallback_msg,
        }

        self._current_cache[cache_key] = (now_ts, response)
        return response

    def get_prediction_bundle(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Location-specific machine learning prediction pipeline.
        Fetches 30-day historical observations, extracts features, trains models, and returns predictions.
        """
        cache_key = self._get_cache_key(lat, lon)
        now_ts = time.time()

        if cache_key in self._prediction_cache:
            saved_ts, cached_resp = self._prediction_cache[cache_key]
            if now_ts - saved_ts < self._cache_ttl_seconds:
                return cached_resp

        # 1. Fetch Real Historical Weather Data
        hist_df, hist_summary = historical_service.get_historical_dataframe(lat, lon)

        # 2. Train & Predict using Real Historical Data in ML Pipeline
        prediction_result = ml_pipeline.train_and_predict(hist_df)

        response = {
            "status": "success",
            "prediction": prediction_result,
            "historical": hist_summary,
        }

        self._prediction_cache[cache_key] = (now_ts, response)
        return response

    def get_complete_weather_bundle(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Complete weather retrieval and ML prediction pipeline.
        Returns unified bundle of current weather, 24h forecast, 30-day historical analysis, and ML predictions.
        """
        location = self.resolve_location(city=city, lat=lat, lon=lon)
        cache_key = self._get_cache_key(location["latitude"], location["longitude"])
        now_ts = time.time()

        if cache_key in self._bundle_cache:
            saved_ts, cached_resp = self._bundle_cache[cache_key]
            if now_ts - saved_ts < self._cache_ttl_seconds:
                cached_copy = dict(cached_resp)
                cached_copy["location"] = location
                return cached_copy

        current_weather, is_fallback = openweather_service.get_current_weather_sync(
            location["latitude"], location["longitude"]
        )
        hist_df, hist_summary = historical_service.get_historical_dataframe(
            location["latitude"], location["longitude"]
        )
        hourly_forecast = historical_service.get_hourly_forecast_baseline(
            location["latitude"], location["longitude"]
        )
        prediction_result = ml_pipeline.train_and_predict(hist_df)

        fallback_msg = (
            "OpenWeather API key not detected or rate-limited. Using Open-Meteo as high-precision fallback."
            if is_fallback
            else None
        )

        bundle = {
            "status": "success",
            "location": location,
            "current": current_weather,
            "historical": hist_summary,
            "prediction": prediction_result,
            "hourly_forecast": hourly_forecast,
            "is_fallback": is_fallback,
            "message": fallback_msg,
        }

        self._bundle_cache[cache_key] = (now_ts, bundle)
        return bundle


weather_service = WeatherService()
