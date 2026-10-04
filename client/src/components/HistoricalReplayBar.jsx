import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Flame, 
  Info, 
  X, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Thermometer, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';
import { HISTORICAL_HEATWAVES } from '../data/historicalHeatwaves';

export default function HistoricalReplayBar({
  selectedEventId,
  setSelectedEventId,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onClose,
  showHeatmap,
  setShowHeatmap
}) {
  const [showDetails, setShowDetails] = useState(false);

  const activeEvent = HISTORICAL_HEATWAVES.find(e => e.id === selectedEventId) || HISTORICAL_HEATWAVES[0];
  const totalSteps = activeEvent.steps.length;
  const currentStep = activeEvent.steps[currentStepIndex] || activeEvent.steps[0];

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(2400 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= totalSteps - 1) {
          return 0; // Loop around or stop
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSteps, setCurrentStepIndex]);

  const handleEventChange = (newId) => {
    setSelectedEventId(newId);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(2);
    else if (playbackSpeed === 2) setPlaybackSpeed(4);
    else setPlaybackSpeed(1);
  };

  return (
    <div className="replay-console-wrapper">
      {/* Top Banner Header */}
      <div className="replay-console-header">
        <div className="replay-header-left">
          <div className="replay-live-tag">
            
            HISTORICAL REPLAY MODE
          </div>

          <div className="replay-event-select-wrap">
            <Calendar size={13} style={{ color: 'var(--amber-lt)' }} />
            <select
              className="replay-event-select"
              value={activeEvent.id}
              onChange={(e) => handleEventChange(e.target.value)}
            >
              {HISTORICAL_HEATWAVES.map(evt => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.badge})
                </option>
              ))}
            </select>
          </div>

          <span className="replay-enso-badge" title="Oceanic Niño Index teleconnection">
            {activeEvent.ensoPhase}
          </span>
        </div>

        <div className="replay-header-right">
          <button
            className={`btn-replay-pill ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Live Thermal Heatmap overlay during replay"
          >
            <Flame size={12} />
            <span>Thermal Heatmap: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`btn-replay-pill ${showDetails ? 'active' : ''}`}
            onClick={() => setShowDetails(!showDetails)}
            title="View meteorological event briefing"
          >
            <Info size={12} />
            <span>Briefing</span>
          </button>

          <button 
            className="btn-replay-close"
            onClick={onClose}
            title="Exit Historical Replay & Return to Real-Time Data"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="replay-console-main">
        {/* Playback Transport Buttons */}
        <div className="replay-transport">
          <button className="transport-btn" onClick={handleReset} title="Reset to start">
            <RotateCcw size={13} />
          </button>
          <button className="transport-btn" onClick={handlePrev} disabled={currentStepIndex === 0} title="Previous phase">
            <SkipBack size={13} />
          </button>
          <button 
            className="transport-btn primary" 
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause replay' : 'Play replay sequence'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
          </button>
          <button className="transport-btn" onClick={handleNext} disabled={currentStepIndex === totalSteps - 1} title="Next phase">
            <SkipForward size={13} />
          </button>
          <button className="transport-btn speed" onClick={cycleSpeed} title="Toggle playback speed">
            {playbackSpeed}x
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="replay-timeline-container">
          <div className="replay-timeline-info">
            <div className="replay-step-title">
              <span className="replay-step-index">Phase {currentStepIndex + 1}/{totalSteps}:</span>
              <strong className="replay-step-label">{currentStep.label}</strong>
              <span className="replay-step-phase">· {currentStep.phase}</span>
            </div>
            <div className="replay-anomaly-pill">
              <Thermometer size={12} />
              <span>Anomaly: {currentStep.anomalyF >= 0 ? `+${currentStep.anomalyF}` : currentStep.anomalyF}°F</span>
            </div>
          </div>

          <div className="timeline-slider-wrap">
            <input
              type="range"
              min="0"
              max={totalSteps - 1}
              value={currentStepIndex}
              onChange={(e) => {
                setCurrentStepIndex(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="timeline-slider"
            />
            {/* Step markers */}
            <div className="timeline-markers">
              {activeEvent.steps.map((st, idx) => (
                <div 
                  key={st.stepIndex}
                  className={`timeline-marker ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'passed' : ''}`}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  title={`${st.label} - ${st.phase}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Step KPI Pills */}
        <div className="replay-kpi-ribbon">
          <div className="replay-kpi-item" title="Estimated citywide average temperature">
            <span className="kpi-label">Metro Avg</span>
            <span className="kpi-value text-amber">{currentStep.raleighAvgTemp}°F</span>
          </div>

          <div className="replay-kpi-item" title="Downtown core urban heat island maximum">
            <span className="kpi-label">Downtown Core</span>
            <span className="kpi-value text-red">{currentStep.downtownTemp}°F</span>
          </div>

          <div className="replay-kpi-item" title="William B. Umstead forest protected temperature">
            <span className="kpi-label">Forest Buffer</span>
            <span className="kpi-value text-green">{currentStep.umsteadTemp}°F</span>
          </div>

          <div className="replay-kpi-item" title="Vulnerable residents exposed to dangerous heat">
            <span className="kpi-label">Vulnerable Pop</span>
            <span className="kpi-value text-purple">{((currentStep.vulnerableAtRisk || 35000) / 1000).toFixed(1)}k</span>
          </div>

          <div className="replay-kpi-item" title="Simulated 911 emergency heat distress calls">
            <span className="kpi-label">EMS Surge</span>
            <span className="kpi-value text-orange">+{currentStep.distressCallsCount * 12}%</span>
          </div>
        </div>
      </div>

      {/* Expandable Briefing Narrative */}
      {showDetails && (
        <div className="replay-briefing-drawer">
          <div className="briefing-grid">
            <div>
              <div className="briefing-sub">Meteorological Narrative & Physics</div>
              <p className="briefing-text">{currentStep.narrative}</p>
            </div>
            <div>
              <div className="briefing-sub">Climate Teleconnection Context</div>
              <p className="briefing-text">{activeEvent.description}</p>
            </div>
            <div>
              <div className="briefing-sub">Historical Benchmark Metrics</div>
              <div className="briefing-stats-row">
                <span>Peak Temp: <b>{activeEvent.keyStats.peakTemp}</b></span>
                <span>UHI Divergence: <b>{activeEvent.keyStats.uhiDifferential}</b></span>
                <span>Hospital Surge: <b>{activeEvent.keyStats.hospitalSurge}</b></span>
                <span>Duration: <b>{activeEvent.keyStats.durationDays} Days</b></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
