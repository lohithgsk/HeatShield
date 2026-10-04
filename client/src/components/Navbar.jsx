import React from 'react';
import Logo from './Logo';
import {
  Building2, Sparkles, Radio, Crosshair, BarChart3, BrainCircuit,
  Navigation, Wifi, WifiOff, Database
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
  onFindNearest,
  onOpenTigerData,
  onOpenForecast
}) {
  return (
    <header className="top-navbar">

      {/* ── Brand ── */}
      <div className="brand-section">
        <Logo size={40} />
        <div className="brand-text">
          <h1>HeatShield</h1>
          <p>Raleigh · Urban Heat</p>
        </div>

        <div className="persona-selector-box">
          <label> </label>
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
            <span className="hud-item-label">Peak Surface</span>
            <span className="hud-item-value" style={{ color: '#eab308' }}>
              {kpis?.max_surface_temp ?? 102.4}°F
            </span>
          </div>
        </div>

        <div className="hud-item" title="Citywide average urban tree canopy cover">
          <span className="hud-item-icon" style={{ color: '#22c55e' }}>🌳</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Tree Canopy</span>
            <span className="hud-item-value" style={{ color: '#22c55e' }}>
              {kpis?.avg_canopy_pct ?? 31.8}%
            </span>
          </div>
        </div>

        <div className="hud-item" title="Vulnerable residents with no cooling refuge within a 15-minute walk">
          <span className="hud-item-icon" style={{ color: '#a855f7' }}>👥</span>
          <div className="hud-item-content">
            <span className="hud-item-label">Unserved Vuln</span>
            <span className="hud-item-value" style={{ color: '#a855f7' }}>
              {(kpis?.unserved_vulnerable_pop ?? 18450).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Live Weather pill when real-time mode is on */}
        {isRealtime && liveWeather && (
          <div className="hud-item live-weather-pill" title="Live meteorological reading from Open-Meteo">
            <span className="hud-item-icon">🌤️</span>
            <div className="hud-item-content">
              <span className="hud-item-label">Live Raleigh</span>
              <span className="hud-item-value" style={{ color: '#38bdf8' }}>
                {liveWeather.temp_f}°F · {liveWeather.humidity_pct}% RH
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="nav-actions">

        {/* Tiger Data Hypertable Live Telemetry Button */}
        <button
          id="btn-tiger-data"
          className="btn-nav-action"
          onClick={onOpenTigerData}
          title="Open Tiger Data / Timescale Real-Time Telemetry & Continuous Aggregates"
          style={{
            borderColor: 'rgba(249, 115, 22, 0.55)',
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.22) 0%, rgba(15, 23, 42, 0.7) 100%)'
          }}
        >
          <span style={{ fontSize: '13px' }}>🐅</span>
          <span style={{ color: '#fb923c', fontWeight: 600 }}>Tiger Data</span>
          <span className="live-dot" style={{ backgroundColor: '#f97316' }} />
        </button>

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

        <button
          id="btn-forecast-drawer"
          className={`btn-nav-action${activeDrawer === 'forecast' ? ' active' : ''}`}
          onClick={onOpenForecast}
          title="Open machine-learning heat index forecasts"
        >
          <BrainCircuit size={14} style={{ color: '#a78bfa' }} />
          <span>Forecast</span>
        </button>
      </div>
    </header>
  );
}
