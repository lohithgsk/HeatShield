import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { colors, default as styles } from './src/styles';
import { getAreaSummary, getApiUrl, getLiveWeather, getNearestCooling, getWalkingRoute } from './src/api';

const FALLBACK_LOCATION = { latitude: 35.7796, longitude: -78.6382 };

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return 'Distance unavailable';
  return meters < 1609 ? `${Math.round(meters)} m` : `${(meters / 1609.34).toFixed(1)} mi`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'Time unavailable';
  return `${Math.max(1, Math.round(seconds / 60))} min walk`;
}

function availability(resource) {
  if (resource.open_now === true) return { label: 'Open now', unknown: false };
  if (resource.open_now === false) return { label: 'Closed now', unknown: false };
  return { label: 'Hours unknown', unknown: true };
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState('checking');
  const [weather, setWeather] = useState(null);
  const [cooling, setCooling] = useState(null);
  const [area, setArea] = useState(null);
  const [route, setRoute] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busy, setBusy] = useState(true);
  const [routeBusy, setRouteBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadData(nextLocation) {
    setBusy(true);
    setError('');

    // Fetch live weather immediately with high priority
    getLiveWeather(nextLocation)
      .then(w => setWeather(w))
      .catch(err => console.warn('Weather fetch error:', err.message));

    try {
      const [nextCooling, nextArea] = await Promise.allSettled([
        getNearestCooling(nextLocation),
        getAreaSummary(nextLocation),
      ]);
      if (nextCooling.status === 'fulfilled') setCooling(nextCooling.value);
      if (nextArea.status === 'fulfilled') setArea(nextArea.value);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  }

  async function locate() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermission('denied');
      setLocation(FALLBACK_LOCATION);
      await loadData(FALLBACK_LOCATION);
      return;
    }
    setPermission('granted');
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const nextLocation = { latitude: current.coords.latitude, longitude: current.coords.longitude };
    setLocation(nextLocation);
    await loadData(nextLocation);
  }

  useEffect(() => {
    locate().catch(loadError => {
      setPermission('error');
      setLocation(FALLBACK_LOCATION);
      setError(loadError.message);
      loadData(FALLBACK_LOCATION);
    });
  }, []);

  async function requestRoute() {
    const destination = cooling?.nearest_indoor_refuge || cooling?.nearest_asset;
    if (!location || !destination) return;
    setRouteBusy(true);
    try {
      setRoute(await getWalkingRoute(location, { latitude: destination.latitude, longitude: destination.longitude }));
    } catch (routeError) {
      Alert.alert('Route unavailable', routeError.message);
    } finally {
      setRouteBusy(false);
    }
  }

  async function openWalkingDirections() {
    const destination = cooling?.nearest_indoor_refuge || cooling?.nearest_asset;
    if (!location || !destination) return;

    const origin = `${location.latitude},${location.longitude}`;
    const target = `${destination.latitude},${destination.longitude}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(target)}&travelmode=walking`;

    try {
      await Linking.openURL(directionsUrl);
    } catch {
      Alert.alert('Maps unavailable', 'Unable to open walking directions on this device.');
    }
  }

  const nearest = cooling?.nearest_indoor_refuge || cooling?.nearest_asset;
  const status = nearest ? availability(nearest) : null;
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Raleigh, North Carolina</Text>
            <Text style={styles.title}>Beat the heat.</Text>
            <Text style={[styles.caption, { marginTop: 5 }]}>A clear next step for hot days.</Text>
          </View>
          <View style={styles.locationDot} />
        </View>

        {permission === 'denied' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location is off</Text>
            <Text style={[styles.caption, { marginTop: 6 }]}>Showing Raleigh downtown as a preview. Turn on location for results near you.</Text>
          </View>
        )}

        <View style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <View>
              <Text style={styles.weatherTitle}>CURRENT HEAT CHECK</Text>
              <Text style={styles.temperature}>{weather?.apparent_temperature_f ?? '--'}<Text style={styles.degree}>°F</Text></Text>
            </View>
            <Text style={styles.risk}>{weather?.risk_level || 'Loading'}</Text>
          </View>
          <Text style={styles.weatherAdvisory}>{weather?.advisory || 'Checking the current conditions around you.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nearest cool place</Text>
            {status && <View style={[styles.badge, status.unknown && styles.badgeUnknown]}><Text style={[styles.badgeText, status.unknown && styles.badgeUnknownText]}>{status.label}</Text></View>}
          </View>
          {busy && !nearest ? <ActivityIndicator color={colors.rust} /> : nearest ? (
            <>
              <Text style={styles.refugeName}>{nearest.name}</Text>
              <Text style={styles.refugeMeta}>{formatDistance(nearest.distance_meters)} away · {nearest.walk_minutes || '--'} min estimated walk</Text>
              <Text style={styles.refugeMeta}>{nearest.type || nearest.category || 'Cooling resource'} · {nearest.hours_today || 'Hours unavailable'}</Text>
              <TouchableOpacity style={styles.action} onPress={requestRoute} disabled={routeBusy}>
                <Text style={styles.actionText}>{routeBusy ? 'Finding a route...' : 'Show walking route'}</Text>
              </TouchableOpacity>
              {cooling.top_options?.slice(1, 4).map(option => <View style={styles.option} key={`${option.name}-${option.latitude}`}><Text style={styles.optionName}>{option.name}</Text><Text style={styles.optionMeta}>{formatDistance(option.distance_meters)} · {availability(option).label}</Text></View>)}
            </>
          ) : <Text style={styles.error}>No cooling resource is available right now.</Text>}
        </View>

        {route && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Walking route</Text>
            <Text style={styles.routeTitle}>{formatDuration(route.duration_seconds)}</Text>
            <Text style={styles.routeMeta}>{formatDistance(route.distance_meters)} · {route.route_source === 'straight_line_fallback' ? 'Map handoff recommended' : 'Local walking graph'}</Text>
            <TouchableOpacity style={[styles.action, styles.secondaryAction]} onPress={openWalkingDirections}>
              <Text style={[styles.actionText, styles.secondaryActionText]}>Open walking directions</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 8 }}>{route.steps?.map((step, index) => <View style={styles.step} key={`${step.instruction}-${index}`}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepInstruction}>{step.instruction}</Text><Text style={styles.stepDistance}>{formatDistance(step.distance_meters)}</Text></View>)}</View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>My area</Text><Text style={styles.sectionLabel}>{area?.geography === 'census_tract' ? 'Census tract' : ''}</Text></View>
          {area ? <><Text style={styles.summary}>{area.summary}</Text><TouchableOpacity onPress={() => setDetailsOpen(open => !open)}><Text style={styles.detailToggle}>{detailsOpen ? 'Hide details' : 'See the data behind this'}</Text></TouchableOpacity>{detailsOpen && <View style={styles.detailGrid}>{[['Surface temp', `${area.metrics.surface_temp_f}°F`], ['Tree canopy', `${area.metrics.canopy_cover_pct}%`], ['Pavement proxy', `${area.metrics.impervious_pct}%`], ['Heat vulnerability', `${area.metrics.heat_vulnerability_index}/100`], ['NDVI', area.metrics.ndvi_vegetation], ['Area percentile', `${area.temperature_percentile}th`]].map(([label, value]) => <View style={styles.detailItem} key={label}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{String(value ?? '--')}</Text></View>)}</View>}<Text style={styles.footer}>Based on the surrounding census tract, not a building-level diagnosis.</Text></> : <Text style={styles.loading}>Finding the heat profile for your area.</Text>}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.footer}>Data from the Raleigh Climate Hub · API: {getApiUrl()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
