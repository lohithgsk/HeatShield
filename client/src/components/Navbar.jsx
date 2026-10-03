import React from 'react';
import Logo from './Logo';
import {
  Building2, Sparkles, Radio, Crosshair, BarChart3,
  Navigation, Wifi, WifiOff
} from 'lucide-react';

export default function Navbar({
  kpis,
  persona,
  setPersona,
  activeDrawer,
  setActiveDrawer,
  isPlacingIntervention,
  setIsPlacingIntervention,
  isRealtime,
  setIsRealtime,
  userLocation,
  liveWeather,
  onFindNearest
}) {
  return (
    <header className="top-navbar">

      {/* ── Brand ── */}
      <div className="brand-section">
        <Logo size={40} />
        <div className="brand-text">
          <h1>Raleigh Climate Resilience Hub</h1>
          <p>City of Raleigh · Urban Heat &amp; Climate Equity</p>
        </div>

        <div className="persona-selector-box">
          <label>View:</label>
          <select
            className="persona-select"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            <option value="City Planners &amp; Urban Designers">🏗️ City Planners</option>
            <option value="Emergency Management &amp; Public Health">🚑 Emergency Health</option>
            <option value="Community Advocates &amp; Citizens">📢 Community</option>
          </select>
        </div>
      </div>

      {/* ── KPI Ribbon ── */}
      <div className="hud-ribbon">
        <div className="hud-item" title="High-heat tracts with no walking-distance cooling access">
          <span className="hud-item-icon" style={{ color: '#ef4444' }}>🚨</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Dead Zones</span>
            <span className="hud-item-value" style={{ color: '#ef4444' }}>
              {kpis?.dead_zones_count ?? 22}
            </span>
          </div>
        </div>

        <div className="hud-item" title="Peak satellite surface temperature in Raleigh">
          <span className="hud-item-icon" style={{ color: '#eab308' }}>🌡️</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Peak Temp</span>
            <span className="hud-item-value" style={{ color: '#eab308' }}>
              {kpis?.max_surface_temp ?? 105.5}°F
            </span>
          </div>
        </div>

        <div className="hud-item" title="Average tree canopy cover across Raleigh">
          <span className="hud-item-icon" style={{ color: '#10b981' }}>🌳</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Canopy</span>
            <span className="hud-item-value" style={{ color: '#10b981' }}>
              {kpis?.avg_canopy_pct ?? 39.2}%
            </span>
          </div>
        </div>

        <div className="hud-item" title="Verified public cooling facilities in Raleigh">
          <span className="hud-item-icon" style={{ color: '#3b82f6' }}>🏛️</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Assets</span>
            <span className="hud-item-value" style={{ color: '#3b82f6' }}>
              {kpis?.total_cooling_assets ?? 746}
            </span>
          </div>
        </div>

        {isRealtime && liveWeather && (
          <div
            className="hud-item"
            style={{
              borderColor: liveWeather.risk_color + '66',
              background: liveWeather.risk_color + '18'
            }}
            title={liveWeather.advisory}
          >
            <span className="hud-item-icon" style={{ color: liveWeather.risk_color }}>⚡</span>
            <div className="hud-item-content">
              <span className="hud-item-label">Live Heat</span>
              <span className="hud-item-value" style={{ color: liveWeather.risk_color }}>
                {liveWeather.apparent_temperature_f}°F
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Nav Actions ── */}
      <div className="nav-actions">

        {/* Real-Time toggle */}
        <button
          id="btn-realtime-toggle"
          className={`btn-nav-action${isRealtime ? ' active' : ''}`}
          onClick={() => setIsRealtime(!isRealtime)}
          title={isRealtime ? 'Real-Time ON — live GPS & weather' : 'Enable Real-Time Mode'}
          style={isRealtime ? { borderColor: 'rgba(52,211,153,0.5)', color: '#34d399' } : {}}
        >
          {isRealtime
            ? <Wifi size={14} style={{ color: '#34d399' }} />
            : <WifiOff size={14} />
          }
          <span>{isRealtime ? 'Live' : 'Live Mode'}</span>
          {isRealtime && <span className="live-dot" />}
        </button>

        {/* Find Nearest — only in real-time mode */}
        {isRealtime && (
          <button
            id="btn-find-nearest"
            className="btn-nav-action"
            onClick={onFindNearest}
            disabled={!userLocation}
            style={{ opacity: userLocation ? 1 : 0.55 }}
            title={userLocation ? 'Find nearest cooling center' : 'Waiting for GPS…'}
          >
            <Navigation size={14} style={{ color: '#38bdf8' }} />
            <span>Find Nearest</span>
          </button>
        )}

        <button
          id="btn-place-intervention"
          className={`btn-nav-action${isPlacingIntervention ? ' active' : ''}`}
          onClick={() => setIsPlacingIntervention(!isPlacingIntervention)}
          title="Drop a hypothetical cooling facility on the map"
        >
          <Crosshair size={14} />
          <span>{isPlacingIntervention ? 'Click Map…' : 'Drop Asset'}</span>
        </button>

        <button
          id="btn-scenario-drawer"
          className={`btn-nav-action${activeDrawer === 'scenario' ? ' active' : ''}`}
          onClick={() => setActiveDrawer(activeDrawer === 'scenario' ? null : 'scenario')}
        >
          <Building2 size={14} />
          <span>Scenarios</span>
        </button>

        <button
          id="btn-copilot-drawer"
          className={`btn-nav-action${activeDrawer === 'copilot' ? ' active' : ''}`}
          onClick={() => setActiveDrawer(activeDrawer === 'copilot' ? null : 'copilot')}
        >
          <Sparkles size={14} style={{ color: '#60a5fa' }} />
          <span>AI Copilot</span>
        </button>

        <button
          id="btn-audio-drawer"
          className={`btn-nav-action${activeDrawer === 'audio' ? ' active' : ''}`}
          onClick={() => setActiveDrawer(activeDrawer === 'audio' ? null : 'audio')}
        >
          <Radio size={14} style={{ color: '#c084fc' }} />
          <span>Voice</span>
        </button>

        <button
          id="btn-analytics-drawer"
          className={`btn-nav-action${activeDrawer === 'analytics' ? ' active' : ''}`}
          onClick={() => setActiveDrawer(activeDrawer === 'analytics' ? null : 'analytics')}
        >
          <BarChart3 size={14} />
          <span>Analytics</span>
        </button>
      </div>
    </header>
  );
}
