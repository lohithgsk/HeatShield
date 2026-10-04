import Constants from 'expo-constants';

function apiUrlFromExpoLanHost() {
  // Expo Go receives its bundle from the development machine. In LAN mode, its
  // host URI contains that machine's Wi-Fi address (for example 192.168.1.42:8081).
  // Reuse the address for the API, which runs on port 5000.
  const hostUri = Constants.expoConfig?.hostUri
    || Constants.manifest2?.extra?.expoClient?.hostUri
    || Constants.manifest?.debuggerHost;
  if (!hostUri) return null;

  const host = hostUri.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return `http://${host}:5000`;
}

// An explicit value is useful for production builds and normally wins. During
// Expo LAN development, replace a stale localhost value because localhost on a
// physical phone always means the phone itself, not this development machine.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoLanApiUrl = apiUrlFromExpoLanHost();
const configuredUrlIsLoopback = /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(configuredApiUrl || '');
const API_URL = (
  (configuredUrlIsLoopback && expoLanApiUrl ? expoLanApiUrl : configuredApiUrl)
  || expoLanApiUrl
  || 'http://localhost:5000'
).replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

export function getLiveWeather(location) {
  return request(`/api/weather/live?lat=${location.latitude}&lon=${location.longitude}`);
}

export function getNearestCooling(location) {
  return request('/api/cooling/nearest', {
    method: 'POST',
    body: JSON.stringify({ lat: location.latitude, lon: location.longitude }),
  });
}

export function getAreaSummary(location) {
  return request(`/api/block/me?lat=${location.latitude}&lon=${location.longitude}`);
}

export function getWalkingRoute(origin, destination) {
  return request('/api/walking/route', {
    method: 'POST',
    body: JSON.stringify({
      origin: { lat: origin.latitude, lon: origin.longitude },
      destination: { lat: destination.latitude, lon: destination.longitude },
    }),
  });
}

export function getApiUrl() {
  return API_URL;
}
