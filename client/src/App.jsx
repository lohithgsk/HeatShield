import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';
import ScenarioDrawer from './components/ScenarioDrawer';
import CopilotDrawer from './components/CopilotDrawer';
import AudioDrawer from './components/AudioDrawer';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import ForecastDrawer from './components/ForecastDrawer';
import NearestCoolingModal from './components/NearestCoolingModal';
import TigerDataModal from './components/TigerDataModal';
import ReportHeatAlertModal from './components/ReportHeatAlertModal';
import HistoricalReplayBar from './components/HistoricalReplayBar';
import HeatwaveWarRoomModal from './components/HeatwaveWarRoomModal';
import { HISTORICAL_HEATWAVES } from './data/historicalHeatwaves';
import { WAR_ROOM_SCENARIOS, computeWarRoomMitigation } from './data/warRoomScenarios';
import { Crosshair, X } from 'lucide-react';

export default function App() {
  // ── Portal View & Role-Based Auth Session ──
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'app'
  const [authSession, setAuthSession] = useState({
    role: 'community',
    user: null,
    trackedAddresses: [],
    email: null
  });

  // ── Geospatial data ──
  const [tractsGeoJSON, setTractsGeoJSON]       = useState(null);
  const [coolingResources, setCoolingResources] = useState(null);
  const [kpis, setKpis]                         = useState(null);

  // ── Persona & UI state ──
  const [persona, setPersona]           = useState('Community Advocates & Citizens');
  const [activeMetric, setActiveMetric] = useState('Heat Vulnerability Index (HVI)');
  const [basemap, setBasemap]           = useState('dark');
  const [showDeadZones, setShowDeadZones]   = useState(true);
  const [showBuffers, setShowBuffers]       = useState(true);
  const [showResources, setShowResources]   = useState(true);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([
    'Public Library', 'Community Center', 'Public Pool / Aquatic', 'Park / Tree Shade'
  ]);
  const [selectedTract, setSelectedTract]           = useState(null);
  const [activeDrawer, setActiveDrawer]             = useState(null);
  const [isPlacingIntervention, setIsPlacingIntervention] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [selectedInterventionType, setSelectedInterventionType] = useState('Resilience Cooling Center');
  const [audioInitialScript, setAudioInitialScript] = useState('');

  // ── Live Heatmap state ──
  const [showHeatmap, setShowHeatmap]       = useState(false);
  const [heatmapMode, setHeatmapMode]       = useState('surface_temp');
  const [dimChoropleth, setDimChoropleth]   = useState(false);

  // ── Historical Replay state (El Niño & past heat waves) ──
  const [isHistoricalReplayActive, setIsHistoricalReplayActive] = useState(false);
  const [selectedEventId, setSelectedEventId]                   = useState('elnino-1998');
  const [currentStepIndex, setCurrentStepIndex]                 = useState(2); // Day 3 Super El Niño Peak
  const [isPlaying, setIsPlaying]                               = useState(false);
  const [playbackSpeed, setPlaybackSpeed]                       = useState(1);

  // ── Heatwave War Room state ("What happens if Raleigh gets hit tomorrow?") ──
  const [showWarRoomModal, setShowWarRoomModal]                 = useState(false);
  const [isWarRoomActive, setIsWarRoomActive]                   = useState(false);
  const [selectedWarRoomScenarioId, setSelectedWarRoomScenarioId] = useState('super-heatdome-tomorrow');
  const [activeWarRoomActionIds, setActiveWarRoomActionIds]     = useState([
    'mobile_misting_fleet', 
    'extended_cooling_centers_24_7', 
    'free_transit_cooling_shuttles'
  ]);
  const [warRoomViewMode, setWarRoomViewMode]                   = useState('mitigated'); // 'unmitigated' | 'mitigated'

  // ── Emergency Alerts state ──
  const [alerts, setAlerts]             = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // ── Community / Real-time state ──
  const [isRealtime, setIsRealtime]         = useState(false);
  const [userLocation, setUserLocation]     = useState({ lat: 35.7712, lon: -78.6271 }); // Chavis Park default
  const [userAddress, setUserAddress]       = useState('505 Martin Luther King Jr Blvd (SE Raleigh)');
  const [flyToCoords, setFlyToCoords]       = useState(null);
  const [liveWeather, setLiveWeather]       = useState({ temp_f: 78.4, feels_like_f: 81.2, humidity_pct: 65 });
  const [nearestData, setNearestData]       = useState(null);
  const [showNearestModal, setShowNearestModal] = useState(false);
  const [showTigerModal, setShowTigerModal] = useState(false);

  const watchIdRef         = useRef(null);
  const weatherIntervalRef = useRef(null);
  const userLocRef         = useRef(userLocation);

  // Derive current historical step
  const activeHistoricalEvent = useMemo(() => {
    return HISTORICAL_HEATWAVES.find(e => e.id === selectedEventId) || HISTORICAL_HEATWAVES[0];
  }, [selectedEventId]);
  const historicalStep = activeHistoricalEvent.steps[currentStepIndex] || activeHistoricalEvent.steps[0];

  // Derive active War Room scenario & computed mitigation
  const activeWarRoomScenario = useMemo(() => {
    return WAR_ROOM_SCENARIOS.find(s => s.id === selectedWarRoomScenarioId) || WAR_ROOM_SCENARIOS[0];
  }, [selectedWarRoomScenarioId]);

  const warRoomMitigation = useMemo(() => {
    return computeWarRoomMitigation(activeWarRoomScenario, activeWarRoomActionIds);
  }, [activeWarRoomScenario, activeWarRoomActionIds]);

  // ── Fetch Initial Geospatial Data & Alerts ──
  const fetchAlerts = useCallback(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/kpis').then(r => r.json()).then(setKpis).catch(console.error);
    fetch('/api/geojson/tracts').then(r => r.json()).then(data => {
      setTractsGeoJSON(data);
      if (data.features?.length) {
        const topDead = data.features.find(f => f.properties.is_dead_zone) || data.features[0];
        setSelectedTract(topDead.properties);
      }
    }).catch(console.error);
    fetch('/api/geojson/resources').then(r => r.json()).then(setCoolingResources).catch(console.error);

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 15000);

    // Initial nearest cooling calculation
    fetch(`/api/resources/nearest?lat=35.7712&lon=-78.6271`)
      .then(r => r.json())
      .then(setNearestData)
      .catch(console.error);

    return () => clearInterval(alertInterval);
  }, [fetchAlerts]);

  // ── Real-time geolocation + weather ──
  useEffect(() => {
    if (isRealtime) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setUserLocation(loc);
            setUserAddress(`GPS Location (${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)})`);
            userLocRef.current = loc;
          },
          (err) => {
            console.warn('Geolocation denied/unavailable, defaulting to Downtown Raleigh:', err.message);
            const defaultLoc = { lat: 35.7796, lon: -78.6382 };
            setUserLocation(defaultLoc);
            userLocRef.current = defaultLoc;
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
      }

      const fetchLiveWeather = () => {
        const loc = userLocRef.current || { lat: 35.7796, lon: -78.6382 };
        fetch(`/api/weather/live?lat=${loc.lat}&lon=${loc.lon}`)
          .then(r => r.json())
          .then(setLiveWeather)
          .catch(console.error);
      };

      fetchLiveWeather();
      weatherIntervalRef.current = setInterval(fetchLiveWeather, 60000);
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (weatherIntervalRef.current !== null) {
        clearInterval(weatherIntervalRef.current);
        weatherIntervalRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (weatherIntervalRef.current !== null) {
        clearInterval(weatherIntervalRef.current);
        weatherIntervalRef.current = null;
      }
    };
  }, [isRealtime]);

  // ── Role selection & portal switching ──
  const handleSelectRole = (role, meta = {}) => {
    setAuthSession({
      role,
      user: meta.user || null,
      trackedAddresses: meta.trackedAddresses || [],
      email: meta.email || null
    });

    if (role === 'community') {
      setPersona('Community Advocates & Citizens');
      if (meta.trackedAddresses?.length > 0) {
        const first = meta.trackedAddresses[0];
        setUserAddress(first.address || first.label);
        if (first.lat && first.lon) {
          setUserLocation({ lat: first.lat, lon: first.lon });
          setFlyToCoords({ lat: first.lat, lon: first.lon });
        }
      }
    } else if (role === 'city_planner') {
      setPersona('City Planners & Urban Designers');
    } else if (role === 'emergency_ems') {
      setPersona('Emergency Management & Public Health');
    }
    setViewMode('app');
  };

  const handleReturnToLanding = () => {
    setViewMode('landing');
    setActiveDrawer(null);
    setIsWarRoomActive(false);
    setShowWarRoomModal(false);
    setIsHistoricalReplayActive(false);
    setShowReportModal(false);
  };

  // ── Address Selection (Community View) ──
  const handleAddressSelect = useCallback(async (preset) => {
    setUserAddress(preset.name);
    const loc = { lat: preset.lat, lon: preset.lon };
    setUserLocation(loc);
    userLocRef.current = loc;
    setFlyToCoords(loc);

    try {
      const res = await fetch(`/api/resources/nearest?lat=${loc.lat}&lon=${loc.lon}`);
      const data = await res.json();
      setNearestData(data);
    } catch (err) {
      console.error('Failed to compute nearest cooling for address:', err);
    }
  }, []);

  // ── Alert Operations (Emergency View) ──
  const handleLocateAlert = useCallback((alert) => {
    if (alert.lat && alert.lon) {
      setFlyToCoords({ lat: alert.lat, lon: alert.lon });
    }
  }, []);

  const handleDispatchAlert = useCallback(async (alertId, unitName) => {
    try {
      await fetch(`/api/alerts/${alertId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitName })
      });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to dispatch alert:', err);
    }
  }, [fetchAlerts]);

  const handleResolveAlert = useCallback(async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  }, [fetchAlerts]);

  // ── Find nearest cooling center ──
  const handleFindNearest = useCallback(async () => {
    const loc = userLocation || { lat: 35.7796, lon: -78.6382 };
    try {
      const res = await fetch(`/api/resources/nearest?lat=${loc.lat}&lon=${loc.lon}`);
      const data = await res.json();
      setNearestData(data);
      setShowNearestModal(true);
    } catch (err) {
      console.error('Error finding nearest cooling resource:', err);
    }
  }, [userLocation]);

  // -- Recenter User on Map --
  const handleRecenterUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          userLocRef.current = loc;
          setFlyToCoords({ ...loc, timestamp: Date.now() });
        },
        () => {
          if (userLocation) {
            setFlyToCoords({ ...userLocation, timestamp: Date.now() });
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else if (userLocation) {
      setFlyToCoords({ ...userLocation, timestamp: Date.now() });
    }
  }, [userLocation]);

  // ── Interventions ──
  const handleInterventionPlaced = (coords) => {
    setActiveIntervention(coords);
    setIsPlacingIntervention(false);
    setActiveDrawer('scenario');
  };

  const handleRunSimulation = async (simData) => {
    try {
      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simData)
      });
      return await res.json();
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // ── AI Copilot Handlers ──
  const handleConsultCopilot = (tract) => {
    setSelectedTract(tract);
    setActiveDrawer('copilot');
  };

  const handleSendToAudio = (scriptText) => {
    setAudioInitialScript(scriptText);
    setActiveDrawer('audio');
  };

// Map and shell are always mounted so Leaflet initializes at 100% dimensions

  // ── RENDER SEGREGATED APP VIEW ──
  return (
    <div className={`app-shell role-${authSession.role}`}>
      <Navbar
        kpis={kpis}
        persona={persona}
        authRole={authSession.role}
        authSession={authSession}
        onReturnToLanding={handleReturnToLanding}
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        isPlacingIntervention={isPlacingIntervention}
        setIsPlacingIntervention={setIsPlacingIntervention}
        isRealtime={isRealtime}
        setIsRealtime={setIsRealtime}
        userLocation={userLocation}
        liveWeather={liveWeather}
        onFindNearest={handleFindNearest}
        onOpenTigerData={() => setShowTigerModal(true)}
        onOpenForecast={() => setActiveDrawer(activeDrawer === 'forecast' ? null : 'forecast')}
        alerts={alerts}
        onOpenReportModal={() => setShowReportModal(true)}
        // Replay & Heatmap props
        isHistoricalReplayActive={isHistoricalReplayActive}
        setIsHistoricalReplayActive={setIsHistoricalReplayActive}
        historicalStep={historicalStep}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        // War Room props
        onOpenWarRoom={() => setShowWarRoomModal(true)}
        isWarRoomActive={isWarRoomActive}
      />

      <div className="workspace-container main-viewport">
        {/* Map View receives active historical step & war room state */}
        <MapView
          tractsGeoJSON={tractsGeoJSON}
          coolingResources={coolingResources}
          activeMetric={activeMetric}
          basemap={basemap}
          showDeadZones={showDeadZones}
          showBuffers={showBuffers}
          showResources={showResources}
          selectedResourceTypes={selectedResourceTypes}
          onSelectTract={setSelectedTract}
          selectedTract={selectedTract}
          isPlacingIntervention={isPlacingIntervention}
          onInterventionPlaced={handleInterventionPlaced}
          activeIntervention={activeIntervention}
          isRealtime={isRealtime}
          userLocation={userLocation}
          userAddress={userAddress}
          onRecenterUser={handleRecenterUser}
          liveWeather={liveWeather}
          onFindNearest={handleFindNearest}
          flyToCoords={flyToCoords}
          alerts={alerts}
          onSelectAlert={handleLocateAlert}
          // Heatmap layer props
          showHeatmap={showHeatmap}
          heatmapMode={heatmapMode}
          dimChoropleth={dimChoropleth}
          // Historical replay props
          isHistoricalReplayActive={isHistoricalReplayActive}
          historicalStep={historicalStep}
          // War Room props
          isWarRoomActive={isWarRoomActive}
          warRoomScenario={activeWarRoomScenario}
          warRoomMitigation={warRoomMitigation}
          warRoomViewMode={warRoomViewMode}
          onExitWarRoom={() => setIsWarRoomActive(false)}
        />

        <ControlPanel
          persona={persona}
          authRole={authSession.role}
          kpis={kpis}
          activeMetric={activeMetric}
          setActiveMetric={setActiveMetric}
          showDeadZones={showDeadZones}
          setShowDeadZones={setShowDeadZones}
          showBuffers={showBuffers}
          setShowBuffers={setShowBuffers}
          showResources={showResources}
          setShowResources={setShowResources}
          selectedResourceTypes={selectedResourceTypes}
          setSelectedResourceTypes={setSelectedResourceTypes}
          selectedTract={selectedTract}
          onConsultCopilot={handleConsultCopilot}
          onOpenScenarios={() => setActiveDrawer('scenario')}
          onOpenAnalytics={() => setActiveDrawer('analytics')}
          isPlacingIntervention={isPlacingIntervention}
          setIsPlacingIntervention={setIsPlacingIntervention}
          basemap={basemap}
          setBasemap={setBasemap}
          // Emergency response props
          alerts={alerts}
          onRefreshAlerts={fetchAlerts}
          onLocateAlert={handleLocateAlert}
          onDispatchAlert={handleDispatchAlert}
          onResolveAlert={handleResolveAlert}
          onOpenVoiceBroadcast={() => setActiveDrawer('audio')}
          onOpenTigerData={() => setShowTigerModal(true)}
          liveWeather={liveWeather}
          // Community props
          userLocation={userLocation}
          userAddress={userAddress}
          onAddressSelect={handleAddressSelect}
          isRealtime={isRealtime}
          onToggleRealtime={() => setIsRealtime(!isRealtime)}
          onFindNearest={handleFindNearest}
          nearestData={nearestData}
          onOpenReportModal={() => setShowReportModal(true)}
          trackedAddresses={authSession.trackedAddresses}
          subscriberEmail={authSession.email}
          // Heatmap & Historical Replay props
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          heatmapMode={heatmapMode}
          setHeatmapMode={setHeatmapMode}
          dimChoropleth={dimChoropleth}
          setDimChoropleth={setDimChoropleth}
          isHistoricalReplayActive={isHistoricalReplayActive}
          setIsHistoricalReplayActive={setIsHistoricalReplayActive}
          // War Room props
          onOpenWarRoom={() => setShowWarRoomModal(true)}
          isWarRoomActive={isWarRoomActive}
        />

        {/* Historical Heatwave Replay Console Bar (docked bottom of map) */}
        {authSession.role === 'city_planner' && isHistoricalReplayActive && (
          <HistoricalReplayBar
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            currentStepIndex={currentStepIndex}
            setCurrentStepIndex={setCurrentStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            onClose={() => {
              setIsHistoricalReplayActive(false);
              setIsPlaying(false);
            }}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
          />
        )}

        {/* Heatwave War Room Modal & Strategic Playbook (City Planner only) */}
        {authSession.role === 'city_planner' && (
          <HeatwaveWarRoomModal
            isOpen={showWarRoomModal}
            onClose={() => setShowWarRoomModal(false)}
            activeActionIds={activeWarRoomActionIds}
            setActiveActionIds={setActiveWarRoomActionIds}
            selectedScenarioId={selectedWarRoomScenarioId}
            setSelectedScenarioId={setSelectedWarRoomScenarioId}
            onApplyToMap={() => {
              setIsWarRoomActive(true);
              setShowWarRoomModal(false);
            }}
            onOpenCopilot={() => {
              setShowWarRoomModal(false);
              setActiveDrawer('copilot');
            }}
          />
        )}

        {authSession.role === 'city_planner' && (
          <ScenarioDrawer
            isOpen={activeDrawer === 'scenario'}
            onClose={() => setActiveDrawer(null)}
            activeIntervention={activeIntervention}
            onRunSimulation={handleRunSimulation}
            selectedInterventionType={selectedInterventionType}
            setSelectedInterventionType={setSelectedInterventionType}
            isPlacing={isPlacingIntervention}
            setIsPlacing={setIsPlacingIntervention}
          />
        )}

        <CopilotDrawer
          isOpen={activeDrawer === 'copilot'}
          onClose={() => setActiveDrawer(null)}
          selectedTract={selectedTract}
          persona={persona}
          onSendToAudio={handleSendToAudio}
        />

        {authSession.role === 'emergency_ems' && (
          <AudioDrawer
            isOpen={activeDrawer === 'audio'}
            onClose={() => setActiveDrawer(null)}
            initialScript={audioInitialScript}
          />
        )}

        <AnalyticsDrawer
          isOpen={activeDrawer === 'analytics'}
          onClose={() => setActiveDrawer(null)}
          tractsGeoJSON={tractsGeoJSON}
          onSelectTract={(t) => { setSelectedTract(t); setActiveDrawer(null); }}
        />

        <NearestCoolingModal
          isOpen={showNearestModal}
          onClose={() => setShowNearestModal(false)}
          nearestData={nearestData}
          liveWeather={liveWeather}
          onHighlightAsset={() => {}}
        />

        <TigerDataModal
          isOpen={showTigerModal}
          onClose={() => setShowTigerModal(false)}
        />

        <ReportHeatAlertModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          userLocation={userLocation}
          userAddress={userAddress}
          onAlertSubmitted={fetchAlerts}
        />
      </div>

      {/* Landing Page Portal Overlay: mounted over map so map is warm and immediately visible */}
      {viewMode === 'landing' && (
        <LandingPage
          onSelectRole={handleSelectRole}
          liveWeather={liveWeather}
          onCloseToMap={() => handleSelectRole('community', { email: null, trackedAddresses: [] })}
        />
      )}
    </div>
  );
}
