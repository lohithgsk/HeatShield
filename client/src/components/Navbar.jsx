import React, { useState } from 'react';
import Logo from './Logo';

import {
  Database,
  Megaphone,
  Building2,
  ShieldAlert,
  Compass,
  LogOut,
  Zap,
  Volume2,
  Sparkles,
  Crosshair,
  BarChart3,
  BrainCircuit,
  MoreHorizontal,
  ChevronDown,
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
  onOpenWarRoom,
  isWarRoomActive,

  showHeatmap,
  setShowHeatmap,
  onOpenSafety,
  onOpenAnnouncements,
  isSafetyOpen,
  isAnnouncementsOpen,
}) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const user = authSession?.user;

  const tempF = liveWeather?.temperature_f ?? liveWeather?.temp_f;

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

  const closeToolsMenu = (event) => {
    const menu = event.currentTarget.closest('details');
    if (menu) menu.open = false;
    setToolsOpen(false);
  };

  /* ─────────────────────────────────────────────
     Role labels
  ───────────────────────────────────────────── */

  const roleLabel =
    authRole === 'city_planner'
      ? 'City Planning'
      : authRole === 'emergency_ems'
        ? 'EMS Response'
        : 'Resident Heat Safety';

  return (
    <header className={`top-navbar role-${authRole}`}>

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
              <span className="navbar-role-label">{roleLabel}</span>

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
              <span className="navbar-role-label">{roleLabel}</span>

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

        {/* Safety & Precautions Mode */}
        <button
          type="button"
          className={`nav-quiet-item ${isSafetyOpen ? 'active' : ''}`}
          onClick={onOpenSafety}
          title="Heat Wave Health Guide, First-Aid Cooling, & Safety Precautions"
        >
          <span>Safety</span>
        </button>

      </nav>

      <div className="navbar-right-group">

        {/* Quiet telemetry from newer Navbar */}
        <div className="quiet-telemetry">
          <span className="live-dot" />

          <span className="telemetry-temp">
            {tempF != null ? `${Number(tempF).toFixed(1)}°F` : 'Temp unavailable'}
          </span>

          <span className="telemetry-status">
            Normal
          </span>
        </div>


        {(authRole === 'city_planner' || authRole === 'emergency_ems') && (
          <details
            className="navbar-tools-menu"
            open={toolsOpen}
            onToggle={(event) => setToolsOpen(event.currentTarget.open)}
          >
            <summary className="navbar-tools-trigger" aria-label="Open operational tools">
              <MoreHorizontal size={15} />
              <span>Tools</span>
              <ChevronDown size={12} />
            </summary>
            <div className="navbar-tools-popover">
              {authRole === 'city_planner' && (
                <>
                  {setIsPlacingIntervention && (
                    <button
                      id="btn-place-intervention"
                      className={`navbar-tool-item${isPlacingIntervention ? ' active' : ''}`}
                      onClick={(event) => {
                        setIsPlacingIntervention(!isPlacingIntervention);
                        closeToolsMenu(event);
                      }}
                      title="Drop a hypothetical cooling facility on the map"
                    >
                      <Crosshair size={14} />
                      <span>{isPlacingIntervention ? 'Cancel map placement' : 'Drop asset on map'}</span>
                    </button>
                  )}
                  <button
                    id="btn-scenario-drawer"
                    className={`navbar-tool-item${activeDrawer === 'scenario' ? ' active' : ''}`}
                    onClick={(event) => {
                      toggleDrawer('scenario');
                      closeToolsMenu(event);
                    }}
                    title="Scenario Intervention Planner"
                  >
                    <Building2 size={14} />
                    <span>Intervention scenarios</span>
                  </button>
                  <button
                    id="btn-copilot-drawer"
                    className={`navbar-tool-item${activeDrawer === 'copilot' ? ' active' : ''}`}
                    onClick={(event) => {
                      toggleDrawer('copilot');
                      closeToolsMenu(event);
                    }}
                    title="Climate Copilot"
                  >
                    <Sparkles size={14} />
                    <span>Climate Copilot</span>
                  </button>
                  <button
                    id="btn-analytics-drawer"
                    className={`navbar-tool-item${activeDrawer === 'analytics' ? ' active' : ''}`}
                    onClick={(event) => {
                      toggleDrawer('analytics');
                      closeToolsMenu(event);
                    }}
                    title="Tract Equity Analytics"
                  >
                    <BarChart3 size={14} />
                    <span>Equity analytics</span>
                  </button>
                  {onOpenForecast && (
                    <button
                      id="btn-forecast-drawer"
                      className={`navbar-tool-item${activeDrawer === 'forecast' ? ' active' : ''}`}
                      onClick={(event) => {
                        onOpenForecast();
                        closeToolsMenu(event);
                      }}
                      title="Open heat index forecasts"
                    >
                      <BrainCircuit size={14} />
                      <span>Heat forecast</span>
                    </button>
                  )}
                </>
              )}
              {onOpenTigerData && (
                <button
                  id="btn-tiger-data"
                  className="navbar-tool-item"
                  onClick={(event) => {
                    onOpenTigerData();
                    closeToolsMenu(event);
                  }}
                  title="Open sensor telemetry"
                >
                  <Database size={14} />
                  <span>Sensor telemetry</span>
                  <span className="live-dot" />
                </button>
              )}
              {authRole === 'emergency_ems' && (
                <button
                  className={`navbar-tool-item${activeDrawer === 'audio' ? ' active' : ''}`}
                  onClick={(event) => {
                    setActiveDrawer('audio');
                    closeToolsMenu(event);
                  }}
                  title="Open radio advisory"
                >
                  <Volume2 size={14} />
                  <span>Radio advisory</span>
                </button>
              )}
            </div>
          </details>
        )}

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


        {/* Official City Announcements & Directives */}
        <button
          type="button"
          className={`btn btn-secondary ${isAnnouncementsOpen ? 'active' : ''}`}
          style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={onOpenAnnouncements}
          title="Official City Advisories & Emergency Directives"
        >
          <Megaphone size={12} style={{ color: '#fb923c' }} />
          <span>Announcements</span>
          <span style={{
            background: 'var(--semantic-red)',
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: '8px',
            lineHeight: 1.2
          }}>
            4
          </span>
        </button>

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
