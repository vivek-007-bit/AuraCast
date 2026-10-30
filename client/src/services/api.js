/**
 * AuraCast API Service Layer
 * Interfaces with Django REST Framework endpoints.
 * Never calls external weather providers directly from the frontend.
 */

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    // Strip trailing slashes
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Default fallback for relative proxy / same-domain routing
  return '/api/v1';
};

const API_BASE = getApiBaseUrl();

/**
 * Handle HTTP JSON responses and format structured errors
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response
    }
    const message =
      errorData?.error?.message ||
      errorData?.detail ||
      `Request failed with status ${response.status}`;
    const code = errorData?.error?.code || 'API_ERROR';
    const error = new Error(message);
    error.code = code;
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/**
 * Health check endpoint
 */
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health/`);
  return handleResponse(res);
}

/**
 * Search locations by query string (autocomplete)
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({ q: query.trim() });
  const res = await fetch(`${API_BASE}/location/search/?${params}`);
  return handleResponse(res);
}

/**
 * Reverse geocoding lookup from coordinates
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  const res = await fetch(`${API_BASE}/location/reverse/?${params}`);
  return handleResponse(res);
}

/**
 * Fast Current Weather Bundle (Location + Live Observation + 24h Baseline Forecast)
 * Enables instant progressive rendering (<200ms).
 */
export async function fetchCurrentWeather({ city, lat, lon }) {
  const params = new URLSearchParams();
  if (city && city.trim()) params.append('city', city.trim());
  if (lat != null && lon != null) {
    params.append('lat', String(lat));
    params.append('lon', String(lon));
  }
  const res = await fetch(`${API_BASE}/weather/current/?${params}`);
  return handleResponse(res);
}

/**
 * Location-specific ML Prediction Bundle
 * Fetches 30-day historical analysis + executes on-demand Random Forest predictions.
 */
export async function fetchPrediction({ lat, lon }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  const res = await fetch(`${API_BASE}/weather/prediction/?${params}`);
  return handleResponse(res);
}

/**
 * Complete Weather Bundle (All-in-one fallback)
 */
export async function fetchWeatherBundle({ city, lat, lon }) {
  const params = new URLSearchParams();
  if (city && city.trim()) params.append('city', city.trim());
  if (lat != null && lon != null) {
    params.append('lat', String(lat));
    params.append('lon', String(lon));
  }
  const res = await fetch(`${API_BASE}/weather/bundle/?${params}`);
  return handleResponse(res);
}
