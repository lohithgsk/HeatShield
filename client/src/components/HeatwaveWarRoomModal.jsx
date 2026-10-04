import React, { useState, useMemo } from 'react';
import { 
  X, 
  Flame, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Building2, 
  Bus, 
  Zap, 
  Users, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  Check, 
  Copy 
} from 'lucide-react';
import { WAR_ROOM_SCENARIOS, PREEMPTIVE_ACTIONS, computeWarRoomMitigation } from '../data/warRoomScenarios';

export default function HeatwaveWarRoomModal({
  isOpen,
  onClose,
  activeActionIds,
  setActiveActionIds,
  selectedScenarioId,
  setSelectedScenarioId,
  onApplyToMap,
  onOpenCopilot
}) {
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [activeTab, setActiveTab] = useState('threat_playbook'); // 'threat_playbook' | 'council_memo'

  const activeScenario = useMemo(() => {
    return WAR_ROOM_SCENARIOS.find(s => s.id === selectedScenarioId) || WAR_ROOM_SCENARIOS[0];
  }, [selectedScenarioId]);

  const mitigation = useMemo(() => {
    return computeWarRoomMitigation(activeScenario, activeActionIds);
  }, [activeScenario, activeActionIds]);

  if (!isOpen) return null;

  const toggleAction = (actionId) => {
    if (activeActionIds.includes(actionId)) {
      setActiveActionIds(activeActionIds.filter(id => id !== actionId));
    } else {
      setActiveActionIds([...activeActionIds, actionId]);
    }
  };

  const selectAllActions = () => {
    setActiveActionIds(PREEMPTIVE_ACTIONS.map(a => a.id));
    
  };

  const clearAllActions = () => {
    setActiveActionIds([]);
  };

  const handleApplyToMap = () => {
    if (onApplyToMap) {
      onApplyToMap();
    }
    onClose();
  };

  // Generate Council Memo Markdown
  const councilMemoText = `MEMORANDUM: EMERGENCY PRE-HEATWAVE MITIGATION ORDER
TO: Raleigh City Council & Office of the Mayor
FROM: Department of City Planning & Urban Resilience
DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
SUBJECT: PRE-EMPTIVE EXECUTIVE INTERVENTION: ${activeScenario.name.toUpperCase()}

1. EXECUTIVE SUMMARY & IMPENDING THREAT
A Category 4 urban heat event is projected to impact Raleigh within ${activeScenario.leadTimeHours} hours (${activeScenario.forecastDate}).
Peak ambient temperatures will reach ${activeScenario.ambientPeakTempF}°F with heat indices of ${activeScenario.heatIndexPeakF}°F and nocturnal lows exceeding ${activeScenario.overnightMinTempF}°F.

WITHOUT IMMEDIATE ACTION (BASELINE TRAJECTORY):
- Projected Heat Casualties: ${activeScenario.baselineImpacts.predictedCasualties} lives
- Projected Emergency Room Visits: ${activeScenario.baselineImpacts.predictedErVisits} admissions
- Vulnerable Population Exposed in Dead Zones: ${activeScenario.baselineImpacts.unservedVulnerableAtRisk.toLocaleString()} residents
- Substation Blackout Risk: ${activeScenario.baselineImpacts.blackoutProbabilityPct}%
- Projected Economic & Healthcare Loss: $${(activeScenario.baselineImpacts.projectedEconomicLoss / 1000000).toFixed(1)}M

2. PRE-EMPTIVE ACTION PLAYBOOK APPROVED FOR DEPLOYMENT:
${activeActionIds.length > 0 ? PREEMPTIVE_ACTIONS.filter(a => activeActionIds.includes(a.id)).map(a => `- ${a.name} (Budget: $${a.costUsd.toLocaleString()} | Window: ${a.timeline})`).join('\n') : 'No actions currently active.'}

3. PROJECTED SAVINGS & RETURN ON INVESTMENT (ROI):
- Casualties Prevented: ${mitigation.casualtiesPrevented} lives saved
- Emergency Visits Averted: ${mitigation.erVisitsAverted} hospital admissions
- Residents Shielded: ${mitigation.residentsProtected.toLocaleString()} individuals
- Total Pre-Emptive Investment Required: $${mitigation.totalCostUsd.toLocaleString()}
- Total Direct Healthcare & Economic Losses Averted: $${(mitigation.totalSavingsUsd / 1000000).toFixed(1)}M
- NET RETURN ON PREVENTION: ${mitigation.netRoiRatio}x ROI

RECOMMENDATION: Immediate authorization of $${mitigation.totalCostUsd.toLocaleString()} from Municipal Contingency Reserves.`;

  const copyMemo = () => {
    navigator.clipboard.writeText(councilMemoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  const getActionIcon = (iconName) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={16} className="text-cyan" />;
      case 'Building2': return <Building2 size={16} className="text-blue" />;
      case 'Bus': return <Bus size={16} className="text-amber" />;
      case 'Zap': return <Zap size={16} className="text-orange" />;
      case 'Users': return <Users size={16} className="text-green" />;
      default: return <ShieldAlert size={16} className="text-red" />;
    }
  };

  return (
    <div className="modal-overlay war-room-overlay" onClick={onClose}>
      <div className="modal-box war-room-modal-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="war-room-header">
          <div className="war-room-title-area">
            <div className="war-room-badge-row">
              <span className="war-room-badge-primary">
                
                HEATWAVE WAR ROOM
              </span>
              <span className="war-room-badge-sub">City Planner Strategic Command</span>
              <span className="war-room-lead-time">
                <Clock size={12} />
                T-Minus {activeScenario.leadTimeHours}h Lead Time
              </span>
            </div>
            <h2 className="war-room-title">
              What happens if Raleigh gets hit tomorrow?
            </h2>
            <p className="war-room-subtitle">
              Predicting catastrophic impacts <strong>BEFORE</strong> the emergency strikes, and activating the pre-emptive playbook Raleigh must deploy <strong>NOW</strong> to change that outcome.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="seg-control">
              <button 
                className={`seg-btn ${activeTab === 'threat_playbook' ? 'active' : ''}`}
                onClick={() => setActiveTab('threat_playbook')}
              >
                Simulator & Playbook
              </button>
              <button 
                className={`seg-btn ${activeTab === 'council_memo' ? 'active' : ''}`}
                onClick={() => setActiveTab('council_memo')}
              >
                Council Emergency Memo
              </button>
            </div>
            <button className="btn-close-drawer" onClick={onClose} title="Close War Room">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'threat_playbook' ? (
          <div className="war-room-body">

            {/* Scenario Selection Ribbon */}
            <div className="war-room-scenario-bar">
              <div className="scenario-label-wrap">
                <span className="section-label" style={{ margin: 0 }}>Simulated Impending Threat:</span>
                <select
                  className="field-select war-room-scenario-select"
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                >
                  {WAR_ROOM_SCENARIOS.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="scenario-weather-chips">
                <span className="weather-chip danger">Peak: <b>{activeScenario.ambientPeakTempF}°F</b></span>
                <span className="weather-chip danger">Heat Index: <b>{activeScenario.heatIndexPeakF}°F</b></span>
                <span className="weather-chip amber">Night Min: <b>{activeScenario.overnightMinTempF}°F</b></span>
                <span className="weather-chip cyan">Humidity: <b>{activeScenario.humidityPct}%</b></span>
              </div>
            </div>

            {/* Main 2-Column Command Grid */}
            <div className="war-room-grid">

              {/* LEFT COLUMN: The Threat BEFORE Emergency */}
              <div className="war-room-col threat-col">
                <div className="col-header">
                  <div className="col-title-group">
                    <span className="col-step-tag danger">PHASE 1 · THE UNMITIGATED THREAT</span>
                    <h3>What Will Happen BEFORE Intervention?</h3>
                    <p>Predicted human and municipal toll if Raleigh relies solely on reactive 911 dispatch.</p>
                  </div>
                </div>

                {/* Baseline Impact Cards */}
                <div className="stats-row cols-2" style={{ marginTop: 10 }}>
                  <div className="stat-card danger">
                    <div className="stat-card-label">Projected Casualties</div>
                    <div className="stat-card-value text-red">
                      {activeScenario.baselineImpacts.predictedCasualties}
                    </div>
                    <div className="stat-card-sub">Heat-stroke deaths</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Preventable ER Cases</div>
                    <div className="stat-card-value text-orange">
                      {activeScenario.baselineImpacts.predictedErVisits}
                    </div>
                    <div className="stat-card-sub">Emergency room visits</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Unserved In Dead Zones</div>
                    <div className="stat-card-value text-purple">
                      {(activeScenario.baselineImpacts.unservedVulnerableAtRisk / 1000).toFixed(1)}k
                    </div>
                    <div className="stat-card-sub">Residents with 0 cooling</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Grid Blackout Risk</div>
                    <div className="stat-card-value text-amber">
                      {activeScenario.baselineImpacts.blackoutProbabilityPct}%
                    </div>
                    <div className="stat-card-sub">Substation tripping</div>
                  </div>
                </div>

                {/* Threat Synopsis */}
                <div className="threat-synopsis-box">
                  <AlertTriangle size={15} className="text-red" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.4, color: 'var(--text-secondary)' }}>
                    {activeScenario.synopsis}
                  </p>
                </div>

                {/* Top Critical Breach Tracts */}
                <div style={{ marginTop: 12 }}>
                  <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Top Priority Breach Tracts</span>
                    <span style={{ color: 'var(--red-lt)' }}>{activeScenario.threatTracts.length} Critical Zones</span>
                  </div>
                  <div className="threat-tract-list">
                    {activeScenario.threatTracts.map((tt, i) => (
                      <div key={i} className="threat-tract-item">
                        <div className="tract-left">
                          <span className="tract-badge">Tract {i+1}</span>
                          <div>
                            <div className="tract-title">{tt.name}</div>
                            <div className="tract-reason">{tt.reason}</div>
                          </div>
                        </div>
                        <div className="tract-temp-pill">
                          <Flame size={11} />
                          {tt.predictedTemp}°F
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: What Raleigh Should Do NOW */}
              <div className="war-room-col playbook-col">
                <div className="col-header">
                  <div className="col-title-group">
                    <span className="col-step-tag green">PHASE 2 · PRE-EMPTIVE ACTION PLAYBOOK</span>
                    <h3>What Should Raleigh Do NOW?</h3>
                    <p>Select pre-emptive counter-measures to deploy within the next 6-24 hours.</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }} onClick={selectAllActions}>
                      Activate All
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }} onClick={clearAllActions}>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Interactive Action Checklist */}
                <div className="action-checklist">
                  {PREEMPTIVE_ACTIONS.map((action) => {
                    const isChecked = activeActionIds.includes(action.id);
                    return (
                      <div 
                        key={action.id}
                        className={`action-card ${isChecked ? 'active' : ''}`}
                        onClick={() => toggleAction(action.id)}
                      >
                        <div className="action-card-header">
                          <div className="action-checkbox-row">
                            <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                              {isChecked && <Check size={12} />}
                            </div>
                            <div className="action-icon-wrap">
                              {getActionIcon(action.icon)}
                            </div>
                            <span className="action-name">{action.name}</span>
                          </div>
                          <span className="action-cost">${action.costUsd.toLocaleString()}</span>
                        </div>

                        <p className="action-desc">{action.description}</p>

                        <div className="action-meta-row">
                          <span className="action-timeline">
                            <Clock size={11} /> {action.timeline}
                          </span>
                          <span className="action-impact-badge">
                            🛡️ Protects {action.impact.vulnProtectedCount.toLocaleString()} residents
                          </span>
                          <span className="action-savings">
                            Saved: ${(action.impact.economicSavingsUsd / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* BOTTOM HUD: The Live Mitigation Delta (Outcome) */}
            <div className="war-room-delta-hud">
              <div className="delta-hud-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingDown size={18} className="text-green" />
                  <strong>SIMULATED OUTCOME WITH PRE-EMPTIVE DEPLOYMENT:</strong>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Total Pre-Deployment Budget: <strong style={{ color: '#fff' }}>${mitigation.totalCostUsd.toLocaleString()}</strong>
                </div>
              </div>

              <div className="delta-kpi-grid">
                <div className="delta-kpi-card">
                  <span className="delta-label">Casualties</span>
                  <div className="delta-compare">
                    <span className="before text-red">{activeScenario.baselineImpacts.predictedCasualties}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="after text-green">{mitigation.casualties}</span>
                  </div>
                  <span className="delta-saving">+{mitigation.casualtiesPrevented} Lives Saved</span>
                </div>

                <div className="delta-kpi-card">
                  <span className="delta-label">Hospital / ER Visits</span>
                  <div className="delta-compare">
                    <span className="before text-orange">{activeScenario.baselineImpacts.predictedErVisits}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="after text-green">{mitigation.erVisits}</span>
                  </div>
                  <span className="delta-saving">+{mitigation.erVisitsAverted} Hospitalizations Averted</span>
                </div>

                <div className="delta-kpi-card">
                  <span className="delta-label">Unserved in Dead Zones</span>
                  <div className="delta-compare">
                    <span className="before text-purple">{(activeScenario.baselineImpacts.unservedVulnerableAtRisk / 1000).toFixed(1)}k</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="after text-green">{(mitigation.unservedAtRisk / 1000).toFixed(1)}k</span>
                  </div>
                  <span className="delta-saving">+{mitigation.residentsProtected.toLocaleString()} Protected</span>
                </div>

                <div className="delta-kpi-card">
                  <span className="delta-label">Grid Blackout Risk</span>
                  <div className="delta-compare">
                    <span className="before text-amber">{activeScenario.baselineImpacts.blackoutProbabilityPct}%</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="after text-green">{mitigation.blackoutProb}%</span>
                  </div>
                  <span className="delta-saving">{mitigation.blackoutProb < 20 ? 'Grid Stabilized' : 'Substation Buffered'}</span>
                </div>

                <div className="delta-kpi-card highlight">
                  <span className="delta-label">Net Return on Prevention</span>
                  <div className="delta-roi-value">
                    {mitigation.netRoiRatio}x ROI
                  </div>
                  <span className="delta-saving">${(mitigation.totalSavingsUsd / 1000000).toFixed(1)}M Losses Averted</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* COUNCIL EMERGENCY MEMO TAB */
          <div className="war-room-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                  Automated City Council Emergency Executive Order Memo
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Pre-formatted executive policy briefing ready for immediate submission to the Mayor and Raleigh City Council.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={copyMemo}>
                {copiedMemo ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                {copiedMemo ? 'Copied to Clipboard!' : 'Copy Full Memo'}
              </button>
            </div>

            <pre className="council-memo-preview">
              {councilMemoText}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="war-room-footer">
          <div className="footer-left">
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Targeting City of Raleigh Census Tracts & OpenStreetMap cooling network
            </span>
          </div>
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Close War Room
            </button>
            <button className="btn btn-primary" onClick={handleApplyToMap} style={{ fontWeight: 700 }}>
              <MapPin size={14} />
              Project War Room onto Raleigh Map
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
