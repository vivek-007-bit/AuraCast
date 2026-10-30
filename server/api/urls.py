"""
API URL Routing for AuraCast v1
Prefix: /api/v1/
"""

from django.urls import path
from api.views import (
    HealthView,
    LocationSearchView,
    LocationReverseView,
    CurrentWeatherView,
    PredictionBundleView,
    WeatherBundleView,
)

urlpatterns = [
    # Root API & Health
    path("", HealthView.as_view(), name="api-root"),
    path("health/", HealthView.as_view(), name="health"),

    # Geocoding & Locations
    path("location/search/", LocationSearchView.as_view(), name="location-search"),
    path("location/reverse/", LocationReverseView.as_view(), name="location-reverse"),

    # Weather & Machine Learning Predictions
    path("weather/current/", CurrentWeatherView.as_view(), name="weather-current"),
    path("weather/prediction/", PredictionBundleView.as_view(), name="weather-prediction"),
    path("weather/bundle/", WeatherBundleView.as_view(), name="weather-bundle"),
    path("weather/", WeatherBundleView.as_view(), name="weather-default"),
]
