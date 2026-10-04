import React, { useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  CircleMarker, 
  Circle, 
  Popup, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';

// Color interpolators
function getHviColor(val) {
  if (val >= 75) return '#ef4444'; // Extreme
  if (val >= 55) return '#f97316'; // High
  if (val >= 35) return '#eab308'; // Moderate
  return '#10b981'; // Low
}

function getTempColor(val) {
  if (val >= 102) return '#dc2626';
  if (val >= 98) return '#f97316';
  if (val >= 94) return '#eab308';
  if (val >= 90) return '#10b981';
  return '#3b82f6';
}

function getCanopyColor(val) {
  if (val >= 48) return '#047857';
  if (val >= 35) return '#10b981';
  if (val >= 25) return '#84cc16';
  if (val >= 18) return '#f59e0b';
  return '#ef4444';
}

function getMetricColor(metric, p) {
  switch (metric) {
    case 'Surface Temperature (°F)':
      return getTempColor(Number(p.surface_temp_f) || 94);
    case 'Tree Canopy Cover (%)':
      return getCanopyColor(Number(p.canopy_cover_pct) || 30);
    case 'Impervious Surface (%)':
      return Number(p.impervious_pct) >= 65 ? '#ef4444' : (Number(p.impervious_pct) >= 45 ? '#f59e0b' : '#10b981');
    case 'Poverty Rate (%)':
      return Number(p.poverty_rate) >= 25 ? '#b91c1c' : (Number(p.poverty_rate) >= 15 ? '#f97316' : '#10b981');
    case 'Senior Population 65+ (%)':
      return Number(p.pct_elderly) >= 20 ? '#e11d48' : (Number(p.pct_elderly) >= 14 ? '#8b5cf6' : '#38bdf8');
    case 'Heat Vulnerability Index (HVI)':
    default:
      return getHviColor(Number(p.heat_vulnerability_index) || 50);
  }
}

// Click handler component for placing interventions and selecting tracts
function MapClickHandler({ isPlacing, onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
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
  basemap = 'dark'
}) {
  const center = [35.7796, -78.6382];

  const tileUrls = {
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    darkRef: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    lightRef: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const attributions = {
    esri: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  const styleFeature = (feature) => {
    const p = feature.properties;
    const isSelected = selectedTract && selectedTract.GEOID === p.GEOID;
    const isDead = Boolean(p.is_dead_zone);

    const fillColor = getMetricColor(activeMetric, p);

    if (isSelected) {
      return {
        fillColor: fillColor,
        fillOpacity: 0.85,
        color: '#38bdf8',
        weight: 3.5,
        dashArray: null
      };
    }

    if (isDead && showDeadZones) {
      return {
        fillColor: fillColor,
        fillOpacity: 0.70,
        color: '#ef4444',
        weight: 2.5,
        dashArray: '5, 5'
      };
    }

    return {
      fillColor: fillColor,
      fillOpacity: 0.55,
      color: '#334155',
      weight: 1.0,
      dashArray: null
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        if (!isPlacingIntervention && onSelectTract) {
          onSelectTract(feature.properties);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        if (!selectedTract || selectedTract.GEOID !== feature.properties.GEOID) {
          l.setStyle({ fillOpacity: 0.85, weight: 2.5, color: '#60a5fa' });
        }
      },
      mouseout: (e) => {
        const l = e.target;
        if (!selectedTract || selectedTract.GEOID !== feature.properties.GEOID) {
          l.setStyle(styleFeature(feature));
        }
      }
    });

    const p = feature.properties;
    const tooltipContent = `
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <b>${p.neighborhood || 'Raleigh Tract'}</b><br/>
        HVI Score: <b style="color: ${getHviColor(p.heat_vulnerability_index)}">${p.heat_vulnerability_index}/100</b> (${p.hvi_category})<br/>
        Surface Temp: <b>${p.surface_temp_f}°F</b> | Canopy: <b>${p.canopy_cover_pct}%</b><br/>
        ${p.is_dead_zone ? '<span style="color: #ef4444; font-weight: bold;">🚨 CRITICAL DEAD ZONE</span>' : '✅ 10-Min Walk Accessible'}
      </div>
    `;
    layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 });
  };

  // Filter cooling resources by type
  const filteredResources = useMemo(() => {
    if (!coolingResources || !coolingResources.features) return [];
    return coolingResources.features.filter(f => {
      const type = f.properties.type;
      return selectedResourceTypes.includes(type);
    }).slice(0, 300); // Keep rendering fluid
  }, [coolingResources, selectedResourceTypes]);

  const assetColors = {
    'Public Library': '#3b82f6',
    'Community Center': '#8b5cf6',
    'Public Pool / Aquatic': '#06b6d4',
    'Park / Tree Shade': '#10b981'
  };

  return (
    <div className="map-viewport">
      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* Base Map Tile Layer (100% Free, No API Key Required) */}
        <TileLayer
          key={basemap}
          attribution={basemap === 'osm' ? attributions.osm : attributions.esri}
          url={tileUrls[basemap] || tileUrls.dark}
        />

        {/* Optional Reference Labels Layer for Esri Dark/Light */}
        {basemap === 'dark' && (
          <TileLayer
            key="dark-ref"
            url={tileUrls.darkRef}
            opacity={0.75}
          />
        )}
        {basemap === 'light' && (
          <TileLayer
            key="light-ref"
            url={tileUrls.lightRef}
            opacity={0.75}
          />
        )}

        <MapClickHandler 
          isPlacing={isPlacingIntervention}
          onMapClick={(latlng) => {
            if (isPlacingIntervention && onInterventionPlaced) {
              onInterventionPlaced(latlng);
            }
          }}
        />

        {/* Census Tracts GeoJSON Layer */}
        {tractsGeoJSON && (
          <GeoJSON 
            key={`${activeMetric}-${showDeadZones}-${selectedTract?.GEOID}`}
            data={tractsGeoJSON} 
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* 10-Minute Walk Buffers (800m) around cooling assets */}
        {showResources && showBuffers && filteredResources.map((res, i) => {
          const lat = res.properties.latitude;
          const lon = res.properties.longitude;
          const color = assetColors[res.properties.type] || '#3b82f6';
          if (!lat || !lon) return null;
          return (
            <Circle 
              key={`buf-${i}`}
              center={[lat, lon]}
              radius={800}
              pathOptions={{
                color: color,
                weight: 0.7,
                fillColor: color,
                fillOpacity: 0.06,
                dashArray: '4, 6'
              }}
            />
          );
        })}

        {/* Cooling Assets Markers */}
        {showResources && filteredResources.map((res, i) => {
          const lat = res.properties.latitude;
          const lon = res.properties.longitude;
          const type = res.properties.type;
          const color = assetColors[type] || '#3b82f6';
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

        {/* Active Dropped Hypothetical Intervention Marker & Catchment */}
        {activeIntervention?.config?.radius_m != null && (
          <>
            <Circle 
              center={[activeIntervention.lat, activeIntervention.lon]}
              radius={activeIntervention.config.radius_m}
              pathOptions={{
                color: activeIntervention.config.color,
                weight: 2.5,
                fillColor: activeIntervention.config.color,
                fillOpacity: 0.28,
                dashArray: '5, 5'
              }}
            />
            <CircleMarker
              center={[activeIntervention.lat, activeIntervention.lon]}
              radius={10}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: '#ef4444',
                fillOpacity: 1
              }}
            >
              <Popup autoPan={false}>
                <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
                  <b style={{ color: '#dc2626', fontSize: '13px' }}>⭐ {activeIntervention.interventionType}</b>
                  <p style={{ margin: '4px 0', color: '#475569' }}>{activeIntervention.config.description}</p>
                  <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
                    +{activeIntervention.newly_served_vuln.toLocaleString()} Residents Protected
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="map-legend">
        <div className="legend-title">{activeMetric}</div>
        <div 
          className="legend-gradient-bar"
          style={{
            background: activeMetric === 'Tree Canopy Cover (%)'
              ? 'linear-gradient(90deg, #ef4444, #f59e0b, #84cc16, #10b981, #047857)'
              : 'linear-gradient(90deg, #10b981, #eab308, #f97316, #ef4444)'
          }}
        />
        <div className="legend-labels">
          <span>Low Risk</span>
          <span>Moderate</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}
