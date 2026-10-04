import React from 'react';
import { 
  BarChart3, 
  FileText,
  Building2, 
  Crosshair, 
  FileSpreadsheet, 
  AlertTriangle,
  Flame,
  History,
  Zap
} from 'lucide-react';
import ForecastPredictionCard from './ForecastPredictionCard';

export default function PlannerAnalyticsPanel({
  activeMetric,
  setActiveMetric,
  showDeadZones,
  setShowDeadZones,
  showBuffers,
  setShowBuffers,
  showResources,
  setShowResources,
  selectedResourceTypes,
  setSelectedResourceTypes,
  selectedTract,
  onConsultCopilot,
  onOpenScenarios,
  onOpenAnalytics,
  isPlacingIntervention,
  setIsPlacingIntervention,
  basemap,
  setBasemap,
  kpis,
  // Live heatmap & historical replay props
  showHeatmap,
  setShowHeatmap,
  heatmapMode,
  setHeatmapMode,
  dimChoropleth,
  setDimChoropleth,
  isHistoricalReplayActive,
  setIsHistoricalReplayActive,
  // Heatwave War Room props
  onOpenWarRoom,
  isWarRoomActive
}) {
  const handleToggleResourceType = (type) => {
    if (selectedResourceTypes.includes(type)) {
      setSelectedResourceTypes(selectedResourceTypes.filter(t => t !== type));
    } else {
      setSelectedResourceTypes([...selectedResourceTypes, type]);
    }
  };

  return (
    <div className="floating-control-panel planner-analytics-panel">

      {/* Header */}
      <div className="panel-head">
        <div className="panel-identity">
          <div className="panel-icon blue">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="panel-title">Urban Planning</div>
            <div className="panel-subtitle blue">Capital Improvement & Equity</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onOpenAnalytics} title="Open Census Tract Table">
          <FileSpreadsheet size={12} />
          Table
        </button>
      </div>

      {/* Panel Body */}
      <div className="panel-body">

        {/* Flagship: Heatwave War Room Command Card */}
        <div style={{
          padding: '12px',
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          borderLeft: "3px solid var(--semantic-red)"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              <Zap size={12} style={{ color: '#fbbf24' }} />
              HEATWAVE WAR ROOM
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#fbbf24',
              background: 'rgba(245, 158, 11, 0.14)',
              padding: '1px 6px',
              borderRadius: '3px'
            }}>
              24h Threat
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            What if Raleigh gets hit tomorrow?
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.35 }}>
            Simulate impending Category 4 heat risk <strong>BEFORE</strong> it strikes. Activate pre-emptive playbooks <strong>NOW</strong> to change the outcome.
          </p>

          <button
            className="btn btn-full btn-primary"
            style={{
              background: isWarRoomActive ? "var(--semantic-red)" : "#dc2626",
              borderColor: "var(--semantic-red)",
              fontWeight: 600
            }}
            onClick={onOpenWarRoom}
          >
            <Zap size={13} />
            {isWarRoomActive ? 'Open War Room Command' : 'Launch Heatwave War Room'}
          </button>
        </div>

        <div className="divider" />

        <ForecastPredictionCard audience="city" />

        <div className="divider" />

        {/* KPI Summary */}
        <div>
          <div className="section-label">City-Wide Summary</div>
          <div className="stats-row cols-2">
            <div className="stat-card danger">
              <div className="stat-card-label">Unserved Pop.</div>
              <div className="stat-card-value text-purple">
                {((kpis?.unserved_vulnerable_pop ?? 32000) / 1000).toFixed(1)}k
              </div>
              <div className="stat-card-sub">Beyond 800m walk</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Canopy Deficit</div>
              <div className="stat-card-value text-green">
                {Math.round((100 - (kpis?.avg_canopy_pct ?? 39.2)) * 10) / 10}%
              </div>
              <div className="stat-card-sub">Target: 50% cover</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Metric Selector */}
        <div>
          <label className="field-label">Choropleth Metric</label>
          <select
            className="field-select"
            value={activeMetric}
            onChange={(e) => setActiveMetric(e.target.value)}
          >
            <option value="Heat Vulnerability Index (HVI)">Heat Vulnerability Index (HVI)</option>
            <option value="Surface Temperature (°F)">Surface Temperature (°F)</option>
            <option value="Tree Canopy Cover (%)">Tree Canopy Cover (%)</option>
            <option value="Impervious Surface (%)">Impervious Surface (%)</option>
            <option value="Poverty Rate (%)">Poverty Rate (%)</option>
            <option value="Senior Population 65+ (%)">Senior Population 65+ (%)</option>
          </select>
        </div>

        <div className="divider" />

        {/* Map Layers */}
        <div>
          <div className="section-label">Map Layers & Visualization</div>
          <div className="toggle-list">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showDeadZones}
                onChange={(e) => setShowDeadZones(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label danger">
                Dead Zones ({kpis?.dead_zones_count ?? 22})
              </span>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showBuffers}
                onChange={(e) => setShowBuffers(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">Pedestrian Catchments (800m)</span>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showResources}
                onChange={(e) => setShowResources(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">Cooling Assets (OpenStreetMap)</span>
            </label>

            {/* Live Heatmap Layer Toggle */}
            <div style={{ 
              marginTop: 4, 
              padding: '8px 10px', 
              background: showHeatmap ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.05)', 
              borderRadius: 'var(--radius-sm)', 
              border: `1px solid ${showHeatmap ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.18)'}` 
            }}>
              <label className="toggle-item" style={{ marginBottom: showHeatmap ? 6 : 0 }}>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                />
                <span className="toggle-slider" style={{ background: showHeatmap ? '#ef4444' : undefined, borderColor: showHeatmap ? '#ef4444' : undefined }} />
                <span className="toggle-label" style={{ color: showHeatmap ? 'var(--semantic-red)' : undefined, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={13} />
                  Live Thermal Heatmap
                </span>
              </label>

              {showHeatmap && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Density Metric:</span>
                    <select
                      className="field-select"
                      style={{ width: 'auto', padding: '2px 6px', fontSize: 11 }}
                      value={heatmapMode}
                      onChange={(e) => setHeatmapMode(e.target.value)}
                    >
                      <option value="surface_temp">Surface Temp (°F)</option>
                      <option value="hvi">HVI Vulnerability</option>
                    </select>
                  </div>
                  <label className="toggle-item" style={{ fontSize: 11 }}>
                    <input
                      type="checkbox"
                      checked={dimChoropleth}
                      onChange={(e) => setDimChoropleth(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                    <span className="toggle-label" style={{ fontSize: 11 }}>Ghost Tracts (FLIR Thermal)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Historical Replay Trigger Card */}
        <div style={{ 
          padding: '10px', 
          background: isHistoricalReplayActive ? 'var(--semantic-amber-bg)' : 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)', 
          border: `1px solid ${isHistoricalReplayActive ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              color: isHistoricalReplayActive ? 'var(--semantic-amber-lt)' : 'var(--text-secondary)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 5 
            }}>
              <History size={13} />
              Historical Replay
            </span>
            {isHistoricalReplayActive && (
              <span className="replay-pulsing-dot" />
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 8px', lineHeight: 1.35 }}>
            Replay landmark past heat waves (1998 Super El Niño, 2016, 2023) across Raleigh census tracts.
          </p>
          <button
            className={`btn btn-full ${isHistoricalReplayActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              background: isHistoricalReplayActive ? '#f59e0b' : undefined, 
              borderColor: isHistoricalReplayActive ? '#f59e0b' : undefined,
              color: isHistoricalReplayActive ? '#000' : undefined,
              fontWeight: 700
            }}
            onClick={() => setIsHistoricalReplayActive(!isHistoricalReplayActive)}
          >
            <History size={13} />
            {isHistoricalReplayActive ? 'Close Replay Deck' : 'Launch El Niño Replay'}
          </button>
        </div>

        <div className="divider" />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-full ${isPlacingIntervention ? 'btn-placing' : 'btn-secondary'}`}
            onClick={() => setIsPlacingIntervention(!isPlacingIntervention)}
          >
            <Crosshair size={13} />
            {isPlacingIntervention ? 'Click Map…' : 'Simulate Asset'}
          </button>
          <button className="btn btn-secondary" onClick={onOpenScenarios}>
            <Building2 size={13} />
            ROI
          </button>
        </div>

        <div className="divider" />

        {/* Selected Tract Detail */}
        {selectedTract ? (
          <div className={`tract-card ${selectedTract.is_dead_zone ? 'dead-zone' : 'normal'}`}>
            <div className="tract-card-heading">
              <div className="tract-name">
                {selectedTract.neighborhood || selectedTract.neighborhood_name || `Census Tract ${selectedTract.name || selectedTract.geoid}`}
              </div>
              <div className="tract-geoid">GEOID: {selectedTract.geoid || selectedTract.GEOID}</div>
            </div>

            <div className="tract-stats-grid">
              <div className="tract-stat">
                <span className="stat-label">{isHistoricalReplayActive ? 'Modeled HVI' : 'HVI Score'}</span>
                <span className="stat-value" style={{
                  color: (selectedTract.modeled_hvi ?? selectedTract.heat_vulnerability_index) >= 55 ? 'var(--semantic-red)' : 'var(--semantic-green)'
                }}>
                  {selectedTract.modeled_hvi ?? selectedTract.heat_vulnerability_index} <span className="stat-unit">/ 100</span>
                </span>
              </div>
              <div className="tract-stat">
                <span className="stat-label">{isHistoricalReplayActive ? 'Modeled Temp' : 'Surface Temp'}</span>
                <span className="stat-value" style={{
                  color: isHistoricalReplayActive ? 'var(--semantic-amber-lt)' : undefined
                }}>
                  {selectedTract.modeled_temp_f ?? selectedTract.surface_temp_f}<span className="stat-unit">°F</span>
                </span>
              </div>
              <div className="tract-stat">
                <span className="stat-label">Tree Canopy</span>
                <span className="stat-value">{selectedTract.canopy_cover_pct}<span className="stat-unit">%</span></span>
              </div>
              <div className="tract-stat">
                <span className="stat-label">Impervious</span>
                <span className="stat-value">{selectedTract.impervious_pct}<span className="stat-unit">%</span></span>
              </div>
            </div>

            {selectedTract.is_dead_zone && (
              <div className="dead-zone-badge">
                <AlertTriangle size={13} />
                <span>Priority Dead Zone <span aria-hidden="true">·</span> {(selectedTract.unserved_vulnerable_pop ?? 1132).toLocaleString()} unserved</span>
              </div>
            )}

            <button
              className="btn btn-ai btn-full"
              style={{ marginTop: 10 }}
              onClick={() => onConsultCopilot(selectedTract)}
            >
              <FileText size={13} />
              Draft Council Policy Memo
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 8px' }}>
            Click any Raleigh census tract to inspect microclimate data
          </div>
        )}

        <div className="divider" />

        {/* Basemap Picker */}
        <div className="basemap-row">
          <span className="section-label" style={{ margin: 0 }}>Basemap</span>
          <select
            className="field-select"
            style={{ width: 'auto', flex: 1 }}
            value={basemap}
            onChange={(e) => setBasemap(e.target.value)}
          >
            <option value="dark">Dark Matter</option>
            <option value="light">Positron</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>

      </div>
    </div>
  );
}
