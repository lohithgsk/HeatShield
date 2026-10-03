import React from 'react';
import { Layers, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ControlPanel({
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
  basemap,
  setBasemap
}) {
  const resourceOptions = [
    'Public Library',
    'Community Center',
    'Public Pool / Aquatic',
    'Park / Tree Shade'
  ];

  const handleToggleResourceType = (type) => {
    if (selectedResourceTypes.includes(type)) {
      setSelectedResourceTypes(selectedResourceTypes.filter(t => t !== type));
    } else {
      setSelectedResourceTypes([...selectedResourceTypes, type]);
    }
  };

  return (
    <div className="floating-control-panel">
      <div className="panel-header">
        <span className="panel-title">
          <Layers size={16} style={{ color: '#38bdf8' }} />
          <span>Map & Layers</span>
        </span>
      </div>

      {/* Metric Selector */}
      <div className="control-group">
        <label className="control-label">Choropleth Metric</label>
        <select 
          className="control-select"
          value={activeMetric}
          onChange={(e) => setActiveMetric(e.target.value)}
        >
          <option value="Heat Vulnerability Index (HVI)">Heat Vulnerability Index (HVI)</option>
          <option value="Surface Temperature (°F)">Surface Temperature (°F)</option>
          <option value="Tree Canopy Cover (%)">Tree Canopy Cover (%)</option>
          <option value="Impervious Surface (%)">Impervious Surface (%)</option>
          <option value="Poverty Rate (%)">Poverty Rate (&lt;200% FPL)</option>
          <option value="Senior Population 65+ (%)">Senior Population 65+ (%)</option>
        </select>
      </div>

      {/* Basemap Selector */}
      <div className="control-group">
        <label className="control-label">Basemap</label>
        <select 
          className="control-select"
          value={basemap}
          onChange={(e) => setBasemap(e.target.value)}
        >
          <option value="dark">Carto Dark Matter</option>
          <option value="light">Carto Light Positron</option>
          <option value="satellite">Esri World Satellite</option>
        </select>
      </div>

      {/* Layer Toggles */}
      <div className="control-group">
        <label className="control-label">Layer Visibility</label>
        
        <div className="toggle-row">
          <span>Highlight Dead Zones</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={showDeadZones} 
              onChange={(e) => setShowDeadZones(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <span>10-Min Walk Buffers (800m)</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={showBuffers} 
              onChange={(e) => setShowBuffers(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <span>Cooling Assets</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={showResources} 
              onChange={(e) => setShowResources(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Asset Type Filter */}
      {showResources && (
        <div className="control-group">
          <label className="control-label">Filter Cooling Types</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {resourceOptions.map(type => (
              <label key={type} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedResourceTypes.includes(type)}
                  onChange={() => handleToggleResourceType(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tract Inspector */}
      {selectedTract && (
        <div className="tract-inspect-card">
          <div className="tract-inspect-header">
            {selectedTract.neighborhood || 'Selected Census Tract'}
          </div>
          <div className="tract-inspect-sub">
            GEOID: {selectedTract.GEOID} • {selectedTract.hvi_category}
          </div>

          <div className="stat-grid-2x2">
            <div className="stat-box">
              <div className="stat-box-label">HVI Score</div>
              <div className="stat-box-value" style={{ color: '#ef4444' }}>
                {selectedTract.heat_vulnerability_index}/100
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Surface Temp</div>
              <div className="stat-box-value" style={{ color: '#f59e0b' }}>
                {selectedTract.surface_temp_f}°F
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Tree Canopy</div>
              <div className="stat-box-value" style={{ color: '#10b981' }}>
                {selectedTract.canopy_cover_pct}%
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Walk to Cooling</div>
              <div className="stat-box-value" style={{ color: '#38bdf8' }}>
                {selectedTract.walk_time_min}m
              </div>
            </div>
          </div>

          {selectedTract.is_dead_zone ? (
            <div style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <AlertTriangle size={14} />
              <span>Critical Dead Zone ({selectedTract.unserved_vulnerable_pop} unserved)</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckCircle2 size={14} />
              <span>Safe 10-Minute Walk to Cooling</span>
            </div>
          )}

          <button 
            className="btn-primary-action" 
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
            onClick={() => onConsultCopilot(selectedTract)}
          >
            <Sparkles size={14} />
            <span>Consult Gemini Copilot</span>
          </button>
        </div>
      )}
    </div>
  );
}
