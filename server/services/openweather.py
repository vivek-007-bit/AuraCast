"""
Current Weather Service fetching observations from OpenWeatherMap
with seamless Open-Meteo fallback for resilience.
Preserves original mapping, compass conversion, and fallback logic.
"""

from datetime import datetime, timezone
import logging
import os
from typing import Any, Dict, Optional, Tuple
from django.conf import settings
import httpx

logger = logging.getLogger(__name__)

COMPASS_POINTS = [
    ('N', 0, 11.25), ('NNE', 11.25, 33.75), ('NE', 33.75, 56.25), ('ENE', 56.25, 78.75),
    ('E', 78.75, 101.25), ('ESE', 101.25, 123.75), ('SE', 123.75, 146.25), ('SSE', 146.25, 168.75),
    ('S', 168.75, 191.25), ('SSW', 191.25, 213.75), ('SW', 213.75, 236.25), ('WSW', 236.25, 258.75),
    ('W', 258.75, 281.25), ('WNW', 281.25, 303.75), ('NW', 303.75, 326.25), ('NNW', 326.25, 348.75),
    ('N', 348.75, 360.0)
]


def degrees_to_compass(deg: float) -> str:
    """Convert degree angle (0-360) to 16-point compass direction."""
    norm_deg = deg % 360
    for name, start, end in COMPASS_POINTS:
        if start <= norm_deg < end:
            return name
    return "N"


def map_condition_icon(condition: str) -> str:
    """Map meteorological condition text to crisp UI icon keys."""
    c = condition.lower()
    if "clear" in c or "sunny" in c:
        return "sunny"
    if "cloud" in c or "overcast" in c:
        return "cloudy"
    if "rain" in c or "drizzle" in c or "shower" in c:
        return "rainy"
    if "thunder" in c or "storm" in c:
        return "thunderstorm"
    if "snow" in c or "blizzard" in c or "ice" in c:
        return "snow"
    if "fog" in c or "mist" in c or "haze" in c or "smoke" in c:
        return "fog"
    return "partly_cloudy"


class OpenWeatherService:
    def __init__(self):
        self.timeout = getattr(settings, "HTTP_TIMEOUT_SECONDS", 10.0)

    @property
    def api_key(self) -> str:
        return getattr(settings, "OPENWEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY", ""))

    @property
    def openweather_base_url(self) -> str:
        return getattr(settings, "OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5")

    @property
    def openmeteo_forecast_url(self) -> str:
        return getattr(settings, "OPENMETEO_FORECAST_URL", "https://api.open-meteo.com/v1/forecast")

    async def get_current_weather(self, lat: float, lon: float) -> Tuple[Dict[str, Any], bool]:
        """
        Fetch current weather metrics for a location.
        Returns (current_weather_dict, is_fallback_flag).
        """
        key = self.api_key
        if key:
            try:
                weather = await self._fetch_openweather(lat, lon, key)
                if weather:
                    return weather, False
            except Exception as e:
                logger.warning("OpenWeatherMap request failed: %s. Falling back to Open-Meteo.", e)

        # Fallback to Open-Meteo
        weather = await self._fetch_openmeteo(lat, lon)
        return weather, True

    def get_current_weather_sync(self, lat: float, lon: float) -> Tuple[Dict[str, Any], bool]:
        """Synchronous wrapper for Django views using httpx.Client."""
        key = self.api_key
        if key:
            try:
                weather = self._fetch_openweather_sync(lat, lon, key)
                if weather:
                    return weather, False
            except Exception as e:
                logger.warning("OpenWeatherMap sync request failed: %s. Falling back to Open-Meteo.", e)

        weather = self._fetch_openmeteo_sync(lat, lon)
        return weather, True

    def _fetch_openweather_sync(self, lat: float, lon: float, api_key: str) -> Optional[Dict[str, Any]]:
        url = f"{self.openweather_base_url}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "units": "metric",
            "appid": api_key,
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return self._parse_openweather_response(data)
        return None

    async def _fetch_openweather(self, lat: float, lon: float, api_key: str) -> Optional[Dict[str, Any]]:
        url = f"{self.openweather_base_url}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "units": "metric",
            "appid": api_key,
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return self._parse_openweather_response(data)
        return None

    def _parse_openweather_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        main = data.get("main", {})
        wind = data.get("wind", {})
        weather_info = data.get("weather", [{}])[0]
        sys = data.get("sys", {})

        wind_deg = int(wind.get("deg", 0))
        condition = weather_info.get("main", "Clear")
        description = weather_info.get("description", "Clear sky").title()

        sunrise_ts = sys.get("sunrise")
        sunset_ts = sys.get("sunset")
        sunrise_str = (
            datetime.fromtimestamp(sunrise_ts, tz=timezone.utc).strftime("%H:%M")
            if sunrise_ts
            else None
        )
        sunset_str = (
            datetime.fromtimestamp(sunset_ts, tz=timezone.utc).strftime("%H:%M")
            if sunset_ts
            else None
        )

        metrics = {
            "temperature": round(float(main.get("temp", 0.0)), 1),
            "feels_like": round(float(main.get("feels_like", main.get("temp", 0.0))), 1),
            "temp_min": round(float(main.get("temp_min", main.get("temp", 0.0))), 1),
            "temp_max": round(float(main.get("temp_max", main.get("temp", 0.0))), 1),
            "humidity": int(main.get("humidity", 50)),
            "pressure": round(float(main.get("pressure", 1013.25)), 1),
            "wind_speed": round(float(wind.get("speed", 0.0)), 1),
            "wind_direction_deg": wind_deg,
            "wind_direction_compass": degrees_to_compass(wind_deg),
            "cloudiness": int(data.get("clouds", {}).get("all", 0)),
            "visibility": round(float(data.get("visibility", 10000)) / 1000.0, 1),
        }

        return {
            "condition": condition,
            "description": description,
            "icon": map_condition_icon(condition),
            "metrics": metrics,
            "sunrise": sunrise_str,
            "sunset": sunset_str,
            "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "source": "OpenWeatherMap",
        }

    def _fetch_openmeteo_sync(self, lat: float, lon: float) -> Dict[str, Any]:
        url = self.openmeteo_forecast_url
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "cloud_cover",
                "weather_code",
            ],
            "daily": ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min"],
            "timezone": "auto",
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            return self._parse_openmeteo_response(data)

    async def _fetch_openmeteo(self, lat: float, lon: float) -> Dict[str, Any]:
        url = self.openmeteo_forecast_url
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "cloud_cover",
                "weather_code",
            ],
            "daily": ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min"],
            "timezone": "auto",
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            return self._parse_openmeteo_response(data)

    def _parse_openmeteo_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        curr = data.get("current", {})
        daily = data.get("daily", {})

        wind_deg = int(curr.get("wind_direction_10m", 0))
        wcode = curr.get("weather_code", 0)
        condition, desc = self._decode_wmo_code(wcode)

        temp_min = daily.get("temperature_2m_min", [curr.get("temperature_2m", 20)])[0]
        temp_max = daily.get("temperature_2m_max", [curr.get("temperature_2m", 20)])[0]

        sunrise = daily.get("sunrise", [None])[0]
        sunset = daily.get("sunset", [None])[0]
        sunrise_str = sunrise.split("T")[-1] if sunrise and "T" in sunrise else sunrise
        sunset_str = sunset.split("T")[-1] if sunset and "T" in sunset else sunset

        metrics = {
            "temperature": round(float(curr.get("temperature_2m", 20.0)), 1),
            "feels_like": round(
                float(curr.get("apparent_temperature", curr.get("temperature_2m", 20.0))), 1
            ),
            "temp_min": round(float(temp_min), 1),
            "temp_max": round(float(temp_max), 1),
            "humidity": int(curr.get("relative_humidity_2m", 50)),
            "pressure": round(float(curr.get("surface_pressure", 1013.25)), 1),
            "wind_speed": round(float(curr.get("wind_speed_10m", 0.0)) / 3.6, 1),  # km/h to m/s
            "wind_direction_deg": wind_deg,
            "wind_direction_compass": degrees_to_compass(wind_deg),
            "cloudiness": int(curr.get("cloud_cover", 0)),
            "visibility": 10.0,
        }

        return {
            "condition": condition,
            "description": desc,
            "icon": map_condition_icon(condition),
            "metrics": metrics,
            "sunrise": sunrise_str,
            "sunset": sunset_str,
            "observed_at": curr.get(
                "time", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
            ),
            "source": "Open-Meteo",
        }

    @staticmethod
    def _decode_wmo_code(code: int) -> Tuple[str, str]:
        """Decode WMO Weather Interpretation Codes (0-99)."""
        if code == 0:
            return "Clear", "Clear sky"
        elif code in (1, 2):
            return "Clouds", "Mainly clear or partly cloudy"
        elif code == 3:
            return "Clouds", "Overcast"
        elif code in (45, 48):
            return "Fog", "Fog and depositing rime fog"
        elif code in (51, 53, 55):
            return "Rain", "Drizzle: light to dense intensity"
        elif code in (61, 63, 65):
            return "Rain", "Rain: slight to heavy intensity"
        elif code in (71, 73, 75, 77):
            return "Snow", "Snow fall or snow grains"
        elif code in (80, 81, 82):
            return "Rain", "Rain showers"
        elif code in (95, 96, 99):
            return "Thunderstorm", "Thunderstorm with or without hail"
        return "Clouds", "Partly cloudy"


openweather_service = OpenWeatherService()
