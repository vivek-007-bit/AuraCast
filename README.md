# AuraCast Weather & Machine Learning Platform

> Modern, full-stack weather intelligence and hyper-local time-series machine learning platform with separated React frontend and Django REST Framework backend.

---

## 1. Project Overview

**AuraCast** is an intelligent weather forecasting platform that couples real-time meteorological observations with an on-demand, location-specific machine learning prediction engine. 

While classical global Numerical Weather Prediction (NWP) models update only every 6 to 12 hours on large geographical grids, AuraCast dynamically fits an ensemble of **Scikit-Learn Random Forest estimators** directly on the past **30 days of chronological hourly observations** specific to the exact coordinates requested. This enables accurate short-range (6-hour) temperature and humidity trajectories and 24-hour precipitation risk scoring.

The project has been migrated from a monolithic Python server-side rendered application into a modern, decoupled full-stack architecture:
- **Frontend (`/client`)**: React 18, Vite, Tailwind CSS, Lucide Icons, and Chart.js configured for **Netlify**.
- **Backend (`/server`)**: Django 5 and Django REST Framework configured for **Vercel** serverless execution with in-memory TTL caching.

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Netlify)                    │
│   • Application Shell & Skeletons                           │
│   • Search Bar with Geocoding Autocomplete                 │
│   • Current Weather Hero & Atmospheric Metrics Grid         │
│   • Redesigned Hourly Trajectory (6h ML / 24h Baseline)     │
│   • 30-Day Historical Trends Chart                          │
│   • Model Validation & Feature Importance Modal             │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
               │ HTTP GET /api/v1/... (JSON)  │ Structured JSON Responses
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│               Django REST Backend (Vercel)                  │
│   • Location & Reverse Geocoding Service                    │
│   • Live Observation Ingestion (OpenWeather / Open-Meteo)   │
│   • 30-Day Historical Observations Retrieval (Open-Meteo)   │
│   • Feature Engineering (30 Derived Lag/Rolling Predictors) │
│   • Scikit-Learn Random Forest Classifier & Regressors      │
│   • In-Memory TTL Caching (10-Minute Sliding Window)        │
└──────────────┬──────────────────────────────▲───────────────┘
               │ Outbound HTTPS Requests      │ Live & Historical Telemetry
               ▼                              │
┌──────────────────────────────┐┌─────────────────────────────┐
│    OpenWeatherMap API        ││    Open-Meteo Archive &     │
│    (Live Observations)       ││    Forecast APIs (Archive)  │
└──────────────────────────────┘└─────────────────────────────┘
```

### Progressive Loading Flow:
1. **Initial Shell Render**: The React application shell renders immediately with skeleton placeholders.
2. **Instant Weather Fetch (<200ms)**: The client calls `GET /api/v1/weather/current/?city=...`. The Django backend retrieves the current observation (OpenWeather or Open-Meteo fallback) and a 24-hour baseline forecast. The Hero card and 6 atmospheric metrics render instantly.
3. **Asynchronous ML Inference**: With the coordinates resolved, the client triggers `GET /api/v1/weather/prediction/?lat=...&lon=...` in the background. The backend fetches 720 hours of historical telemetry, executes the feature pipeline, fits the Random Forest ensemble, and returns 6-hour hourly trajectories, rain risk probability, and validation metrics without blocking initial page interaction.

---

## 3. Directory Structure

```
AuraCast-New/
├── client/                     # Independent React Frontend
│   ├── public/                 # Static assets & SVG weather icons
│   │   ├── icons/              # Condition icons (sunny, cloudy, rainy, etc.)
│   │   └── favicon.svg         # AuraCast brand favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Skeletons, Alert Banners
│   │   │   └── dashboard/      # Hero, Metrics, Redesigned Hourly, Trends, Modal
│   │   ├── pages/              # WeatherDashboard, ModelDocumentation
│   │   ├── services/           # api.js (DRF Client)
│   │   ├── utils/              # formatters.js, weatherIcons.js
│   │   ├── App.jsx             # React Router DOM configuration
│   │   ├── index.css           # Tailwind base styles & custom animations
│   │   └── main.jsx            # React root entrypoint
│   ├── index.html              # HTML shell
│   ├── netlify.toml            # Strict Netlify deployment configuration
│   ├── package.json            # Vite & React dependencies
│   ├── tailwind.config.js      # Custom theme colors & typography
│   ├── vite.config.js          # Code splitting chunks configuration
│   └── .env.example            # Frontend environment variable reference
├── server/                     # Independent Django REST Backend
│   ├── api/                    # REST Framework App
│   │   ├── serializers.py      # Structured JSON response serializers
│   │   ├── views.py            # API controllers & safe exception handling
│   │   ├── urls.py             # Versioned endpoint routes (/api/v1/...)
│   │   └── tests/              # Pytest Django API and pipeline test suite
│   ├── auracast_project/       # Django Project Core
│   │   ├── settings.py         # App configuration, CORS, and security
│   │   ├── urls.py             # Root URL router
│   │   ├── wsgi.py             # WSGI callable & Vercel entrypoint
│   │   └── asgi.py             # ASGI callable
│   ├── ml/                     # Preserved Custom Machine Learning Engine
│   │   ├── preprocessing.py    # Time-series sanitation & target shifts
│   │   ├── features.py         # 30 derived features (lags, rolling, cyclical)
│   │   ├── models.py           # RandomForestClassifier & 12x Regressors
│   │   └── evaluation.py       # MAE, RMSE, Accuracy, F1 evaluation helpers
│   ├── services/               # Weather Integrations & Orchestration
│   │   ├── geocoding.py        # City search and reverse coordinate lookup
│   │   ├── openweather.py      # OpenWeather live telemetry with fallback
│   │   ├── historical.py       # Open-Meteo 30-day historical archive client
│   │   └── weather_service.py  # Master orchestrator with in-memory TTL caching
│   ├── manage.py               # Django CLI utility
│   ├── pytest.ini              # Pytest configuration
│   ├── requirements.txt        # Backend Python dependencies
│   ├── vercel.json             # Strict Vercel serverless configuration
│   └── .env.example            # Backend environment variable reference
├── .gitignore                  # Global version control rules
└── README.md                   # Complete system documentation
```

---

## 4. Technology Stack

### Frontend:
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM 6 (Client-side SPA)
- **Styling**: Tailwind CSS 3 (Dark aesthetic matching original AuraCast)
- **Charts**: Chart.js 4 & `react-chartjs-2`
- **Icons**: Lucide React & Custom SVG condition assets
- **Deployment Platform**: Netlify

### Backend:
- **Framework**: Django 5.1 & Django REST Framework 3.17
- **Language**: Python 3.11 / 3.14 compatible
- **Machine Learning**: Scikit-Learn 1.9, Pandas 3.1, NumPy 2.5, SciPy 1.18
- **HTTP Client**: HTTPX 0.28 (Async/Sync HTTP client with timeouts)
- **CORS Handling**: `django-cors-headers`
- **Static Assets**: WhiteNoise
- **Testing**: Pytest 9.2 & Pytest-Django 4.14
- **Deployment Platform**: Vercel Serverless Functions (`@vercel/python`)

---

## 5. Machine Learning Pipeline Preservation

The custom machine learning pipeline from the original AuraCast application has been fully preserved and adapted into the Django backend:

1. **Preprocessing (`ml/preprocessing.py`)**:
   - Strict chronological sorting to prevent lookahead bias.
   - Missing data handling: Forward fill (`ffill`) followed by backward fill (`bfill`).
   - Physical constraints: Humidity clipped to $[0, 100]$, precipitation clipped to $\ge 0.0\text{ mm}$.
   - Binary rain target: Forward 24-hour precipitation sum $> 0.2\text{ mm}$.
   - Multi-step regression targets: $h \in \{1, 2, 3, 4, 5, 6\}$ for temperature and humidity.

2. **Feature Engineering (`ml/features.py`)**:
   - Computes **30 exact features** in identical order:
     - Cyclical time: $\sin/\cos$ of hour, $\sin/\cos$ of month, day of week.
     - Meteorological indices: Dew point, wind vector components ($U$ East-West, $V$ North-South).
     - Autoregressive lags: 1h, 2h, 3h, 6h for temperature, humidity, pressure, precipitation.
     - Rolling windows: 6h and 24h rolling means and standard deviations.
     - Pressure tendency: 3-hour barometric delta ($\Delta P_{3h}$).
     - Accumulated precipitation: 24-hour rolling sum.

3. **Model Architecture (`ml/models.py`)**:
   - **Rain Classifier**: `RandomForestClassifier(n_estimators=60, max_depth=6, class_weight='balanced')`.
   - **Multi-Step Regressors**: 6 independent `RandomForestRegressor` models for temperature and 6 for humidity.
   - **Evaluation**: 80% Train / 20% Test chronological split calculating MAE, RMSE, Accuracy, Precision, Recall, and F1 score.

---

## 6. API Endpoint Reference

All endpoints return JSON under `/api/v1/`:

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/v1/health/` | None | Service status, version, and provider configuration |
| `GET` | `/api/v1/location/search/` | `q` (string, min 2 chars) | Autocomplete city search with lat/lon coordinates |
| `GET` | `/api/v1/location/reverse/` | `lat` (float), `lon` (float) | Reverse geocodes coordinates to city/territory |
| `GET` | `/api/v1/weather/current/` | `city` (opt), `lat` (opt), `lon` (opt) | Instant live observation & 24h baseline forecast |
| `GET` | `/api/v1/weather/prediction/` | `lat` (float), `lon` (float) | 30-day historical analysis & 6h ML predictions |
| `GET` | `/api/v1/weather/bundle/` | `city` (opt), `lat` (opt), `lon` (opt) | Unified bundle (current + historical + predictions) |

### Sample Response (`GET /api/v1/weather/current/?city=Tokyo`):
```json
{
  "status": "success",
  "location": {
    "city": "Tokyo",
    "country": "JP",
    "state": "Tokyo",
    "latitude": 35.6895,
    "longitude": 139.69171,
    "timezone": null
  },
  "current": {
    "condition": "Clouds",
    "description": "Partly cloudy",
    "icon": "partly_cloudy",
    "metrics": {
      "temperature": 22.9,
      "feels_like": 22.9,
      "temp_min": 17.5,
      "temp_max": 24.0,
      "humidity": 65,
      "pressure": 1013.25,
      "wind_speed": 3.2,
      "wind_direction_deg": 180,
      "wind_direction_compass": "S",
      "cloudiness": 40,
      "visibility": 10.0
    },
    "sunrise": "06:02",
    "sunset": "16:48",
    "observed_at": "2026-10-30 04:00 UTC",
    "source": "Open-Meteo"
  },
  "hourly_forecast": [
    {
      "time": "13:00",
      "datetime_iso": "2026-10-30T13:00",
      "temperature": 23.5,
      "feels_like": 23.5,
      "humidity": 62,
      "precipitation_prob": 10.0,
      "condition": "Clouds",
      "icon": "partly_cloudy"
    }
  ],
  "is_fallback": true,
  "message": "OpenWeather API key not detected or rate-limited. Using Open-Meteo as high-precision fallback."
}
```

---

## 7. Local Development Guide

### Prerequisites:
- Python 3.11+
- Node.js 18+ and npm

### 7.1 Backend Setup (`/server`):
```bash
cd server

# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Optional: Set OPENWEATHER_API_KEY in .env

# 5. Run Django system checks
python manage.py check

# 6. Run unit & integration tests
pytest

# 7. Start development server
python manage.py runserver 8000
```
Backend runs at `http://localhost:8000/api/v1/`.

### 7.2 Frontend Setup (`/client`):
```bash
cd client

# 1. Install npm packages
npm install

# 2. Configure environment
cp .env.example .env
# Defaults to: VITE_API_BASE_URL=http://localhost:8000/api/v1

# 3. Start Vite dev server
npm run dev
```
Frontend runs at `http://localhost:5173/`.

---

## 8. Deployment Configuration

### 8.1 Netlify Frontend Deployment:
1. Connect your repository to **Netlify**.
2. Set **Base directory**: `client`
3. Set **Build command**: `npm run build`
4. Set **Publish directory**: `client/dist` (or `dist` if base is `client`)
5. In **Environment variables**, set:
   - `VITE_API_BASE_URL`: `https://your-backend.vercel.app/api/v1`
6. `client/netlify.toml` handles SPA redirects (`/*` to `/index.html 200`) and immutable asset caching.

### 8.2 Vercel Backend Deployment:
1. Connect your repository to **Vercel**.
2. Set **Root directory**: `server`
3. Vercel automatically detects `server/vercel.json` and builds `auracast_project/wsgi.py` using `@vercel/python`.
4. In **Project Settings -> Environment Variables**, configure:
   - `DJANGO_SECRET_KEY`: `<generate-a-secure-random-key>`
   - `DJANGO_DEBUG`: `False`
   - `DJANGO_ALLOWED_HOSTS`: `.vercel.app`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.netlify.app`
   - `OPENWEATHER_API_KEY`: `<your-optional-key>`

---

## 9. Performance Optimizations

1. **Progressive Decoupled Loading**: Current weather observations load in <200ms. Heavy ML training and 720-point historical retrievals execute asynchronously without blocking page rendering.
2. **In-Memory TTL Caching**: The Django service maintains a 10-minute sliding window cache keyed by coordinate pairs. Subsequent queries for the same city do not re-train models or exceed third-party API rate limits.
3. **Vite Code Splitting**: Frontend bundles are partitioned into `vendor`, `charts` (`chart.js`), and `icons` chunks, ensuring the initial application shell remains lightweight (~57 kB).
4. **Resilient Provider Fallback**: If OpenWeatherMap credentials are not configured or rate-limited, AuraCast transparently falls back to Open-Meteo with zero interruption to the user.

---

## 10. Verification & Test Results

- **Backend Pytest Suite**: 13/13 tests passed (health endpoints, geocoding validation, reverse lookup, current weather serializer, ML prediction pipeline, feature engineering, and target transformations).
- **Live Integration Check**: Verified live coordinate resolution for Tokyo, live Open-Meteo observation retrieval, 730 historical data point retrieval, and on-demand Random Forest training.
- **Frontend Production Build**: Vite production build succeeded in 5.41s with valid CSS and JS bundles in `client/dist/`.
- **Original Source Integrity**: The original source project at `C:\Users\Acer\Documents\Vivek\AuraCast` remains 100% untouched and clean.
