import { Navigation } from 'lucide-react';
import React, { useMemo, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  CircleMarker, 
  Circle, 
  Polyline,
  Popup, 
  useMapEvents,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import HeatmapLayer from './HeatmapLayer';
import { computeModeledTractTemperature, computeModeledTractHvi } from '../data/historicalHeatwaves';

// Color interpolators
function getHviColor(val) {
  if (val >= 75) return '#B4473D'; // Extreme
  if (val >= 55) return '#CC653E'; // High
  if (val >= 35) return '#D1A33A'; // Moderate
  return '#4E8064'; // Low
}

function getTempColor(val) {
  if (val >= 106) return '#B4473D'; // Extreme
  if (val >= 102) return '#B4473D'; // Extreme
  if (val >= 98)  return '#CC653E'; // High
  if (val >= 94)  return '#D1A33A'; // Moderate
  if (val >= 90)  return '#4E8064'; // Low
  return '#4E8064';
}

function getCanopyColor(val) {
  if (val >= 48) return '#4E8064';
  if (val >= 35) return '#D1A33A';
  if (val >= 25) return '#D58A3C';
  if (val >= 18) return '#CC653E';
  return '#B4473D';
}

function getMetricColor(metric, p) {
  switch (metric) {
    case 'Surface Temperature (°F)':
      return getTempColor(Number(p.surface_temp_f) || 94);
    case 'Tree Canopy Cover (%)':
      return getCanopyColor(Number(p.canopy_cover_pct) || 30);
    case 'Impervious Surface (%)':
      return Number(p.impervious_pct) >= 65 ? '#B4473D' : (Number(p.impervious_pct) >= 45 ? '#D58A3C' : '#4E8064');
    case 'Poverty Rate (%)':
      return Number(p.poverty_rate) >= 25 ? '#B4473D' : (Number(p.poverty_rate) >= 15 ? '#D58A3C' : '#4E8064');
    case 'Senior Population 65+ (%)':
      return Number(p.pct_elderly) >= 20 ? '#B4473D' : (Number(p.pct_elderly) >= 14 ? '#D1A33A' : '#4E8064');
    case 'Heat Vulnerability Index (HVI)':
    default:
      return getHviColor(Number(p.heat_vulnerability_index) || 50);
  }
}

// Centroid calculation for tracts
function getFeatureCentroid(feature) {
  if (feature.properties?.CENTLAT && feature.properties?.CENTLON) {
    return [Number(feature.properties.CENTLAT), Number(feature.properties.CENTLON)];
  }
  const geom = feature.geometry;
  if (!geom) return null;
  let pts = [];
  if (geom.type === 'Polygon') {
    pts = geom.coordinates[0];
  } else if (geom.type === 'MultiPolygon') {
    pts = geom.coordinates[0]?.[0];
  }
  if (!pts || pts.length === 0) return null;
  let sumLat = 0, sumLon = 0;
  for (let i = 0; i < pts.length; i++) {
    sumLon += pts[i][0];
    sumLat += pts[i][1];
  }
  return [sumLat / pts.length, sumLon / pts.length];
}

// Map Controller for smooth flyTo & sizing
function MapController({ flyToCoords }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (flyToCoords?.lat && flyToCoords?.lon) {
      map.flyTo([flyToCoords.lat, flyToCoords.lon], 15, { duration: 1.2 });
    }
  }, [flyToCoords, map]);
  return null;
}

// Click handler component for placing interventions and selecting tracts
function MapClickHandler({ isPlacing, onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

export default function MapView({
  tractsGeoJSON,
  coolingResources,
  activeMetric,
  showDeadZones,
  showResources,
  showBuffers,
  selectedResourceTypes,
  selectedTract,
  onSelectTract,
  activeIntervention,
  isPlacingIntervention,
  onInterventionPlaced,
  basemap = 'dark',
  userLocation,
  userAddress,
  onRecenterUser,
  liveWeather,
  onFindNearest,
  alerts,
  flyToCoords,
  // Live heatmap & historical replay props
  showHeatmap = false,
  heatmapMode = 'surface_temp',
  heatmapRadius = 32,
  heatmapBlur = 24,
  dimChoropleth = false,
  isHistoricalReplayActive = false,
  historicalStep = null,
  // Heatwave War Room props
  isWarRoomActive = false,
  warRoomScenario = null,
  warRoomMitigation = null,
  activeActionIds = [],
  warRoomViewMode = 'mitigated',
  setWarRoomViewMode,
  onOpenWarRoom,
  onExitWarRoom
}) {
  const center = [35.7796, -78.6382];

  const tileUrls = {
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const assetColors = {
    'Public Library': '#315F7D',
    'Community Center': '#315F7D',
    'Public Pool / Aquatic': '#315F7D',
    'Park / Tree Shade': '#10b981'
  };

  // Generate dynamic heatmap points combining tract microclimates, War Room forecast, and monitoring stations
  const heatmapPoints = useMemo(() => {
    if (!showHeatmap || !tractsGeoJSON?.features) return [];

    const pts = [];

    tractsGeoJSON.features.forEach(f => {
      const c = getFeatureCentroid(f);
      if (!c) return;

      let temp = Number(f.properties.surface_temp_f) || 94;
      let hvi = Number(f.properties.heat_vulnerability_index) || 50;

      if (isWarRoomActive && warRoomScenario) {
        const basePeak = warRoomScenario.ambientPeakTempF || 106;
        const impervious = Number(f.properties.impervious_pct) || 50;
        const canopy = Number(f.properties.canopy_cover_pct) || 30;
        temp = basePeak + ((impervious - 40) / 60) * 5.0 - ((canopy - 20) / 60) * 4.0;
        if (warRoomViewMode === 'mitigated' && activeActionIds.length > 0) {
          temp -= 4.2; // Mitigation cooling benefit
        }
      } else if (isHistoricalReplayActive && historicalStep) {
        temp = computeModeledTractTemperature(f.properties, historicalStep);
        hvi = computeModeledTractHvi(f.properties, historicalStep);
      }

      let intensity = 0.5;
      if (heatmapMode === 'hvi') {
        intensity = Math.max(0.12, Math.min(1.0, hvi / 100));
      } else {
        // Normalize surface temperature: 80°F -> 0.15, 108°F -> 1.0
        intensity = Math.max(0.15, Math.min(1.0, (temp - 80) / 28));
      }

      pts.push([c[0], c[1], intensity]);
    });

    // Anchor Raleigh microclimate nodes from Tiger Data network
    const isCrisis = isWarRoomActive || isHistoricalReplayActive;
    const stations = [
      { lat: 35.7796, lon: -78.6382, weight: isCrisis ? 0.98 : 0.88 }, // Downtown core
      { lat: 35.7712, lon: -78.6271, weight: isCrisis ? 0.96 : 0.85 }, // SE Raleigh
      { lat: 35.8364, lon: -78.6433, weight: 0.72 }, // North Hills
      { lat: 35.7688, lon: -78.6750, weight: 0.52 }, // Centennial Campus
      { lat: 35.8900, lon: -78.7500, weight: 0.20 }, // Umstead Forest
      { lat: 35.8776, lon: -78.7875, weight: 0.48 }  // RDU Airport
    ];

    stations.forEach(s => {
      pts.push([s.lat, s.lon, s.weight]);
    });

    return pts;
  }, [showHeatmap, tractsGeoJSON, isHistoricalReplayActive, historicalStep, isWarRoomActive, warRoomScenario, warRoomViewMode, activeActionIds, heatmapMode]);

  const tractStyle = (feature) => {
    const p = feature.properties;
    const isSelected = selectedTract && selectedTract.geoid === p.geoid;
    const isDeadZone = p.is_dead_zone && showDeadZones;

    let fillColor;
    let borderColor = isSelected ? '#ffffff' : (isDeadZone ? '#ef4444' : '#1e293b');
    let borderWidth = isSelected ? 3 : (isDeadZone ? 2.5 : 1);
    let borderDash = isDeadZone && !isSelected ? '4, 4' : null;

    if (isWarRoomActive && warRoomScenario) {
      const basePeak = warRoomScenario.ambientPeakTempF || 106.8;
      const impervious = Number(p.impervious_pct) || 50;
      const canopy = Number(p.canopy_cover_pct) || 30;
      let predTemp = basePeak + ((impervious - 40) / 60) * 5.0 - ((canopy - 20) / 60) * 4.0;

      if (warRoomViewMode === 'mitigated' && activeActionIds.length > 0) {
        predTemp -= 4.2;
        fillColor = getTempColor(predTemp);
        if (p.is_dead_zone) {
          borderColor = '#10b981'; // Shielded
          borderWidth = 2.5;
        }
      } else {
        // Unmitigated threat
        fillColor = getTempColor(predTemp);
        if (p.is_dead_zone || predTemp >= 106) {
          borderColor = '#ef4444';
          borderWidth = 3;
          borderDash = '5, 5';
        }
      }
    } else if (isHistoricalReplayActive && historicalStep) {
      const modeledTemp = computeModeledTractTemperature(p, historicalStep);
      const modeledHvi = computeModeledTractHvi(p, historicalStep);
      fillColor = activeMetric === 'Heat Vulnerability Index (HVI)'
        ? getHviColor(modeledHvi)
        : getTempColor(modeledTemp);
    } else {
      fillColor = getMetricColor(activeMetric, p);
    }

    const fillOpacity = isSelected 
      ? 0.85 
      : (dimChoropleth && showHeatmap ? 0.15 : 0.65);

    return {
      fillColor: fillColor,
      weight: borderWidth,
      opacity: dimChoropleth && showHeatmap ? 0.35 : 0.9,
      color: borderColor,
      dashArray: borderDash,
      fillOpacity: fillOpacity
    };
  };

  const onEachTract = (feature, layer) => {
    layer.on({
      click: (e) => {
        if (isPlacingIntervention && onInterventionPlaced) {
          const latlng = e.latlng || (e.target && e.target.getLatLng ? e.target.getLatLng() : null);
          if (latlng) {
            onInterventionPlaced({ lat: latlng.lat, lon: latlng.lng, lng: latlng.lng });
            return;
          }
        }
        if (!isPlacingIntervention && onSelectTract) {
          const tractData = { ...feature.properties };
          if (isWarRoomActive && warRoomScenario) {
            const basePeak = warRoomScenario.ambientPeakTempF || 106.8;
            const impervious = Number(feature.properties.impervious_pct) || 50;
            const canopy = Number(feature.properties.canopy_cover_pct) || 30;
            let predTemp = basePeak + ((impervious - 40) / 60) * 5.0 - ((canopy - 20) / 60) * 4.0;
            if (warRoomViewMode === 'mitigated') predTemp -= 4.2;
            tractData.modeled_temp_f = Math.round(predTemp * 10) / 10;
          } else if (isHistoricalReplayActive && historicalStep) {
            tractData.modeled_temp_f = computeModeledTractTemperature(feature.properties, historicalStep);
            tractData.modeled_hvi = computeModeledTractHvi(feature.properties, historicalStep);
          }
          onSelectTract(tractData);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        if (!selectedTract || selectedTract.geoid !== feature.properties.geoid) {
          l.setStyle({ fillOpacity: dimChoropleth && showHeatmap ? 0.4 : 0.8, weight: 2 });
        }
      },
      mouseout: (e) => {
        const l = e.target;
        if (!selectedTract || selectedTract.geoid !== feature.properties.geoid) {
          l.setStyle({ 
            fillOpacity: dimChoropleth && showHeatmap ? 0.15 : 0.65, 
            weight: feature.properties.is_dead_zone && showDeadZones ? 2.5 : 1 
          });
        }
      }
    });

    const p = feature.properties;
    let tooltipHtml = '';

    if (isWarRoomActive && warRoomScenario) {
      const basePeak = warRoomScenario.ambientPeakTempF || 106.8;
      const impervious = Number(p.impervious_pct) || 50;
      const canopy = Number(p.canopy_cover_pct) || 30;
      let predTemp = basePeak + ((impervious - 40) / 60) * 5.0 - ((canopy - 20) / 60) * 4.0;
      if (warRoomViewMode === 'mitigated') predTemp -= 4.2;
      predTemp = Math.round(predTemp * 10) / 10;

      tooltipHtml = `
        <div style="font-family:sans-serif;font-size:12px;min-width:190px;">
          <b style="font-size:13px;color:#0f172a;">${p.neighborhood || p.name || 'Census Tract'}</b>
          <div style="color:${warRoomViewMode === 'mitigated' ? '#10b981' : '#ef4444'};font-weight:bold;margin:2px 0;">
            ⚡ WAR ROOM: ${warRoomViewMode === 'mitigated' ? 'Mitigated with Playbook' : 'Unmitigated Impending Threat'}
          </div>
          <div>Projected Peak Temp: <b style="color:${getTempColor(predTemp)};font-size:13px;">${predTemp}°F</b></div>
          <div style="color:#64748b;font-size:11px;margin-top:2px;">Canopy: ${p.canopy_cover_pct}% · Impervious: ${p.impervious_pct}%</div>
          ${p.is_dead_zone ? `<div style="color:${warRoomViewMode === 'mitigated' ? '#10b981' : '#ef4444'};font-weight:bold;margin-top:3px;">
            ${warRoomViewMode === 'mitigated' ? '🛡️ Protected by Emergency Interventions' : '🚨 Critical Heatwave Breach Zone'}
          </div>` : ''}
        </div>
      `;
    } else if (isHistoricalReplayActive && historicalStep) {
      const modeledTemp = computeModeledTractTemperature(p, historicalStep);
      const modeledHvi = computeModeledTractHvi(p, historicalStep);
      const origTemp = Number(p.surface_temp_f) || 94;
      const delta = (modeledTemp - origTemp).toFixed(1);

      tooltipHtml = `
        <div style="font-family:sans-serif;font-size:12px;min-width:180px;">
          <b style="font-size:13px;color:#0f172a;">${p.neighborhood || p.name || 'Census Tract'}</b>
          <div style="color:#d97706;font-weight:bold;margin:2px 0;">Replay: ${historicalStep.label}</div>
          <div style="color:#475569;">Modeled Surface: <b style="color:${getTempColor(modeledTemp)};font-size:13px;">${modeledTemp}°F</b> (${delta >= 0 ? `+${delta}` : delta}°F delta)</div>
          <div style="color:#475569;">Modeled HVI: <b>${modeledHvi}/100</b></div>
          <div style="color:#64748b;font-size:11px;margin-top:3px;">Canopy: ${p.canopy_cover_pct}% · Impervious: ${p.impervious_pct}%</div>
          ${p.is_dead_zone ? '<div style="color:#ef4444;font-weight:bold;margin-top:3px;">🚨 Critical Dead Zone</div>' : ''}
        </div>
      `;
    } else {
      tooltipHtml = `
        <div style="font-family:sans-serif;font-size:12px;">
          <b style="font-size:13px;color:#0f172a;">${p.neighborhood || p.name || 'Census Tract'}</b><br/>
          HVI Score: <b>${p.heat_vulnerability_index}/100</b><br/>
          Surface Temp: <b>${p.surface_temp_f}°F</b><br/>
          Canopy: <b>${p.canopy_cover_pct}%</b><br/>
          ${p.is_dead_zone ? '<span style="color:#ef4444;font-weight:bold;">🚨 Critical Dead Zone</span>' : ''}
        </div>
      `;
    }

    layer.bindTooltip(tooltipHtml, { sticky: true, className: 'map-tooltip' });
  };

  const filteredResources = useMemo(() => {
    if (!coolingResources || !coolingResources.features) return [];
    return coolingResources.features.filter(res => 
      selectedResourceTypes.includes(res.properties.type)
    );
  }, [coolingResources, selectedResourceTypes]);

  return (
    <div 
      className="map-viewport map-view-wrapper" 
      style={{ 
        flex: 1, 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        cursor: isPlacingIntervention ? 'crosshair' : 'default'
      }}
    >
      
      {/* Floating War Room Active Banner */}
      {isWarRoomActive && (
        <div className="war-room-map-banner">
          <div className="banner-left">
            <span className="banner-tag">⚡ WAR ROOM SIMULATION</span>
            <span className="banner-title">{warRoomScenario?.name || 'Category 4 Heat Dome'}</span>
            <div className="seg-control" style={{ marginLeft: 12 }}>
              <button 
                className={`seg-btn ${warRoomViewMode === 'unmitigated' ? 'active' : ''}`}
                onClick={() => setWarRoomViewMode('unmitigated')}
                style={{ color: warRoomViewMode === 'unmitigated' ? '#ef4444' : undefined }}
              >
                Unmitigated Threat ({warRoomScenario?.baselineImpacts?.predictedCasualties || 48} Casualties)
              </button>
              <button 
                className={`seg-btn ${warRoomViewMode === 'mitigated' ? 'active' : ''}`}
                onClick={() => setWarRoomViewMode('mitigated')}
                style={{ color: warRoomViewMode === 'mitigated' ? '#10b981' : undefined }}
              >
                Mitigated with Playbook ({warRoomMitigation?.casualties || 8} Casualties · {warRoomMitigation?.netRoiRatio}x ROI)
              </button>
            </div>
          </div>
          <div className="banner-actions">
            <button className="btn btn-secondary" onClick={onOpenWarRoom}>
              Playbook Config
            </button>
            <button className="btn btn-secondary" onClick={onExitWarRoom} style={{ color: 'var(--red-lt)' }}>
              Exit War Room
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={12}
        minZoom={10}
        maxZoom={17}
        className="leaflet-map"
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController flyToCoords={flyToCoords} />

        <TileLayer
          url={tileUrls[basemap] || tileUrls.dark}
          attribution="&copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        />

        <MapClickHandler 
          isPlacing={isPlacingIntervention} 
          onMapClick={onInterventionPlaced} 
        />

        {/* Tracts Choropleth Layer */}
        {tractsGeoJSON && (
          <GeoJSON
            key={`${activeMetric}-${showDeadZones}-${selectedTract?.geoid || ''}-${dimChoropleth}-${isHistoricalReplayActive ? historicalStep?.stepIndex : 'live'}-${isWarRoomActive ? warRoomViewMode : 'normal'}`}
            data={tractsGeoJSON}
            style={tractStyle}
            onEachFeature={onEachTract}
          />
        )}

        {/* Live / Historical / War Room Thermal Heatmap Layer */}
        {showHeatmap && (
          <HeatmapLayer 
            points={heatmapPoints} 
            options={{
              radius: heatmapRadius,
              blur: heatmapBlur,
              minOpacity: dimChoropleth ? 0.5 : 0.32
            }} 
          />
        )}

        {/* War Room Mobile Misting Stations (when active) */}
        {isWarRoomActive && activeActionIds.includes('mobile_misting_fleet') && (
          <>
            {[
              { name: 'Chavis Way & Martin Luther King Jr Blvd', lat: 35.7712, lon: -78.6271 },
              { name: 'Rock Quarry Rd & Bragg St', lat: 35.7580, lon: -78.6180 },
              { name: 'Moore Square Transit Station', lat: 35.7785, lon: -78.6360 },
              { name: 'New Bern Ave & Poole Rd', lat: 35.7830, lon: -78.5990 },
              { name: 'Garner Rd & Peterson St', lat: 35.7480, lon: -78.6340 }
            ].map((m, idx) => (
              <React.Fragment key={`mister-${idx}`}>
                <Circle
                  center={[m.lat, m.lon]}
                  radius={450}
                  pathOptions={{
                    color: '#315F7D',
                    weight: 2,
                    fillColor: '#315F7D',
                    fillOpacity: 0.16,
                    dashArray: '3, 5'
                  }}
                />
                <CircleMarker
                  center={[m.lat, m.lon]}
                  radius={7.5}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: '#0891b2',
                    fillOpacity: 1
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
                      <b style={{ color: '#0891b2', fontSize: '13px' }}>💧 Emergency Mobile Misting Station</b>
                      <div style={{ color: '#0f172a', fontWeight: 'bold', marginTop: '2px' }}>{m.name}</div>
                      <div style={{ color: '#16a34a', marginTop: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                        🛡️ -4.5°F Local Microclimate Shield Active
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}
          </>
        )}

        {/* War Room GoRaleigh Free Express Shuttle Loops */}
        {isWarRoomActive && activeActionIds.includes('free_transit_cooling_shuttles') && (
          <>
            <Polyline
              positions={[[35.7712, -78.6271], [35.7650, -78.6150], [35.7790, -78.6120]]}
              pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85, dashArray: '6, 6' }}
            >
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#d97706' }}>🚌 Free GoRaleigh Cooling Shuttle Loop 1</b>
                  <div>Connecting Chavis & Southeast Raleigh Dead Zones to Tarboro Community Center</div>
                </div>
              </Popup>
            </Polyline>
            <Polyline
              positions={[[35.7580, -78.6180], [35.7500, -78.6050], [35.7420, -78.5950]]}
              pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85, dashArray: '6, 6' }}
            >
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#d97706' }}>🚌 Free GoRaleigh Cooling Shuttle Loop 2</b>
                  <div>Connecting Rock Quarry Road Corridor to Worthdale Community Center</div>
                </div>
              </Popup>
            </Polyline>
          </>
        )}

        {/* Pedestrian Catchments (10-minute walk = 800m) */}
        {showBuffers && filteredResources.map((res, i) => {
          const lat = res.properties.latitude;
          const lon = res.properties.longitude;
          if (!lat || !lon) return null;

          return (
            <Circle
              key={`buffer-${i}`}
              center={[lat, lon]}
              radius={800}
              pathOptions={{
                color: assetColors[res.properties.type] || '#315F7D',
                weight: 1,
                fillColor: assetColors[res.properties.type] || '#315F7D',
                fillOpacity: 0.08,
                dashArray: '3, 6'
              }}
            />
          );
        })}

        {/* Cooling Assets Markers */}
        {showResources && filteredResources.map((res, i) => {
          const lat = res.properties.latitude;
          const lon = res.properties.longitude;
          const type = res.properties.type;
          const color = assetColors[type] || '#315F7D';
          if (!lat || !lon) return null;

          return (
            <CircleMarker
              key={`asset-${i}`}
              center={[lat, lon]}
              radius={4.5}
              pathOptions={{
                color: '#ffffff',
                weight: 1.5,
                fillColor: color,
                fillOpacity: 0.95
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px', minWidth: '180px' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{res.properties.name}</b>
                  <div style={{ color: color, fontWeight: 'bold', margin: '2px 0' }}>{type}</div>
                  <div style={{ color: '#64748b' }}>Capacity: {res.properties.cooling_capacity || 'Standard'}</div>
                  <div style={{ color: '#10b981', marginTop: '4px', fontSize: '11px' }}>🛡️ 10-Min Pedestrian Catchment</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={800}
              pathOptions={{
                color: '#168BFF',
                weight: 2,
                fillColor: '#168BFF',
                fillOpacity: 0.08,
                dashArray: '4, 4'
              }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lon]}
              radius={17}
              pathOptions={{
                className: 'user-location-halo',
                color: '#168BFF',
                weight: 2,
                fillColor: '#168BFF',
                fillOpacity: 0.12
              }}
              interactive={false}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lon]}
              radius={8}
              pathOptions={{
                className: 'user-location-core',
                color: '#FFFFFF',
                weight: 2.5,
                fillColor: '#168BFF',
                fillOpacity: 1
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
                  <b style={{ color: '#0873D1', fontSize: '13px' }}>Your Location / Address</b>
                  <p style={{ margin: '3px 0 0', color: '#475569' }}>
                    {userAddress || `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`}
                  </p>
                  <div style={{ color: '#0873D1', fontWeight: 'bold', marginTop: '4px', fontSize: '11px' }}>
                    Walking Reach (800m Buffer Highlighted)
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* Emergency Distress Alert Markers */}
        {alerts?.alerts?.map((alert) => {
          if (!alert.lat || !alert.lon) return null;
          const isResolved = alert.status === 'RESOLVED';
          const isCritical = alert.urgency === 'CRITICAL';
          const pinColor = isResolved ? '#77848D' : (isCritical ? '#B4473D' : '#D58A3C');

          return (
            <CircleMarker
              key={alert.id}
              center={[alert.lat, alert.lon]}
              radius={isResolved ? 6 : 9}
              pathOptions={{
                color: '#ffffff',
                weight: 2.5,
                fillColor: pinColor,
                fillOpacity: 1
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      backgroundColor: pinColor,
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}>
                      {alert.urgency}
                    </span>
                    <b style={{ color: '#0f172a' }}>{alert.category}</b>
                  </div>
                  <div style={{ color: '#0284c7', fontWeight: '600', marginTop: '4px' }}>
                    📍 {alert.address}
                  </div>
                  <p style={{ margin: '4px 0', color: '#475569', fontSize: '11px' }}>
                    {alert.description}
                  </p>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>
                    Reported by: <strong>{alert.reporterName}</strong> · Status: <strong>{alert.status}</strong>
                  </div>
                  {alert.assignedUnit && (
                    <div style={{ color: '#d97706', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                      🚑 {alert.assignedUnit}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Active Dropped Hypothetical Intervention Marker & Catchment */}
        {activeIntervention && (activeIntervention.lat != null) && (
          <>
            <Circle 
              center={[activeIntervention.lat, activeIntervention.lon ?? activeIntervention.lng]}
              radius={activeIntervention.config?.radius_m || 800}
              pathOptions={{
                color: activeIntervention.config?.color || '#3b82f6',
                weight: 2.5,
                fillColor: activeIntervention.config?.color || '#3b82f6',
                fillOpacity: 0.28,
                dashArray: '5, 5'
              }}
            />
            <CircleMarker
              center={[activeIntervention.lat, activeIntervention.lon ?? activeIntervention.lng]}
              radius={10}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: activeIntervention.config?.color || '#ef4444',
                fillOpacity: 1
              }}
            >
              <Popup autoPan={false}>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
                  <b style={{ color: '#dc2626', fontSize: '13px' }}>⭐ {activeIntervention.interventionType || 'Proposed Intervention Site'}</b>
                  <p style={{ margin: '4px 0', color: '#475569' }}>
                    {activeIntervention.config?.description || `Coordinates: [${Number(activeIntervention.lat).toFixed(4)}, ${Number(activeIntervention.lon ?? activeIntervention.lng).toFixed(4)}]`}
                  </p>
                  {activeIntervention.newly_served_vuln != null ? (
                    <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      +{(activeIntervention.newly_served_vuln ?? 0).toLocaleString()} Residents Protected
                    </div>
                  ) : (
                    <div style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '11px' }}>
                      Target site selected. Click "Simulate Intervention Impact" to evaluate.
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* Floating Recenter Location Quick-Action */}
      {userLocation?.lat && userLocation?.lon && (
        <button
          className="map-recenter-btn"
          onClick={() => {
            if (onRecenterUser) {
              onRecenterUser();
            }
          }}
          title="Recenter view on my current location"
        >
          <Navigation size={13} />
          <span>My Location</span>
        </button>
      )}

      {/* Floating Map Legend */}
      <div className="map-legend">
        <div className="legend-title">
          {isWarRoomActive ? (
            <span style={{ color: warRoomViewMode === 'mitigated' ? '#10b981' : '#ef4444' }}>
              WAR ROOM: {warRoomViewMode === 'mitigated' ? 'MITIGATED (PLAYBOOK ACTIVE)' : 'UNMITIGATED THREAT'}
            </span>
          ) : isHistoricalReplayActive && historicalStep ? (
            <span style={{ color: '#D1A33A' }}>
              REPLAY: {historicalStep.label}
            </span>
          ) : showHeatmap ? (
            <span style={{ color: '#ef4444' }}>
              THERMAL HEATMAP ({heatmapMode === 'hvi' ? 'HVI RISK' : 'SURFACE TEMP'})
            </span>
          ) : (
            activeMetric
          )}
        </div>
        <div 
          className="legend-gradient-bar"
          style={{
            background: activeMetric === 'Tree Canopy Cover (%)'
              ? 'linear-gradient(90deg, #B4473D, #CC653E, #D58A3C, #D1A33A, #4E8064)'
              : 'linear-gradient(90deg, #4E8064, #D1A33A, #D58A3C, #CC653E, #B4473D)'
          }}
        />
        <div className="legend-labels">
          <span>{isWarRoomActive || isHistoricalReplayActive ? '88°F' : 'Low'}</span>
          <span>{isWarRoomActive || isHistoricalReplayActive ? '98°F' : 'Moderate'}</span>
          <span>{isWarRoomActive || isHistoricalReplayActive ? '108°F+' : 'Extreme'}</span>
        </div>
      </div>
    </div>
  );
}
