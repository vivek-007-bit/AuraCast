"""
Geocoding Service for Resolving Locations (City Search & Reverse Coordinates)
Supports OpenWeather Geocoding and Open-Meteo Geocoding Fallback.
"""

import logging
import os
from typing import Any, Dict, List, Optional
from django.conf import settings
import httpx

logger = logging.getLogger(__name__)


class GeocodingService:
    def __init__(self):
        self.timeout = getattr(settings, "HTTP_TIMEOUT_SECONDS", 10.0)

    @property
    def api_key(self) -> str:
        return getattr(settings, "OPENWEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY", ""))

    @property
    def openweather_geo_url(self) -> str:
        return getattr(settings, "OPENWEATHER_GEO_URL", "https://api.openweathermap.org/geo/1.0")

    @property
    def openmeteo_geo_url(self) -> str:
        return getattr(settings, "OPENMETEO_GEO_URL", "https://geocoding-api.open-meteo.com/v1")

    @property
    def openmeteo_forecast_url(self) -> str:
        return getattr(settings, "OPENMETEO_FORECAST_URL", "https://api.open-meteo.com/v1/forecast")

    def search_locations(self, query: str) -> List[Dict[str, Any]]:
        """Search for matching cities given a text query."""
        if not query or len(query.strip()) < 2:
            return []

        query = query.strip()
        results: List[Dict[str, Any]] = []

        # Try OpenWeather Geocoding if API key is provided
        key = self.api_key
        if key:
            try:
                results = self._search_openweather(query, key)
                if results:
                    return results
            except Exception as e:
                logger.warning("OpenWeather geocoding failed: %s. Falling back to Open-Meteo.", e)

        # Fallback to Open-Meteo Geocoding
        try:
            results = self._search_openmeteo(query)
        except Exception as e:
            logger.error("Open-Meteo geocoding failed: %s", e)

        return results

    def resolve_coordinates(self, lat: float, lon: float) -> Dict[str, Any]:
        """Resolve location name from latitude and longitude coordinates."""
        key = self.api_key
        if key:
            try:
                info = self._reverse_openweather(lat, lon, key)
                if info:
                    return info
            except Exception as e:
                logger.warning("OpenWeather reverse geocoding failed: %s", e)

        # Fallback to Open-Meteo Reverse Geocoding / Timezone determination
        try:
            info = self._reverse_openmeteo(lat, lon)
            if info:
                return info
        except Exception as e:
            logger.warning("Open-Meteo reverse geocoding failed: %s", e)

        # Default fallback if all resolution fails
        return {
            "city": f"Location ({lat:.2f}, {lon:.2f})",
            "country": "Global",
            "state": None,
            "latitude": lat,
            "longitude": lon,
            "timezone": "UTC",
        }

    def _search_openweather(self, query: str, api_key: str) -> List[Dict[str, Any]]:
        url = f"{self.openweather_geo_url}/direct"
        params = {"q": query, "limit": 5, "appid": api_key}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return [
                    {
                        "name": item.get("name", query),
                        "country": item.get("country", ""),
                        "state": item.get("state"),
                        "latitude": item["lat"],
                        "longitude": item["lon"],
                    }
                    for item in data
                    if "lat" in item and "lon" in item
                ]
        return []

    def _search_openmeteo(self, query: str) -> List[Dict[str, Any]]:
        url = f"{self.openmeteo_geo_url}/search"
        params = {"name": query, "count": 5, "language": "en", "format": "json"}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                return [
                    {
                        "name": item.get("name", query),
                        "country": item.get("country_code", item.get("country", "")),
                        "state": item.get("admin1"),
                        "latitude": item["latitude"],
                        "longitude": item["longitude"],
                    }
                    for item in results
                    if "latitude" in item and "longitude" in item
                ]
        return []

    def _reverse_openweather(self, lat: float, lon: float, api_key: str) -> Optional[Dict[str, Any]]:
        url = f"{self.openweather_geo_url}/reverse"
        params = {"lat": lat, "lon": lon, "limit": 1, "appid": api_key}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                if data and len(data) > 0:
                    item = data[0]
                    return {
                        "city": item.get("name", "Unknown City"),
                        "country": item.get("country", ""),
                        "state": item.get("state"),
                        "latitude": lat,
                        "longitude": lon,
                        "timezone": None,
                    }
        return None

    def _reverse_openmeteo(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        url = self.openmeteo_forecast_url
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": "true",
            "timezone": "auto",
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                tz = data.get("timezone", "UTC")
                tz_city = (
                    tz.split("/")[-1].replace("_", " ")
                    if "/" in tz
                    else "Current Location"
                )
                return {
                    "city": tz_city,
                    "country": tz.split("/")[0] if "/" in tz else "Earth",
                    "state": None,
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": tz,
                }
        return None


geocoding_service = GeocodingService()
