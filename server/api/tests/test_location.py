"""
Test Suite for Location Search and Reverse Geocoding Endpoints
"""

from unittest.mock import patch
from rest_framework.test import APIClient
import pytest


@pytest.mark.django_db
def test_location_search_validation_error():
    client = APIClient()
    response = client.get("/api/v1/location/search/?q=a")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_QUERY"


@pytest.mark.django_db
def test_location_reverse_missing_coords():
    client = APIClient()
    response = client.get("/api/v1/location/reverse/")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "MISSING_COORDINATES"


@pytest.mark.django_db
def test_location_reverse_invalid_coords():
    client = APIClient()
    response = client.get("/api/v1/location/reverse/?lat=invalid&lon=invalid")

    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_COORDINATES"


@pytest.mark.django_db
@patch("services.geocoding.geocoding_service.search_locations")
def test_location_search_success(mock_search):
    mock_search.return_value = [
        {
            "name": "Tokyo",
            "country": "JP",
            "state": "Tokyo",
            "latitude": 35.6895,
            "longitude": 139.6917,
        }
    ]

    client = APIClient()
    response = client.get("/api/v1/location/search/?q=Tokyo")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Tokyo"
    assert data[0]["country"] == "JP"


@pytest.mark.django_db
@patch("services.geocoding.geocoding_service.resolve_coordinates")
def test_location_reverse_success(mock_reverse):
    mock_reverse.return_value = {
        "city": "Kolkata",
        "country": "IN",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "timezone": "Asia/Kolkata",
    }

    client = APIClient()
    response = client.get("/api/v1/location/reverse/?lat=22.5726&lon=88.3639")

    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Kolkata"
    assert data["latitude"] == 22.5726
    assert data["longitude"] == 88.3639
