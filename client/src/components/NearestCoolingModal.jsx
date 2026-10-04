import React from 'react';
import { X, Navigation, Thermometer, ShieldCheck, MapPin, Building2, ExternalLink } from 'lucide-react';

export default function NearestCoolingModal({
  isOpen,
  onClose,
  nearestData,
  liveWeather,
  onHighlightAsset
}) {
  if (!isOpen || !nearestData) return null;

  const nearest = nearestData.nearest_asset;
  const userLoc = nearestData.user_location;

  const googleMapsUrl = nearest ? 
    `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${nearest.latitude},${nearest.longitude}&travelmode=walking`
    : '#';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(9, 13, 22, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Navigation size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Nearest Cooling Refuge Guide
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Based on your live GPS location & microclimate telemetry
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live Heat Index Ribbon */}
          {liveWeather && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Thermometer size={16} style={{ color: liveWeather.risk_color || '#eab308' }} />
                <span>Current Ambient: <b>{liveWeather.temperature_f}°F</b></span>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span>Heat Index: <b style={{ color: liveWeather.risk_color }}>{liveWeather.apparent_temperature_f}°F</b></span>
              </div>
              <span style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: `${liveWeather.risk_color}22`,
                color: liveWeather.risk_color,
                border: `1px solid ${liveWeather.risk_color}55`
              }}>
                {liveWeather.risk_level}
              </span>
            </div>
          )}

          {/* Primary Nearest Asset Card */}
          {nearest && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#60a5fa',
                    letterSpacing: '0.04em'
                  }}>
                    Closest Available Refuge
                  </span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 2px 0' }}>
                    {nearest.name}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {nearest.type} • {nearest.category}
                  </div>
                </div>

                <div style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                    {nearest.walk_minutes}m
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {nearest.distance_meters}m ({nearest.distance_miles} mi)
                  </div>
                </div>
              </div>

              {/* Walking Safety Threshold */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: nearest.within_10min ? '#34d399' : '#fb923c'
              }}>
                <ShieldCheck size={16} />
                <span>
                  {nearest.within_10min ? 
                    'Safe walking distance (< 10 min walk). Stay in the shade where possible.' :
                    'Exceeds 10-minute walk. Consider transit or requesting mobile hydration.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary-action"
                  style={{ flex: 1, textDecoration: 'none', padding: '10px 14px' }}
                >
                  <Navigation size={15} />
                  <span>Start Walking Directions</span>
                  <ExternalLink size={13} />
                </a>

                <button 
                  className="btn-secondary-action"
                  style={{ padding: '10px 14px' }}
                  onClick={() => {
                    onHighlightAsset(nearest);
                    onClose();
                  }}
                >
                  <MapPin size={15} />
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          )}

          {/* Alternative Nearby Assets List */}
          {nearestData.top_options?.length > 1 && (
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Other Nearby Cooling Assets
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nearestData.top_options.slice(1, 4).map((asset, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.45)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      onHighlightAsset(asset);
                      onClose();
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {asset.type} • {asset.category}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                        {asset.walk_minutes} min
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {asset.distance_meters}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
