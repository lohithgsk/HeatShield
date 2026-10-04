import React, { useState } from 'react';
import { MapPin, Navigation, Home, AlertTriangle, Compass, Bookmark } from 'lucide-react';

const PRESET_ADDRESSES = [
  { name: '505 MLK Jr Blvd (Chavis Park)', lat: 35.7712, lon: -78.6271 },
  { name: '214 S Blount St (Moore Square)', lat: 35.7779, lon: -78.6367 },
  { name: '1250 S State St (Walnut Terrace)', lat: 35.7665, lon: -78.6335 },
  { name: '1600 New Bern Ave (Transit Corridor)', lat: 35.7810, lon: -78.6180 },
  { name: '4200 Six Forks Rd (North Hills)', lat: 35.8364, lon: -78.6433 },
  { name: '2401 Wade Ave (Pullen / University)', lat: 35.7890, lon: -78.6810 },
  { name: '3100 Poole Rd (Southeast Raleigh)', lat: 35.7690, lon: -78.5850 }
];

export default function CommunityCitizenPanel({
  userLocation,
  userAddress,
  onAddressSelect,
  isRealtime,
  onToggleRealtime,
  onFindNearest,
  nearestData,
  liveWeather,
  onOpenReportModal,
  selectedTract,
  onConsultCopilot,
  trackedAddresses = [],
  subscriberEmail = null
}) {
  const [mode, setMode] = useState('address');
  const [addressInput, setAddressInput] = useState(userAddress || '');
  const [geocoding, setGeocoding] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleSelectPreset = (preset) => {
    setAddressInput(preset.name);
    setShowPresets(false);
    if (onAddressSelect) onAddressSelect(preset);
  };

  const handleSearchAddress = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!addressInput.trim()) return;
    setGeocoding(true);
    try {
      const q = encodeURIComponent(`${addressInput.trim()}, Raleigh, NC`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const result = {
          name: data[0].display_name.split(',')[0],
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
        if (onAddressSelect) onAddressSelect(result);
      } else {
        const fallback = { name: addressInput, lat: 35.7796, lon: -78.6382 };
        if (onAddressSelect) onAddressSelect(fallback);
      }
    } catch (err) {
      console.warn('Geocoding error, using fallback:', err);
    } finally {
      setGeocoding(false);
      setShowPresets(false);
    }
  };

  const handleSelectTrackedAddress = (item) => {
    setAddressInput(item.address);
    if (item.lat && item.lon) {
      if (onAddressSelect) onAddressSelect({ name: item.address, lat: item.lat, lon: item.lon });
    } else {
      handleSearchAddress({ preventDefault: () => {} });
    }
  };

  const nearestAsset = nearestData?.nearest_asset;
  const walkMinutes = nearestData?.walk_minutes ?? 9;
  const walkMeters = nearestData?.distance_meters ?? 720;

  const tempF = liveWeather?.temp_f ?? 78;
  const feelsF = liveWeather?.feels_like_f ?? 81;
  const riskLevel = tempF >= 95 ? 'high' : tempF >= 85 ? 'moderate' : 'low';
  const riskLabel = tempF >= 95 ? 'High Risk' : tempF >= 85 ? 'Moderate' : 'Normal';

  return (
    <div className="floating-control-panel community-citizen-panel">

      {/* Head */}
      <div className="panel-head">
        <div className="panel-identity">
          <div className="panel-icon green">
            <Compass size={14} />
          </div>
          <div>
            <div className="panel-title">Resident Heat Relief</div>
            <div className="panel-subtitle green">Hyperlocal Conditions & Shelter Access</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="panel-body">

        {/* 1. Location Selector (Address or GPS) */}
        <div>
          <div className="seg-control" style={{ marginBottom: 6 }}>
            <button
              className={`seg-btn${mode === 'address' ? ' active' : ''}`}
              onClick={() => setMode('address')}
            >
              <Home size={11} style={{ marginRight: 4, display: 'inline' }} />
              Search Address
            </button>
            <button
              className={`seg-btn${mode === 'gps' ? ' active' : ''}`}
              onClick={() => {
                setMode('gps');
                if (!isRealtime && onToggleRealtime) onToggleRealtime();
              }}
            >
              <Navigation size={11} style={{ marginRight: 4, display: 'inline' }} />
              Live Device GPS
            </button>
          </div>

          {mode === 'address' ? (
            <div style={{ position: 'relative' }}>
              <form onSubmit={handleSearchAddress} style={{ display: 'flex', gap: 4 }}>
                <input
                  type="text"
                  className="field-input"
                  value={addressInput}
                  onChange={(e) => { setAddressInput(e.target.value); setShowPresets(true); }}
                  onFocus={() => setShowPresets(true)}
                  placeholder="Enter street, neighborhood, or landmark..."
                  style={{ fontSize: '11.5px' }}
                />
                <button type="submit" className="btn btn-secondary" disabled={geocoding}>
                  {geocoding ? '...' : 'Locate'}
                </button>
              </form>

              {showPresets && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 200,
                  marginTop: 4,
                  maxHeight: 180,
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '6px 8px', fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    Popular Raleigh Locations
                  </div>
                  {PRESET_ADDRESSES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-card)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {preset.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '6px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="live-dot" />
              <span>{userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}` : 'Acquiring GPS fix...'}</span>
            </div>
          )}
        </div>

        {/* Monitored Locations Tray (if resident registered on landing page) */}
        {trackedAddresses && trackedAddresses.length > 0 && (
          <div className="tracked-locations-panel-box">
            <div className="tracked-locations-title">
              <Bookmark size={11} style={{ color: 'var(--semantic-green-lt)' }} />
              <span>Monitored Locations ({trackedAddresses.length})</span>
            </div>
            <div className="tracked-locations-list">
              {trackedAddresses.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="tracked-loc-chip"
                  onClick={() => handleSelectTrackedAddress(item)}
                  title={`Center on ${item.label}: ${item.address}`}
                >
                  <span className="loc-label">{item.label}</span>
                  <span className="loc-addr">{item.address}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divider" />

        {/* 2. Primary Focal Point: Current Environmental Exposure */}
        <div>
          <div className="section-label">Current Exposure</div>
          <div className="weather-card">
            <div>
              <div className="weather-temp">{tempF}°F</div>
              <div className="weather-feels">Feels like {feelsF}°F · {liveWeather?.humidity_pct ?? 65}% humidity</div>
            </div>
            <span className={`risk-badge ${riskLevel}`}>{riskLabel}</span>
          </div>
        </div>

        {/* 3. Primary Action: Closest Cooling Shelter */}
        <div>
          <div className="section-label">Nearest Cooling Shelter</div>
          <div className="shelter-card">
            <div className="shelter-card-header">
              <div>
                <div className="shelter-name">
                  {nearestAsset?.name || 'John Chavis Community Center'}
                </div>
                <div className="shelter-type">
                  {nearestAsset?.category || 'Indoor Air-Conditioned Refuge'} · {nearestAsset?.address || '505 MLK Jr Blvd'}
                </div>
              </div>
              <span className="shelter-open-badge">Open Now</span>
            </div>

            <div className="shelter-distance">
              <span style={{ color: 'var(--text-tertiary)' }}>Walking distance</span>
              <span className="shelter-distance-val">{walkMinutes} min · {walkMeters} m</span>
            </div>

            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 6 }}
              onClick={onFindNearest}
            >
              <Compass size={13} />
              <span>View Route & Site Details</span>
            </button>
          </div>
        </div>

        <div className="divider" />

        {/* 4. Critical Action: Report Hazard */}
        <div>
          <button
            className="btn btn-danger-solid btn-full"
            onClick={onOpenReportModal}
            style={{ padding: '8px 12px' }}
          >
            <AlertTriangle size={14} />
            <span>Report Heat Hazard / Request Help</span>
          </button>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 4 }}>
            Directly alerts Wake County Emergency Management
          </div>
        </div>

      </div>
    </div>
  );
}
