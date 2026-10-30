"""
Test Suite for Weather and Prediction Endpoints
"""

from unittest.mock import patch
from rest_framework.test import APIClient
import pytest


@pytest.fixture
def mock_current_weather_payload():
    return {
        "status": "success",
        "location": {
            "city": "Kolkata",
            "country": "IN",
            "state": "West Bengal",
            "latitude": 22.5726,
            "longitude": 88.3639,
            "timezone": "Asia/Kolkata",
        },
        "current": {
            "condition": "Clear",
            "description": "Clear Sky",
            "icon": "sunny",
            "metrics": {
                "temperature": 28.5,
                "feels_like": 30.2,
                "temp_min": 25.0,
                "temp_max": 31.0,
                "humidity": 65,
                "pressure": 1012.0,
                "wind_speed": 3.5,
                "wind_direction_deg": 180,
                "wind_direction_compass": "S",
                "cloudiness": 10,
                "visibility": 10.0,
            },
            "sunrise": "05:30",
            "sunset": "17:45",
            "observed_at": "2026-10-30 04:00 UTC",
            "source": "OpenWeatherMap",
        },
        "hourly_forecast": [
            {
                "time": "12:00",
                "datetime_iso": "2026-10-30T12:00:00",
                "temperature": 29.0,
                "feels_like": 31.0,
                "humidity": 60,
                "precipitation_prob": 10.0,
                "condition": "Clear",
                "icon": "sunny",
            }
        ],
        "is_fallback": False,
        "message": None,
    }


@pytest.fixture
def mock_prediction_payload():
    return {
        "status": "success",
        "prediction": {
            "rain_probability_next_24h": 15.5,
            "rain_expected": False,
            "rain_risk_level": "Low",
            "hourly_predictions": [
                {
                    "time": "13:00",
                    "datetime_iso": "2026-10-30T13:00:00",
                    "temperature": 29.5,
                    "humidity": 58,
                    "rain_probability": 12.0,
                    "condition_estimate": "Clear",
                }
            ],
            "feature_importance": {"temperature": 0.25, "humidity": 0.20},
            "evaluation": {
                "temperature_mae": 1.2,
                "temperature_rmse": 1.5,
                "humidity_mae": 4.5,
                "humidity_rmse": 5.8,
                "rain_accuracy": 0.88,
                "rain_precision": 0.85,
                "rain_recall": 0.82,
                "rain_f1": 0.83,
                "train_samples": 550,
                "test_samples": 138,
                "split_method": "Time-Series Chronological Split (80/20)",
            },
            "methodology_note": "Trained on 30 days of hourly observations.",
        },
        "historical": {
            "days_retrieved": 30,
            "data_points_count": 720,
            "avg_temperature": 27.2,
            "min_temperature": 21.0,
            "max_temperature": 34.5,
            "avg_humidity": 68.0,
            "total_precipitation": 12.5,
            "recent_trend": [
                {
                    "time": "Oct 29, 12:00",
                    "temperature": 28.0,
                    "humidity": 65,
                    "pressure": 1012.0,
                    "precipitation": 0.0,
                    "wind_speed": 3.2,
                }
            ],
            "source": "Open-Meteo Historical Archive",
        },
    }


@pytest.mark.django_db
@patch("services.weather_service.weather_service.get_current_weather_bundle")
def test_current_weather_endpoint(mock_get_current, mock_current_weather_payload):
    mock_get_current.return_value = mock_current_weather_payload

    client = APIClient()
    response = client.get("/api/v1/weather/current/?city=Kolkata")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["location"]["city"] == "Kolkata"
    assert data["current"]["metrics"]["temperature"] == 28.5
    assert len(data["hourly_forecast"]) == 1
    # Progressive loading: Prediction should not be loaded on current endpoint
    assert "prediction" not in data


@pytest.mark.django_db
@patch("services.weather_service.weather_service.get_prediction_bundle")
def test_prediction_endpoint(mock_get_pred, mock_prediction_payload):
    mock_get_pred.return_value = mock_prediction_payload

    client = APIClient()
    response = client.get("/api/v1/weather/prediction/?lat=22.57&lon=88.36")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "prediction" in data
    assert data["prediction"]["rain_probability_next_24h"] == 15.5
    assert data["prediction"]["rain_risk_level"] == "Low"
    assert len(data["prediction"]["hourly_predictions"]) == 1
    assert data["prediction"]["evaluation"]["train_samples"] == 550


@pytest.mark.django_db
def test_prediction_endpoint_missing_coordinates():
    client = APIClient()
    response = client.get("/api/v1/weather/prediction/")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "MISSING_COORDINATES"
