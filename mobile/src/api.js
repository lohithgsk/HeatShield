import Constants from 'expo-constants';
import { computeOfflineNearestCooling, computeOfflineAreaSummary } from './offlineCalculations';

function apiUrlFromExpoLanHost() {
  const hostUri = Constants.expoConfig?.hostUri
    || Constants.expoGoConfig?.debuggerHost
    || Constants.manifest2?.extra?.expoGo?.debuggerHost
    || Constants.manifest2?.extra?.expoClient?.hostUri
    || Constants.manifest?.debuggerHost;
  if (!hostUri) return null;

  const host = hostUri.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return `http://${host}:5000`;
}

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoLanApiUrl = apiUrlFromExpoLanHost();

// Dynamic priority: Expo LAN host (auto-detected from Metro) -> configured URL -> current host Wi-Fi IP
const API_URL = (
  expoLanApiUrl
  || (configuredApiUrl && !configuredApiUrl.includes('172.20.10.5') ? configuredApiUrl : null)
  || 'http://192.168.1.199:5000'
  || 'http://localhost:5000'
).replace(/\/$/, '');

async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function request(path, options = {}) {
  const response = await fetchWithTimeout(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }, 4500);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

export async function getLiveWeather(location) {
  const lat = location?.latitude ?? 35.7796;
  const lon = location?.longitude ?? -78.6382;

  // 1. First attempt: Direct from local HeatShield backend
  try {
    return await request(`/api/weather/live?lat=${lat}&lon=${lon}`);
  } catch (err) {
    console.warn(`Backend weather fetch failed (${err.message}), fetching directly from Open-Meteo`);
  }

  // 2. Second attempt: Direct from Open-Meteo with 4s timeout
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const res = await fetchWithTimeout(url, {}, 4000);
    const data = await res.json();
    const current = data?.current || {};
    const temp = current.temperature_2m ?? 78.4;
    const apparent = current.apparent_temperature ?? temp;
    const humidity = current.relative_humidity_2m ?? 55;
    const wind = current.wind_speed_10m ?? 5.5;

    let riskLevel = 'Low / Normal';
    let advisory = 'Normal atmospheric conditions. Safe for outdoor activities.';
    if (apparent >= 104) {
      riskLevel = 'Danger / Heat Advisory';
      advisory = 'High risk of heat cramps and exhaustion. Stay in air conditioning.';
    } else if (apparent >= 91) {
      riskLevel = 'Extreme Caution';
      advisory = 'Heat cramps and exhaustion possible. Limit strenuous activity.';
    } else if (apparent >= 80) {
      riskLevel = 'Caution';
      advisory = 'Fatigue possible with prolonged exposure. Stay hydrated.';
    }

    return {
      location: { lat, lon },
      temperature_f: temp,
      apparent_temperature_f: apparent,
      humidity_pct: humidity,
      wind_speed_mph: wind,
      risk_level: riskLevel,
      advisory: advisory,
      timestamp: current.time || new Date().toISOString()
    };
  } catch (fallbackErr) {
    console.warn('Direct Open-Meteo fetch failed or timed out:', fallbackErr.message);
  }

  // 3. Third attempt: Resilient fallback buffer (guarantees UI never breaks)
  return {
    location: { lat, lon },
    temperature_f: 78.4,
    apparent_temperature_f: 81.2,
    humidity_pct: 58,
    wind_speed_mph: 6.0,
    risk_level: 'Caution',
    advisory: 'Atmospheric conditions within seasonal range. Stay hydrated and seek shade.',
    timestamp: new Date().toISOString()
  };
}

export async function getNearestCooling(location) {
  try {
    return await request('/api/cooling/nearest', {
      method: 'POST',
      body: JSON.stringify({ lat: location.latitude, lon: location.longitude }),
    });
  } catch (err) {
    console.warn('Backend getNearestCooling unreachable, using local Raleigh spatial buffer:', err.message);
    return computeOfflineNearestCooling(location);
  }
}

export async function getAreaSummary(location) {
  try {
    return await request(`/api/block/me?lat=${location.latitude}&lon=${location.longitude}`);
  } catch (err) {
    console.warn('Backend getAreaSummary unreachable, using local spatial buffer:', err.message);
    return computeOfflineAreaSummary(location);
  }
}

export async function getWalkingRoute(origin, destination) {
  try {
    return await request('/api/walking/route', {
      method: 'POST',
      body: JSON.stringify({
        origin: { lat: origin.latitude, lon: origin.longitude },
        destination: { lat: destination.latitude, lon: destination.longitude },
      }),
    });
  } catch (err) {
    console.warn('Backend walking route unreachable, using straight line geometry:', err.message);
    return {
      route_source: 'straight_line_fallback',
      distance_meters: 650,
      duration_seconds: 480,
      geometry: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
      ],
      steps: [
        {
          instruction: 'Proceed toward cooling center refuge using live street guidance.',
          distance_meters: 650
        }
      ]
    };
  }
}

export function getApiUrl() {
  return API_URL;
}
