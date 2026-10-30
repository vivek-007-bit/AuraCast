"""
Test Suite for Health and Root API Endpoints
"""

from rest_framework.test import APIClient
import pytest


@pytest.mark.django_db
def test_health_check_endpoint():
    client = APIClient()
    response = client.get("/api/v1/health/")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "AuraCast"
    assert "version" in data
    assert "timestamp_utc" in data
    assert "openweather_configured" in data


@pytest.mark.django_db
def test_api_root_endpoint():
    client = APIClient()
    response = client.get("/api/v1/")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
