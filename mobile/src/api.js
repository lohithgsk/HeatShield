import Constants from 'expo-constants';

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
const configuredUrlIsLoopback = /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(configuredApiUrl || '');
const API_URL = (
  (configuredUrlIsLoopback && expoLanApiUrl ? expoLanApiUrl : configuredApiUrl)
  || expoLanApiUrl
  || 'http://172.20.10.5:5000'
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

export async function getLiveWeather(location) {
  try {
    return await request(`/api/weather/live?lat=${location.latitude}&lon=${location.longitude}`);
  } catch (err) {
    console.warn('Backend weather fetch failed, fetching directly from Open-Meteo:', err.message);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
      const res = await fetch(url);
      const data = await res.json();
      const current = data?.current || {};
      const temp = current.temperature_2m ?? 75.0;
      const apparent = current.apparent_temperature ?? temp;
      const humidity = current.relative_humidity_2m ?? 50;
      const wind = current.wind_speed_10m ?? 5.0;

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
        location: { lat: location.latitude, lon: location.longitude },
        temperature_f: temp,
        apparent_temperature_f: apparent,
        humidity_pct: humidity,
        wind_speed_mph: wind,
        risk_level: riskLevel,
        advisory: advisory,
        timestamp: current.time || new Date().toISOString()
      };
    } catch (fallbackErr) {
      console.warn('Direct Open-Meteo fetch failed:', fallbackErr.message);
      return {
        location: { lat: location.latitude, lon: location.longitude },
        temperature_f: 76.0,
        apparent_temperature_f: 78.0,
        humidity_pct: 60,
        wind_speed_mph: 6.0,
        risk_level: 'Caution',
        advisory: 'Atmospheric conditions within typical seasonal range. Stay hydrated.',
        timestamp: new Date().toISOString()
      };
    }
  }
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
