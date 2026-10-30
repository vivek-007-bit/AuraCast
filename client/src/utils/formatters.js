/**
 * Formatting helpers for meteorological units, timestamps, and coordinates
 */

export function formatTemp(celsius) {
  if (celsius == null || isNaN(celsius)) return '--°';
  return `${Math.round(celsius)}°`;
}

export function formatCoordinate(lat, lon) {
  if (lat == null || lon == null) return '--';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '--%';
  return `${Math.round(value)}%`;
}
