/**
 * Maps condition keys to SVG icon file paths in /icons/
 */

export function getWeatherIconPath(iconKey) {
  const normalized = (iconKey || 'cloudy').toLowerCase().trim();
  const validIcons = [
    'sunny',
    'cloudy',
    'partly_cloudy',
    'rainy',
    'thunderstorm',
    'snow',
    'fog',
  ];

  if (validIcons.includes(normalized)) {
    return `/icons/${normalized}.svg`;
  }

  // Condition substring matching fallback
  if (normalized.includes('clear') || normalized.includes('sun')) return '/icons/sunny.svg';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return '/icons/rainy.svg';
  if (normalized.includes('thunder') || normalized.includes('storm')) return '/icons/thunderstorm.svg';
  if (normalized.includes('snow') || normalized.includes('ice')) return '/icons/snow.svg';
  if (normalized.includes('fog') || normalized.includes('mist') || normalized.includes('haze')) return '/icons/fog.svg';

  return '/icons/partly_cloudy.svg';
}
