import React, { useState } from 'react';
import { X, Building2, Trees, Droplets, Bus, Play, CheckCircle, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';

const INTERVENTIONS = [
  {
    type: 'Resilience Cooling Center',
    icon: Building2,
    color: '#3b82f6',
    radius: '800m (~10 min walk)',
    cost: '$350,000',
    desc: 'Commercial HVAC, solar microgrid, backup power, potable water, and medical triage.'
  },
  {
    type: 'Urban Forest & Pocket Park',
    icon: Trees,
    color: '#10b981',
    radius: '600m (~7.5 min walk)',
    cost: '$180,000',
    desc: '120+ native mature canopy shade trees, permeable soil, and misting benches (-3.8°F local cooling).'
  },
  {
    type: 'Community Splash Pad & Aquatics',
    icon: Droplets,
    color: '#06b6d4',
    radius: '700m (~9 min walk)',
    cost: '$240,000',
    desc: 'Recirculating water jets, shade sails, and family cooling zones for heatwave relief.'
  },
  {
    type: 'Shaded Transit & Hydration Hub',
    icon: Bus,
    color: '#f59e0b',
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
  isPlacing,
  setIsPlacing
}) {
  const [selectedType, setSelectedType] = useState('Resilience Cooling Center');
  const [selectedHotspot, setSelectedHotspot] = useState(PRESET_HOTSPOTS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      await onRunSimulation({
        lat: selectedHotspot.lat,
        lon: selectedHotspot.lon,
        interventionType: selectedType
      });
      // Fire confetti celebration on successful simulation
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`action-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-title-group">
          <Building2 size={20} style={{ color: '#38bdf8' }} />
          <div>
            <h3 className="drawer-title">Scenario Intervention Planner</h3>
            <span className="drawer-subtitle">Model hypothetical cooling assets in real-time</span>
          </div>
        </div>
        <button className="btn-close-drawer" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {/* Intervention Selection */}
        <div>
          <label className="control-label" style={{ marginBottom: '8px', display: 'block' }}>
            1. Select Intervention Archetype
          </label>
          <div className="intervention-card-grid">
            {INTERVENTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedType === item.type;
              return (
                <div 
                  key={item.type}
                  className={`intervention-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedType(item.type)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} style={{ color: item.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.radius}</div>
                  <div style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 'bold' }}>{item.cost}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <label className="control-label" style={{ marginBottom: '8px', display: 'block' }}>
            2. Choose Placement Location
          </label>
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

          <div style={{ marginTop: '10px' }}>
            <button 
              className="btn-secondary-action"
              style={{ width: '100%', fontSize: '0.8rem' }}
              onClick={() => setIsPlacing(!isPlacing)}
            >
              <Crosshair size={15} />
              <span>{isPlacing ? 'Clicking active on map...' : 'Or click directly on map to place'}</span>
            </button>
          </div>
        </div>

        {/* Run Simulation Button */}
        <button 
          className="btn-primary-action"
          style={{ width: '100%', padding: '12px' }}
          onClick={handleSimulate}
          disabled={isLoading}
        >
          <Play size={16} />
          <span>{isLoading ? 'Simulating Catchment...' : 'Simulate Intervention Impact'}</span>
        </button>

        {/* Real-Time Impact Results HUD */}
        {activeIntervention && (
          <div className="impact-hud-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#60a5fa' }}>
                🎯 Projected Municipal Impact
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                ROI Score: {activeIntervention.roi_score}/100
              </span>
            </div>

            <div className="impact-metrics-row">
              <div className="impact-metric-pill success">
                <div className="impact-pill-label">Protected</div>
                <div className="impact-pill-val" style={{ color: '#34d399' }}>
                  +{activeIntervention.newly_served_vuln.toLocaleString()}
                </div>
              </div>

              <div className="impact-metric-pill">
                <div className="impact-pill-label">Alleviated</div>
                <div className="impact-pill-val" style={{ color: '#60a5fa' }}>
                  {activeIntervention.alleviated_dead_zones}
                </div>
              </div>

              <div className="impact-metric-pill warning">
                <div className="impact-pill-label">Deficit Cut</div>
                <div className="impact-pill-val" style={{ color: '#fb923c' }}>
                  -{activeIntervention.pct_reduction}%
                </div>
              </div>

              <div className="impact-metric-pill amber">
                <div className="impact-pill-label">Per Capita</div>
                <div className="impact-pill-val" style={{ color: '#fde047' }}>
                  ${activeIntervention.cost_per_person}
                </div>
              </div>
            </div>

            {/* Intersecting Tracts Summary */}
            {activeIntervention.intersecting_tracts?.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
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
                        color: t.is_dead_zone ? '#f87171' : '#34d399',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
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
      </div>
    </div>
  );
}
