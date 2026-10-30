"""
Django REST Framework API Views for AuraCast
Implements health checks, location geocoding, current weather, and ML predictions.
"""

from datetime import datetime, timezone
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.views import exception_handler as drf_exception_handler

from api.serializers import (
    CurrentWeatherResponseSerializer,
    GeocodingResultSerializer,
    LocationSerializer,
    PredictionBundleResponseSerializer,
    WeatherBundleResponseSerializer,
)
from services.geocoding import geocoding_service
from services.weather_service import weather_service

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Global DRF exception handler ensuring safe, structured JSON errors.
    Never exposes raw internal stack traces or secrets in responses.
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "error": {
                    "code": "REQUEST_ERROR",
                    "message": str(exc),
                    "status_code": response.status_code,
                },
            },
            status=response.status_code,
        )

    logger.error("Unhandled server exception: %s", exc, exc_info=True)
    return Response(
        {
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal error occurred while processing the weather prediction request.",
                "detail": str(exc) if getattr(settings, "DEBUG", False) else None,
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class HealthView(APIView):
    """Health check endpoint for uptime monitoring and serverless cold start diagnostics."""

    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "app_name": getattr(settings, "APP_NAME", "AuraCast"),
                "version": getattr(settings, "APP_VERSION", "2.0.0"),
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "openweather_configured": bool(
                    getattr(settings, "OPENWEATHER_API_KEY", "")
                ),
            },
            status=status.HTTP_200_OK,
        )


class LocationSearchView(APIView):
    """Search for matching cities and geographic coordinates."""

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INVALID_QUERY",
                        "message": "Query parameter 'q' must be at least 2 characters.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            results = geocoding_service.search_locations(query)
            serializer = GeocodingResultSerializer(results, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Location search failed for '%s': %s", query, e)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "GEOCODING_FAILED",
                        "message": f"Location search failed: {str(e)}",
                    },
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LocationReverseView(APIView):
    """Resolve city and territory information from latitude and longitude coordinates."""

    def get(self, request):
        lat_str = request.query_params.get("lat")
        lon_str = request.query_params.get("lon")

        if lat_str is None or lon_str is None:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "MISSING_COORDINATES",
                        "message": "Both 'lat' and 'lon' query parameters are required.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lat = float(lat_str)
            lon = float(lon_str)
        except ValueError:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INVALID_COORDINATES",
                        "message": "Coordinates must be valid numeric floating-point values.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = geocoding_service.resolve_coordinates(lat, lon)
            serializer = LocationSerializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Reverse geocoding failed for (%s, %s): %s", lat, lon, e)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "REVERSE_GEOCODING_FAILED",
                        "message": f"Reverse geocoding failed: {str(e)}",
                    },
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CurrentWeatherView(APIView):
    """
    Retrieve fast, lightweight current weather and 24-hour baseline forecast.
    Enables instant Progressive Loading without waiting for ML training.
    """

    def get(self, request):
        city = request.query_params.get("city")
        lat_str = request.query_params.get("lat")
        lon_str = request.query_params.get("lon")

        lat = None
        lon = None
        if lat_str is not None and lon_str is not None:
            try:
                lat = float(lat_str)
                lon = float(lon_str)
            except ValueError:
                return Response(
                    {
                        "success": False,
                        "error": {
                            "code": "INVALID_COORDINATES",
                            "message": "Coordinates must be valid numeric values.",
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            bundle = weather_service.get_current_weather_bundle(
                city=city, lat=lat, lon=lon
            )
            serializer = CurrentWeatherResponseSerializer(bundle)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response(
                {
                    "success": False,
                    "error": {"code": "LOCATION_NOT_FOUND", "message": str(ve)},
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error("Failed to retrieve current weather: %s", e)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "WEATHER_PROVIDER_ERROR",
                        "message": f"Failed to retrieve current weather: {str(e)}",
                    },
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )


class PredictionBundleView(APIView):
    """
    Generate location-specific machine learning predictions (precipitation risk, 6h forecast,
    and historical statistics) based on real 30-day historical weather observations.
    """

    def get(self, request):
        lat_str = request.query_params.get("lat")
        lon_str = request.query_params.get("lon")

        if lat_str is None or lon_str is None:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "MISSING_COORDINATES",
                        "message": "Query parameters 'lat' and 'lon' are required for ML prediction.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lat = float(lat_str)
            lon = float(lon_str)
        except ValueError:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INVALID_COORDINATES",
                        "message": "Coordinates must be valid numeric floating-point values.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bundle = weather_service.get_prediction_bundle(lat, lon)
            serializer = PredictionBundleResponseSerializer(bundle)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(
                "ML prediction pipeline failed for (%s, %s): %s", lat, lon, e
            )
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "PREDICTION_PIPELINE_FAILED",
                        "message": f"ML prediction pipeline failed: {str(e)}",
                    },
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class WeatherBundleView(APIView):
    """
    Retrieve unified weather bundle (current + historical + predictions + 24h baseline).
    """

    def get(self, request):
        city = request.query_params.get("city")
        lat_str = request.query_params.get("lat")
        lon_str = request.query_params.get("lon")

        lat = None
        lon = None
        if lat_str is not None and lon_str is not None:
            try:
                lat = float(lat_str)
                lon = float(lon_str)
            except ValueError:
                return Response(
                    {
                        "success": False,
                        "error": {
                            "code": "INVALID_COORDINATES",
                            "message": "Coordinates must be valid numeric values.",
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            bundle = weather_service.get_complete_weather_bundle(
                city=city, lat=lat, lon=lon
            )
            serializer = WeatherBundleResponseSerializer(bundle)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response(
                {
                    "success": False,
                    "error": {"code": "LOCATION_NOT_FOUND", "message": str(ve)},
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error("Failed to retrieve weather bundle: %s", e)
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "WEATHER_BUNDLE_ERROR",
                        "message": f"Failed to retrieve weather data: {str(e)}",
                    },
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )
