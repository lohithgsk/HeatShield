import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Trees, 
  Droplets, 
  Bus, 
  Play, 
  CheckCircle, 
  Crosshair, 
  Database, 
  Activity, 
  MapPin, 
  Calculator, 
  Layers, 
  Thermometer, 
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INTERVENTIONS = [
  {
    type: 'Resilience Cooling Center',
    icon: Building2,
    color: '#315F7D',
    radius: '800m (~10 min walk)',
    cost: '$350,000',
    desc: 'Commercial HVAC, solar microgrid, backup power, potable water, and medical triage.'
  },
  {
    type: 'Urban Forest & Pocket Park',
    icon: Trees,
    color: '#4E8064',
    radius: '600m (~7.5 min walk)',
    cost: '$180,000',
    desc: '120+ native mature canopy shade trees, permeable soil, and misting benches (-3.8°F local cooling).'
  },
  {
    type: 'Community Splash Pad & Aquatics',
    icon: Droplets,
    color: '#315F7D',
    radius: '700m (~9 min walk)',
    cost: '$240,000',
    desc: 'Recirculating water jets, shade sails, and family cooling zones for heatwave relief.'
  },
  {
    type: 'Shaded Transit & Hydration Hub',
    icon: Bus,
    color: '#D58A3C',
    radius: '500m (~6 min walk)',
    cost: '$95,000',
    desc: 'High-albedo cool roofs, solar-powered mister stations, and bottle refill kiosks.'
  }
];

const PRESET_HOTSPOTS = [
  { name: 'Southeast Raleigh (Chavis & Walnut Creek)', lat: 35.7364, lon: -78.5920 },
  { name: 'South Raleigh (Garner Road Corridor)', lat: 35.7341, lon: -78.6400 },
  { name: 'East Southeast (Walnut Creek East)', lat: 35.7202, lon: -78.6134 },
  { name: 'East Raleigh (New Bern Ave Transit)', lat: 35.7890, lon: -78.5850 },
  { name: 'Northeast Raleigh (Capital Blvd Corridor)', lat: 35.8150, lon: -78.5880 }
];

export default function ScenarioDrawer({
  isOpen,
  onClose,
  activeIntervention,
  onRunSimulation,
  selectedInterventionType,
  setSelectedInterventionType,
  isPlacing,
  setIsPlacing
}) {
  const [selectedHotspot, setSelectedHotspot] = useState(PRESET_HOTSPOTS[0]);
  const [useMapPin, setUseMapPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(true);

  // Automatically activate custom map coordinates whenever an intervention pin is placed on the map
  useEffect(() => {
    if (activeIntervention?.isMapPlaced || (activeIntervention?.lat && !activeIntervention?.newly_served_vuln)) {
      setUseMapPin(true);
    }
  }, [activeIntervention]);

  const activeLat = (useMapPin && activeIntervention?.lat != null)
    ? Number(activeIntervention.lat)
    : selectedHotspot.lat;

  const activeLon = (useMapPin && (activeIntervention?.lon != null || activeIntervention?.lng != null))
    ? Number(activeIntervention.lon ?? activeIntervention.lng)
    : selectedHotspot.lon;

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      await onRunSimulation({
        lat: activeLat,
        lon: activeLon,
        interventionType: selectedInterventionType
      });
      // Fire celebratory confetti on successful simulation
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Simulation execution failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const tiger = activeIntervention?.tiger_insights;

  return (
    <div className={`action-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-title-group">
          <Building2 size={20} style={{ color: 'var(--semantic-blue)' }} />
          <div>
            <h3 className="drawer-title">Scenario Intervention Planner</h3>
            <span className="drawer-subtitle">Model hypothetical cooling assets & Tiger Data insights</span>
          </div>
        </div>
        <button className="btn-close-drawer" onClick={onClose} title="Close drawer">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body" id="scenario-drawer-body" style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 120px)' }}>
        {/* Intervention Selection */}
        <div>
          <label className="control-label" style={{ marginBottom: '8px', display: 'block' }}>
            1. Select Intervention Archetype
          </label>
          <div className="intervention-card-grid">
            {INTERVENTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedInterventionType === item.type;
              return (
                <div 
                  key={item.type}
                  className={`intervention-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedInterventionType(item.type)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} style={{ color: item.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.radius}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--semantic-amber-lt)', fontWeight: 600 }}>{item.cost}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <label className="control-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>2. Placement Location</span>
            {activeIntervention?.lat != null && (
              <span style={{ fontSize: '11px', color: 'var(--semantic-green)' }}>
                📍 Pin Placed: [{Number(activeLat).toFixed(4)}, {Number(activeLon).toFixed(4)}]
              </span>
            )}
          </label>

          {/* Mode Switcher: Preset vs Direct Map Pin */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <button
              type="button"
              className={`btn btn-secondary ${!useMapPin ? 'active' : ''}`}
              style={{
                flex: 1,
                fontSize: '11.5px',
                padding: '6px',
                background: !useMapPin ? 'var(--bg-elevated)' : 'transparent',
                borderColor: !useMapPin ? 'var(--semantic-blue)' : 'var(--border-subtle)',
                color: !useMapPin ? 'var(--text-primary)' : 'var(--text-tertiary)'
              }}
              onClick={() => setUseMapPin(false)}
            >
              Preset Hotspots
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${useMapPin ? 'active' : ''}`}
              style={{
                flex: 1,
                fontSize: '11.5px',
                padding: '6px',
                background: useMapPin ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                borderColor: useMapPin ? 'var(--semantic-blue)' : 'var(--border-subtle)',
                color: useMapPin ? 'var(--semantic-blue-lt)' : 'var(--text-tertiary)'
              }}
              onClick={() => {
                setUseMapPin(true);
                if (!activeIntervention?.lat) {
                  setIsPlacing(true);
                }
              }}
            >
              <MapPin size={12} style={{ marginRight: 4 }} />
              Direct Map Pin
            </button>
          </div>

          {!useMapPin ? (
            <select 
              className="control-select"
              value={selectedHotspot.name}
              onChange={(e) => {
                const found = PRESET_HOTSPOTS.find(h => h.name === e.target.value);
                if (found) setSelectedHotspot(found);
              }}
            >
              {PRESET_HOTSPOTS.map(h => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeIntervention?.lat != null ? 'Custom Map Placement' : 'Awaiting Map Click...'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeIntervention?.lat != null 
                    ? `Lat: ${Number(activeLat).toFixed(5)} · Lon: ${Number(activeLon).toFixed(5)}`
                    : 'Click anywhere directly on the map to drop the pin.'}
                </div>
              </div>
              <button 
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsPlacing(true)}
                style={{ fontSize: '11px', color: 'var(--semantic-blue-lt)' }}
                title="Click on map to change location"
              >
                Change
              </button>
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <button 
              type="button"
              className={`btn-secondary-action ${isPlacing ? 'active' : ''}`}
              style={{ 
                width: '100%', 
                fontSize: '0.8rem',
                border: isPlacing ? '1px solid var(--semantic-blue)' : undefined,
                background: isPlacing ? 'rgba(37, 99, 235, 0.16)' : undefined,
                color: isPlacing ? 'var(--semantic-blue-lt)' : undefined
              }}
              onClick={() => {
                setIsPlacing(!isPlacing);
                setUseMapPin(true);
              }}
            >
              <Crosshair size={15} />
              <span>{isPlacing ? 'Crosshair Active: Click Anywhere on Map Canvas' : 'Click directly anywhere on map to position pin'}</span>
            </button>
          </div>
        </div>

        {/* Run Simulation Button */}
        <button 
          className="btn-primary-action"
          style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          onClick={handleSimulate}
          disabled={isLoading}
        >
          <Play size={16} />
          <span>{isLoading ? 'Simulating Catchment...' : 'Simulate Intervention Impact'}</span>
        </button>

        {/* Real-Time Impact Results HUD */}
        {activeIntervention && activeIntervention.newly_served_vuln != null && (
          <div className="impact-hud-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--semantic-blue)' }}>
                🎯 Projected Municipal Impact
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--semantic-green)', fontWeight: 600 }}>
                ROI Score: {activeIntervention.roi_score}/100
              </span>
            </div>

            <div className="impact-metrics-row">
              <div className="impact-metric-pill success">
                <div className="impact-pill-label">Protected</div>
                <div className="impact-pill-val" style={{ color: 'var(--semantic-green)' }}>
                  +{(activeIntervention.newly_served_vuln ?? 0).toLocaleString()}
                </div>
              </div>

              <div className="impact-metric-pill">
                <div className="impact-pill-label">Alleviated</div>
                <div className="impact-pill-val" style={{ color: 'var(--semantic-blue)' }}>
                  {activeIntervention.alleviated_dead_zones}
                </div>
              </div>

              <div className="impact-metric-pill warning">
                <div className="impact-pill-label">Deficit Cut</div>
                <div className="impact-pill-val" style={{ color: 'var(--semantic-amber)' }}>
                  -{activeIntervention.pct_reduction}%
                </div>
              </div>

              <div className="impact-metric-pill amber">
                <div className="impact-pill-label">Per Capita</div>
                <div className="impact-pill-val" style={{ color: 'var(--semantic-yellow)' }}>
                  ${activeIntervention.cost_per_person}
                </div>
              </div>
            </div>

            {/* Intersecting Tracts Summary */}
            {activeIntervention.intersecting_tracts?.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Alleviated / Intersecting Communities:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {activeIntervention.intersecting_tracts.map(t => (
                    <span 
                      key={t.geoid} 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        background: t.is_dead_zone ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: t.is_dead_zone ? 'var(--semantic-red)' : 'var(--semantic-green)',
                        border: '1px solid var(--border-default)'
                      }}
                    >
                      {t.neighborhood} (HVI: {t.hvi})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            HOW THEY ARE BEING CALCULATED & TIGER DATA INSIGHTS
            ══════════════════════════════════════════════════════════════════════════ */}
        <div style={{
          marginTop: '14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div 
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: showFormulaDetails ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={15} style={{ color: 'var(--semantic-blue-lt)' }} />
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                How Impact is Calculated (Tiger Data Insights)
              </strong>
            </div>
            {showFormulaDetails ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>

          {showFormulaDetails && (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Tiger Data Telemetry Card */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.22)',
                borderRadius: '6px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Database size={13} style={{ color: 'var(--semantic-blue)' }} />
                  <strong style={{ fontSize: '11.5px', color: 'var(--semantic-blue-lt)' }}>
                    Tiger Data Sensor Mesh Telemetry (TimescaleDB)
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Telemetry Station: <strong>{tiger?.tiger_telemetry_station || 'Southeast Raleigh Node (Chavis Park)'}</strong> ({tiger?.tiger_telemetry_distance_m || 294}m from site)
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10.5px', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    Sensor Temp: <strong style={{ color: 'var(--semantic-amber-lt)' }}>{tiger?.tiger_telemetry_temp_f || 82.2}°F</strong>
                  </span>
                  <span style={{ fontSize: '10.5px', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    Heat Index: <strong style={{ color: 'var(--semantic-red)' }}>{tiger?.tiger_telemetry_heat_index || 85.0}°F</strong>
                  </span>
                  <span style={{ fontSize: '10.5px', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    UHI Delta: <strong style={{ color: '#10b981' }}>+{tiger?.tiger_uhi_offset || 3.8}°F</strong>
                  </span>
                  <span style={{ fontSize: '10.5px', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--semantic-green)' }}>
                    Thermal Multiplier: <strong>{tiger?.tiger_thermal_multiplier || 1.13}x</strong>
                  </span>
                </div>
              </div>

              {/* Census TIGER/Line Spatial Boundaries */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Layers size={13} style={{ color: 'var(--semantic-amber)' }} />
                  <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>
                    US Census TIGER/Line Spatial Geometries
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Intersected TIGER Tract: <strong>{tiger?.census_tiger_neighborhood || 'Southeast Raleigh / Chavis & Walnut Creek'}</strong> (GEOID: <code>{tiger?.census_tiger_geoid || '371830508001'}</code>)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  TIGER Land Area (<code>AREALAND</code>): <strong>{((tiger?.census_tiger_arealand_sqm || 2400000) / 1000000).toFixed(2)} km²</strong> · Catchment Radius: <strong>800m (~10 min walk)</strong>
                </div>
              </div>

              {/* Step-by-Step Mathematical Formulation */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Mathematical Formulation:
                </div>
                
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  1. <strong>Geometric Overlap Ratio:</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', background: 'var(--bg-elevated)', padding: '4px 6px', borderRadius: '4px', margin: '2px 0', color: 'var(--text-primary)' }}>
                    overlapRatio = min(1.0, max(0.15, (Radius + TractRadius - Dist) / (2 * TractRadius)))
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  2. <strong>Vulnerable Population Protected:</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', background: 'var(--bg-elevated)', padding: '4px 6px', borderRadius: '4px', margin: '2px 0', color: 'var(--text-primary)' }}>
                    NewlyServed = Σ (TractUnserved × overlapRatio × 1.4) × TigerThermalMultiplier
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  3. <strong>Municipal ROI Score (0–100):</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', background: 'var(--bg-elevated)', padding: '4px 6px', borderRadius: '4px', margin: '2px 0', color: 'var(--text-primary)' }}>
                    ROI = min(99, (Served / 300)*12 + (DeadZones*22) + (DeficitCut*2.5) + (Thermal*5))
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
