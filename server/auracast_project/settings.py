"""
Django settings for AuraCast Full-Stack Weather & ML Service.
Configured for local development and Vercel serverless deployment.
"""

from pathlib import Path
import os
import sys
from dotenv import load_dotenv

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Add BASE_DIR to Python path
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load environment variables
load_dotenv(BASE_DIR / ".env")

# Security and Debug
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-auracast-weather-production-key-change-in-production-vault"
)

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

# Allowed Hosts
ALLOWED_HOSTS_RAW = os.getenv("DJANGO_ALLOWED_HOSTS", "*")
if ALLOWED_HOSTS_RAW == "*":
    ALLOWED_HOSTS = ["*"]
else:
    ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS_RAW.split(",") if h.strip()]

# Application definition
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api.apps.ApiConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "auracast_project.urls"

TEMPLATES = []

WSGI_APPLICATION = "auracast_project.wsgi.application"

# Database: Minimal in-memory / local SQLite if needed
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all in development
CORS_ALLOWED_ORIGINS_RAW = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in CORS_ALLOWED_ORIGINS_RAW.split(",") if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "OPTIONS"]
CORS_ALLOW_HEADERS = ["*"]

# Django REST Framework Configuration
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "UNAUTHENTICATED_USER": None,
    "EXCEPTION_HANDLER": "api.views.custom_exception_handler",
}

# AuraCast Weather Application Settings
APP_NAME = "AuraCast"
APP_VERSION = "2.0.0"
DEFAULT_CITY = "Kolkata"
DEFAULT_LAT = 22.5726
DEFAULT_LON = 88.3639
DEFAULT_COUNTRY = "IN"

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0"
OPENMETEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
OPENMETEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPENMETEO_GEO_URL = "https://geocoding-api.open-meteo.com/v1"

HISTORICAL_DAYS = int(os.getenv("HISTORICAL_DAYS", "30"))
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10.0"))
ML_N_ESTIMATORS = int(os.getenv("ML_N_ESTIMATORS", "60"))
ML_RANDOM_STATE = int(os.getenv("ML_RANDOM_STATE", "42"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "600"))
