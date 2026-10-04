import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import ScenarioDrawer from './components/ScenarioDrawer';
import CopilotDrawer from './components/CopilotDrawer';
import AudioDrawer from './components/AudioDrawer';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import NearestCoolingModal from './components/NearestCoolingModal';
import TigerDataModal from './components/TigerDataModal';
import { Crosshair, X } from 'lucide-react';

export default function App() {
  // ── Geospatial data ──
  const [tractsGeoJSON, setTractsGeoJSON]       = useState(null);
  const [coolingResources, setCoolingResources] = useState(null);
  const [kpis, setKpis]                         = useState(null);

  // ── UI state ──
  const [persona, setPersona]           = useState('City Planners & Urban Designers');
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
  const [audioInitialScript, setAudioInitialScript] = useState('');

  // ── Real-time state ──
  const [isRealtime, setIsRealtime]         = useState(false);
  const [userLocation, setUserLocation]     = useState(null);
  const [liveWeather, setLiveWeather]       = useState(null);
  const [nearestData, setNearestData]       = useState(null);
  const [showNearestModal, setShowNearestModal] = useState(false);
  const [showTigerModal, setShowTigerModal] = useState(false);
  const watchIdRef         = useRef(null);
  const weatherIntervalRef = useRef(null);
  const userLocRef         = useRef(null);

  // ── Initial data fetch ──
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
  }, []);

  // ── Real-time geolocation + weather ──
  useEffect(() => {
    if (isRealtime) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setUserLocation(loc);
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
      } else {
        const defaultLoc = { lat: 35.7796, lon: -78.6382 };
        setUserLocation(defaultLoc);
        userLocRef.current = defaultLoc;
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
      setUserLocation(null);
      userLocRef.current = null;
      setLiveWeather(null);
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

  // ── Handlers ──
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
      return null;
    }
  };

  const handleConsultCopilot = (tract) => {
    setSelectedTract(tract);
    setActiveDrawer('copilot');
  };

  const handleSendToAudio = (script) => {
    setAudioInitialScript(script);
    setActiveDrawer('audio');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>

      <Navbar
        kpis={kpis}
        persona={persona}
        setPersona={setPersona}
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
      />

      <div className="workspace-container">

        {/* Placement mode banner */}
        {isPlacingIntervention && (
          <div className="placement-banner">
            <Crosshair size={18} />
            <span>Click anywhere on the Raleigh map to drop a hypothetical cooling facility</span>
            <button
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}
              onClick={() => setIsPlacingIntervention(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <MapView
          tractsGeoJSON={tractsGeoJSON}
          coolingResources={coolingResources}
          activeMetric={activeMetric}
          showDeadZones={showDeadZones}
          showResources={showResources}
          showBuffers={showBuffers}
          selectedResourceTypes={selectedResourceTypes}
          selectedTract={selectedTract}
          onSelectTract={setSelectedTract}
          activeIntervention={activeIntervention}
          isPlacingIntervention={isPlacingIntervention}
          onInterventionPlaced={handleInterventionPlaced}
          basemap={basemap}
          userLocation={userLocation}
          isRealtime={isRealtime}
        />

        <ControlPanel
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
          basemap={basemap}
          setBasemap={setBasemap}
        />

        <ScenarioDrawer
          isOpen={activeDrawer === 'scenario'}
          onClose={() => setActiveDrawer(null)}
          activeIntervention={activeIntervention}
          onRunSimulation={handleRunSimulation}
          isPlacing={isPlacingIntervention}
          setIsPlacing={setIsPlacingIntervention}
        />

        <CopilotDrawer
          isOpen={activeDrawer === 'copilot'}
          onClose={() => setActiveDrawer(null)}
          selectedTract={selectedTract}
          persona={persona}
          onSendToAudio={handleSendToAudio}
        />

        <AudioDrawer
          isOpen={activeDrawer === 'audio'}
          onClose={() => setActiveDrawer(null)}
          initialScript={audioInitialScript}
        />

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
      </div>
    </div>
  );
}
