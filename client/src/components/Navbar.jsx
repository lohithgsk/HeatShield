```jsx
import React from 'react';
import Logo from './Logo';

import {
  Building2,
  ShieldAlert,
  Compass,
  LogOut,
  Zap,
  Volume2,
  AlertTriangle,
  Sparkles,
  Radio,
  Crosshair,
  BarChart3,
  BrainCircuit,
  Navigation,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Navbar({
  /* ─────────────────────────────────────────────
     Original Navbar props
  ───────────────────────────────────────────── */
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
  onOpenForecast,

  /* ─────────────────────────────────────────────
     New role-aware Navbar props
  ───────────────────────────────────────────── */
  authRole = 'city_planner',
  authSession = null,

  onReturnToLanding,
  onOpenReportModal,
  onOpenWarRoom,
  isWarRoomActive,

  showHeatmap,
  setShowHeatmap,
}) {
  const user = authSession?.user;

  const tempF = liveWeather?.temp_f ?? 78.4;

  /* ─────────────────────────────────────────────
     Navigation handlers
  ───────────────────────────────────────────── */

  const handleMapClick = () => {
    if (setActiveDrawer) {
      setActiveDrawer(null);
    }
  };

  const handleConditionsClick = () => {
    if (setShowHeatmap) {
      setShowHeatmap(!showHeatmap);
    }
  };

  const handleResourcesClick = () => {
    if (onFindNearest) {
      onFindNearest();
    }
  };

  const handleReportsClick = () => {
    if (authRole === 'city_planner') {
      if (setActiveDrawer) {
        setActiveDrawer(
          activeDrawer === 'analytics' ? null : 'analytics'
        );
      }
    } else if (authRole === 'emergency_ems') {
      if (onOpenTigerData) {
        onOpenTigerData();
      }
    } else {
      if (onOpenReportModal) {
        onOpenReportModal();
      }
    }
  };

  const handlePersonaChange = (e) => {
    if (setPersona) {
      setPersona(e.target.value);
    }
  };

  const toggleDrawer = (drawer) => {
    if (setActiveDrawer) {
      setActiveDrawer(
        activeDrawer === drawer ? null : drawer
      );
    }
  };

  /* ─────────────────────────────────────────────
     Role labels
  ───────────────────────────────────────────── */

  const roleLabel =
    authRole === 'city_planner'
      ? 'Urban Planning Console'
      : authRole === 'emergency_ems'
        ? 'EMS Operations Terminal'
        : 'Resident Heat Safety';

  return (
    <header className="top-navbar">

      {/* ═══════════════════════════════════════════
          LEFT: BRAND + ROLE + PERSONA
      ═══════════════════════════════════════════ */}

      <div className="navbar-left-group">

        {/* Brand */}
        <div
          className="brand-section"
          onClick={onReturnToLanding}
          style={{
            cursor: onReturnToLanding ? 'pointer' : 'default',
          }}
          title={
            onReturnToLanding
              ? 'Return to Gateway'
              : 'HeatShield'
          }
        >
          <Logo size={40} />

          <div className="brand-text">
            <h1>HeatShield</h1>
            <p>Raleigh · Urban Heat</p>

            {/* Preserve the newer municipal branding */}
            <span className="brand-sub">
              City of Raleigh
            </span>
          </div>
        </div>

        <div className="navbar-divider" />

        {/* Role-aware console indicator */}
        <div className="navbar-role-pill">

          {authRole === 'city_planner' && (
            <>
              <Building2
                size={13}
                className="text-blue"
              />
              <span>{roleLabel}</span>

              {user?.fullName && (
                <span className="role-user-sub">
                  | {user.fullName}
                </span>
              )}
            </>
          )}

          {authRole === 'emergency_ems' && (
            <>
              <ShieldAlert
                size={13}
                className="text-red"
              />
              <span>{roleLabel}</span>

              {user?.fullName && (
                <span className="role-user-sub">
                  | {user.fullName}
                </span>
              )}
            </>
          )}

          {authRole === 'community' && (
            <>
              <Compass
                size={13}
                className="text-green"
              />
              <span>{roleLabel}</span>
            </>
          )}
        </div>

        {/* Preserve original persona selector */}
        {setPersona && (
          <div className="persona-selector-box">
            <label htmlFor="persona-select">
              Operational Persona
            </label>

            <select
              id="persona-select"
              className="persona-select"
              value={persona}
              onChange={handlePersonaChange}
            >
              <option value="City Planners & Urban Designers">
                City Planners
              </option>

              <option value="Emergency Management & Public Health">
                Emergency Health
              </option>

              <option value="Community Advocates & Citizens">
                Community
              </option>
            </select>
          </div>
        )}
      </div>


      {/* ═══════════════════════════════════════════
          CENTER: ARCHITECTURAL NAVIGATION
      ═══════════════════════════════════════════ */}

      <nav
        className="navbar-center-nav"
        aria-label="Operational View Modes"
      >
        <button
          type="button"
          className={`nav-quiet-item ${
            !activeDrawer && !showHeatmap
              ? 'active'
              : ''
          }`}
          onClick={handleMapClick}
          title="Primary GIS Map Canvas"
        >
          <span>Map</span>
        </button>

        <button
          type="button"
          className={`nav-quiet-item ${
            showHeatmap ? 'active' : ''
          }`}
          onClick={handleConditionsClick}
          title="Toggle Microclimate Thermal Heatmap Layer"
        >
          <span>Conditions</span>

          {showHeatmap && (
            <span className="nav-status-dot active" />
          )}
        </button>

        <button
          type="button"
          className="nav-quiet-item"
          onClick={handleResourcesClick}
          title="Find Nearest Cooling Centers and Shelters"
        >
          <span>Resources</span>
        </button>

        <button
          type="button"
          className={`nav-quiet-item ${
            activeDrawer === 'analytics'
              ? 'active'
              : ''
          }`}
          onClick={handleReportsClick}
          title={
            authRole === 'city_planner'
              ? 'Tract Equity Analytics and Reports'
              : authRole === 'emergency_ems'
                ? 'Time-Series Telemetry and Sensor Logs'
                : 'Submit Heat Advisory Report'
          }
        >
          <span>Reports</span>
        </button>
      </nav>


      {/* ═══════════════════════════════════════════
          KPI RIBBON
          Preserved from original implementation
      ═══════════════════════════════════════════ */}

      <div className="hud-ribbon">

        {/* Dead Zones */}
        <div
          className="hud-item"
          title="High-heat tracts with no walking-distance cooling access"
        >
          <span
            className="hud-item-icon"
            style={{ color: '#ef4444' }}
          >
            🚨
          </span>

          <div className="hud-item-content">
            <span className="hud-item-label">
              Dead Zones
            </span>

            <span
              className="hud-item-value"
              style={{ color: '#ef4444' }}
            >
              {kpis?.dead_zones_count ?? 22}
            </span>
          </div>
        </div>


        {/* Peak Surface Temperature */}
        <div
          className="hud-item"
          title="Peak satellite surface temperature in Raleigh"
        >
          <span
            className="hud-item-icon"
            style={{ color: '#eab308' }}
          >
            🌡️
          </span>

          <div className="hud-item-content">
            <span className="hud-item-label">
              Peak Surface
            </span>

            <span
              className="hud-item-value"
              style={{ color: '#eab308' }}
            >
              {kpis?.max_surface_temp ?? 102.4}°F
            </span>
          </div>
        </div>


        {/* Tree Canopy */}
        <div
          className="hud-item"
          title="Citywide average urban tree canopy cover"
        >
          <span
            className="hud-item-icon"
            style={{ color: '#22c55e' }}
          >
            🌳
          </span>

          <div className="hud-item-content">
            <span className="hud-item-label">
              Tree Canopy
            </span>

            <span
              className="hud-item-value"
              style={{ color: '#22c55e' }}
            >
              {kpis?.avg_canopy_pct ?? 31.8}%
            </span>
          </div>
        </div>


        {/* Vulnerable Population */}
        <div
          className="hud-item"
          title="Vulnerable residents with no cooling refuge within a 15-minute walk"
        >
          <span
            className="hud-item-icon"
            style={{ color: '#a855f7' }}
          >
            👥
          </span>

          <div className="hud-item-content">
            <span className="hud-item-label">
              Unserved Vuln
            </span>

            <span
              className="hud-item-value"
              style={{ color: '#a855f7' }}
            >
              {(
                kpis?.unserved_vulnerable_pop ??
                18450
              ).toLocaleString()}
            </span>
          </div>
        </div>


        {/* Live Weather */}
        {isRealtime && liveWeather && (
          <div
            className="hud-item live-weather-pill"
            title="Live meteorological reading from Open-Meteo"
          >
            <span className="hud-item-icon">
              🌤️
            </span>

            <div className="hud-item-content">
              <span className="hud-item-label">
                Live Raleigh
              </span>

              <span
                className="hud-item-value"
                style={{ color: '#38bdf8' }}
              >
                {liveWeather.temp_f}°F ·{' '}
                {liveWeather.humidity_pct}% RH
              </span>
            </div>
          </div>
        )}
      </div>


      {/* ═══════════════════════════════════════════
          RIGHT: TELEMETRY + ROLE ACTIONS
      ═══════════════════════════════════════════ */}

      <div className="navbar-right-group">

        {/* Quiet telemetry from newer Navbar */}
        <div className="quiet-telemetry">
          <span className="live-dot" />

          <span className="telemetry-temp">
            {tempF.toFixed(1)}°F
          </span>

          <span className="telemetry-status">
            Normal
          </span>
        </div>


        {/* Tiger Data */}
        {onOpenTigerData && (
          <button
            id="btn-tiger-data"
            className="btn-nav-action"
            onClick={onOpenTigerData}
            title="Open Tiger Data / Timescale Real-Time Telemetry & Continuous Aggregates"
            style={{
              borderColor:
                'rgba(249, 115, 22, 0.55)',
              background:
                'linear-gradient(135deg, rgba(234, 88, 12, 0.22) 0%, rgba(15, 23, 42, 0.7) 100%)',
            }}
          >
            <span style={{ fontSize: '13px' }}>
              🐅
            </span>

            <span
              style={{
                color: '#fb923c',
                fontWeight: 600,
              }}
            >
              Tiger Data
            </span>

            <span
              className="live-dot"
              style={{
                backgroundColor: '#f97316',
              }}
            />
          </button>
        )}


        {/* Real-Time Toggle */}
        {setIsRealtime && (
          <button
            id="btn-realtime-toggle"
            className={`btn-nav-action${
              isRealtime ? ' active' : ''
            }`}
            onClick={() => setIsRealtime(!isRealtime)}
            title={
              isRealtime
                ? 'Real-Time ON — live GPS & weather'
                : 'Enable Real-Time Mode'
            }
            style={
              isRealtime
                ? {
                    borderColor:
                      'rgba(52,211,153,0.5)',
                    color: '#34d399',
                  }
                : {}
            }
          >
            {isRealtime ? (
              <Wifi
                size={14}
                style={{ color: '#34d399' }}
              />
            ) : (
              <WifiOff size={14} />
            )}

            <span>
              {isRealtime
                ? 'Live'
                : 'Live Mode'}
            </span>

            {isRealtime && (
              <span className="live-dot" />
            )}
          </button>
        )}


        {/* Find Nearest */}
        {isRealtime && onFindNearest && (
          <button
            id="btn-find-nearest"
            className="btn-nav-action"
            onClick={onFindNearest}
            disabled={!userLocation}
            style={{
              opacity: userLocation ? 1 : 0.55,
            }}
            title={
              userLocation
                ? 'Find nearest cooling center'
                : 'Waiting for GPS…'
            }
          >
            <Navigation
              size={14}
              style={{ color: '#38bdf8' }}
            />

            <span>
              Find Nearest
            </span>
          </button>
        )}


        {/* Drop Asset */}
        {setIsPlacingIntervention && (
          <button
            id="btn-place-intervention"
            className={`btn-nav-action${
              isPlacingIntervention
                ? ' active'
                : ''
            }`}
            onClick={() =>
              setIsPlacingIntervention(
                !isPlacingIntervention
              )
            }
            title="Drop a hypothetical cooling facility on the map"
          >
            <Crosshair size={14} />

            <span>
              {isPlacingIntervention
                ? 'Click Map…'
                : 'Drop Asset'}
            </span>
          </button>
        )}


        {/* Scenarios */}
        <button
          id="btn-scenario-drawer"
          className={`btn-nav-action${
            activeDrawer === 'scenario'
              ? ' active'
              : ''
          }`}
          onClick={() =>
            toggleDrawer('scenario')
          }
        >
          <Building2 size={14} />
          <span>Scenarios</span>
        </button>


        {/* AI Copilot */}
        <button
          id="btn-copilot-drawer"
          className={`btn-nav-action${
            activeDrawer === 'copilot'
              ? ' active'
              : ''
          }`}
          onClick={() =>
            toggleDrawer('copilot')
          }
        >
          <Sparkles
            size={14}
            style={{ color: '#60a5fa' }}
          />

          <span>AI Copilot</span>
        </button>


        {/* Voice */}
        <button
          id="btn-audio-drawer"
          className={`btn-nav-action${
            activeDrawer === 'audio'
              ? ' active'
              : ''
          }`}
          onClick={() =>
            toggleDrawer('audio')
          }
        >
          <Radio
            size={14}
            style={{ color: '#c084fc' }}
          />

          <span>Voice</span>
        </button>


        {/* Analytics */}
        <button
          id="btn-analytics-drawer"
          className={`btn-nav-action${
            activeDrawer === 'analytics'
              ? ' active'
              : ''
          }`}
          onClick={() =>
            toggleDrawer('analytics')
          }
        >
          <BarChart3 size={14} />

          <span>Analytics</span>
        </button>


        {/* Forecast */}
        {onOpenForecast && (
          <button
            id="btn-forecast-drawer"
            className={`btn-nav-action${
              activeDrawer === 'forecast'
                ? ' active'
                : ''
            }`}
            onClick={onOpenForecast}
            title="Open machine-learning heat index forecasts"
          >
            <BrainCircuit
              size={14}
              style={{ color: '#a78bfa' }}
            />

            <span>Forecast</span>
          </button>
        )}


        {/* ═══════════════════════════════════════
            ROLE-SPECIFIC PRIMARY ACTIONS
        ═══════════════════════════════════════ */}

        {/* City Planner: War Room */}
        {authRole === 'city_planner' && (
          <button
            className={`btn ${
              isWarRoomActive
                ? 'btn-danger'
                : 'btn-secondary'
            }`}
            style={{
              fontSize: 11,
              padding: '4px 10px',
            }}
            onClick={onOpenWarRoom}
            title="Open emergency heat response War Room"
          >
            <Zap size={12} />

            <span>War Room</span>
          </button>
        )}


        {/* EMS: Radio Advisory */}
        {authRole === 'emergency_ems' && (
          <button
            className="btn btn-secondary"
            style={{
              fontSize: 11,
              padding: '4px 10px',
            }}
            onClick={() =>
              setActiveDrawer('audio')
            }
          >
            <Volume2 size={12} />

            <span>Radio Advisory</span>
          </button>
        )}


        {/* Community: Report Hazard */}
        {authRole === 'community' && (
          <button
            className="btn btn-danger"
            style={{
              fontSize: 11,
              padding: '4px 10px',
            }}
            onClick={onOpenReportModal}
          >
            <AlertTriangle size={12} />

            <span>Report Hazard</span>
          </button>
        )}


        {/* Exit */}
        {onReturnToLanding && (
          <button
            className="btn btn-ghost"
            style={{
              fontSize: 11,
              padding: '4px 8px',
              color: 'var(--text-tertiary)',
            }}
            onClick={onReturnToLanding}
            title="Exit to municipal portal gateway"
          >
            <LogOut size={13} />

            <span>Exit</span>
          </button>
        )}

      </div>
    </header>
  );
}
```