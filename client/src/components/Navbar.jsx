import React from 'react';
import Logo from './Logo';
import { 
  Building2, 
  ShieldAlert, 
  Compass, 
  LogOut, 
  Zap, 
  Volume2, 
  AlertTriangle
} from 'lucide-react';

export default function Navbar({
  persona,
  authRole = 'city_planner',
  authSession = null,
  onReturnToLanding,
  activeDrawer,
  setActiveDrawer,
  liveWeather,
  onOpenReportModal,
  onOpenWarRoom,
  isWarRoomActive,
  onFindNearest,
  onOpenTigerData,
  showHeatmap,
  setShowHeatmap
}) {
  const user = authSession?.user;
  const tempF = liveWeather?.temp_f ?? 78.4;

  const handleMapClick = () => {
    if (setActiveDrawer) setActiveDrawer(null);
  };

  const handleConditionsClick = () => {
    if (setShowHeatmap) setShowHeatmap(!showHeatmap);
  };

  const handleResourcesClick = () => {
    if (onFindNearest) onFindNearest();
  };

  const handleReportsClick = () => {
    if (authRole === 'city_planner') {
      if (setActiveDrawer) setActiveDrawer(activeDrawer === 'analytics' ? null : 'analytics');
    } else if (authRole === 'emergency_ems') {
      if (onOpenTigerData) onOpenTigerData();
    } else {
      if (onOpenReportModal) onOpenReportModal();
    }
  };

  return (
    <header className="top-navbar">
      {/* Left: Institutional Masthead & Active Persona */}
      <div className="navbar-left-group">
        <div className="brand-section" onClick={onReturnToLanding} style={{ cursor: 'pointer' }} title="Return to Gateway">
          <Logo size={26} />
          <div className="brand-text">
            <span className="brand-title">HeatShield</span>
            <span className="brand-sub">City of Raleigh</span>
          </div>
        </div>

        <div className="navbar-divider" />

        <div className="navbar-role-pill">
          {authRole === 'city_planner' ? (
            <>
              <Building2 size={13} className="text-blue" />
              <span>Urban Planning Console</span>
              {user?.fullName && <span className="role-user-sub">| {user.fullName}</span>}
            </>
          ) : authRole === 'emergency_ems' ? (
            <>
              <ShieldAlert size={13} className="text-red" />
              <span>EMS Operations Terminal</span>
              {user?.fullName && <span className="role-user-sub">| {user.fullName}</span>}
            </>
          ) : (
            <>
              <Compass size={13} className="text-green" />
              <span>Resident Heat Safety</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Architectural Navigation Modes */}
      <nav className="navbar-center-nav" aria-label="Operational View Modes">
        <button
          type="button"
          className={`nav-quiet-item ${!activeDrawer && !showHeatmap ? 'active' : ''}`}
          onClick={handleMapClick}
          title="Primary GIS Map Canvas"
        >
          <span>Map</span>
        </button>

        <button
          type="button"
          className={`nav-quiet-item ${showHeatmap ? 'active' : ''}`}
          onClick={handleConditionsClick}
          title="Toggle Microclimate Thermal Heatmap Layer"
        >
          <span>Conditions</span>
          {showHeatmap && <span className="nav-status-dot active" />}
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
          className={`nav-quiet-item ${activeDrawer === 'analytics' ? 'active' : ''}`}
          onClick={handleReportsClick}
          title={authRole === 'city_planner' ? 'Tract Equity Analytics and Reports' : (authRole === 'emergency_ems' ? 'Time-Series Telemetry and Sensor Logs' : 'Submit Heat Advisory Report')}
        >
          <span>Reports</span>
        </button>
      </nav>

      {/* Right: Telemetry & Primary Action */}
      <div className="navbar-right-group">
        <div className="quiet-telemetry">
          <span className="live-dot" />
          <span className="telemetry-temp">{tempF.toFixed(1)}{"\u00B0"}F</span>
          <span className="telemetry-status">Normal</span>
        </div>

        {authRole === 'city_planner' && (
          <button
            className={`btn ${isWarRoomActive ? 'btn-danger' : 'btn-secondary'}`}
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={onOpenWarRoom}
          >
            <Zap size={12} />
            <span>War Room</span>
          </button>
        )}

        {authRole === 'emergency_ems' && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={() => setActiveDrawer('audio')}
          >
            <Volume2 size={12} />
            <span>Radio Advisory</span>
          </button>
        )}

        {authRole === 'community' && (
          <button
            className="btn btn-danger"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={onOpenReportModal}
          >
            <AlertTriangle size={12} />
            <span>Report Hazard</span>
          </button>
        )}

        <button
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 8px', color: 'var(--text-tertiary)' }}
          onClick={onReturnToLanding}
          title="Exit to municipal portal gateway"
        >
          <LogOut size={13} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
