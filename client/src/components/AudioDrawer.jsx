import React, { useState, useEffect, useRef } from 'react';
import { X, Radio, Volume2, Play, Pause, Download, Sparkles, RefreshCw } from 'lucide-react';

const PRESET_SCRIPTS = {
  emergency: `Emergency Extreme Heat Advisory for the City of Raleigh. Municipal microclimate monitoring stations record peak surface temperatures exceeding 104 degrees Fahrenheit, particularly in Southeast Raleigh and East Raleigh corridors. Our spatial decision support system has identified 22 critical heat dead zones across the city, leaving over 32,000 vulnerable residents outside safe walking distance to cooling infrastructure. Emergency cooling shelters and transit misting pavilions are now active. Please check on elderly neighbors and stay hydrated.`,
  council: `Executive Climate Action Briefing for Raleigh City Council. Geospatial multi-criteria analysis confirms urgent capital priorities in Southeast Raleigh and the Garner Road corridor. We recommend authorizing an initial emergency allocation of $350,000 to deploy a solar-powered resilience cooling hub, while leveraging federal Justice40 and FEMA BRIC co-funding to expand Raleigh's urban tree canopy along high-heat pedestrian corridors.`,
  equity: `Raleigh Climate Equity Spotlight: In East Raleigh and Walnut Creek, tree canopy coverage currently sits at 18%, resulting in surface asphalt temperatures 12 degrees hotter than surrounding suburban districts. Restoring tree canopy equity along New Bern Avenue will directly protect over 4,000 low-income residents and reduce localized heat stress by up to 4 degrees.`
};

export default function AudioDrawer({
  isOpen,
  onClose,
  initialScript = ''
}) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [scriptText, setScriptText] = useState(PRESET_SCRIPTS.emergency);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  // Load voices from API
  useEffect(() => {
    fetch('/api/voices')
      .then(r => r.json())
      .then(d => {
        if (d.voices && d.voices.length > 0) {
          setVoices(d.voices);
          setSelectedVoice(d.voices[0].voice_id);
        }
      })
      .catch(console.error);
  }, []);

  // Update script if passed from Copilot
  useEffect(() => {
    if (initialScript) {
      setScriptText(initialScript);
    }
  }, [initialScript]);

  const handleSynthesize = async () => {
    if (!scriptText.trim()) return;
    setIsSynthesizing(true);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptText, voice_id: selectedVoice })
      });

      if (!response.ok) {
        throw new Error('TTS Synthesis failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      alert('Failed to synthesize audio with ElevenLabs. Please check API key in .env.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`action-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-title-group">
          <Radio size={20} style={{ color: '#c084fc' }} />
          <div>
            <h3 className="drawer-title">ElevenLabs Voice Broadcast</h3>
            <span className="drawer-subtitle">Studio-Quality AI Speech Synthesis</span>
          </div>
        </div>
        <button className="btn-close-drawer" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {/* Voice Profile Selector */}
        <div>
          <label className="control-label" style={{ marginBottom: '6px', display: 'block' }}>
            Select ElevenLabs AI Voice
          </label>
          <select 
            className="control-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.length > 0 ? (
              voices.map(v => (
                <option key={v.voice_id} value={v.voice_id}>
                  {v.name}
                </option>
              ))
            ) : (
              <>
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel - Clear & Professional</option>
                <option value="pNInz6obpgDQGcFmaJgB">Adam - Executive Officer</option>
                <option value="piTKgcLEGmPE4e6mEKli">Nicole - Public Health Director</option>
                <option value="JBFqnCBsd6RMkjVDRZzb">George - Senior Climate Analyst</option>
              </>
            )}
          </select>
        </div>

        {/* Quick Preset Buttons */}
        <div>
          <label className="control-label" style={{ marginBottom: '6px', display: 'block' }}>
            Quick Template
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              className="btn-secondary-action" 
              style={{ fontSize: '0.72rem', padding: '6px 10px' }}
              onClick={() => setScriptText(PRESET_SCRIPTS.emergency)}
            >
              🚨 Heat Emergency Alert
            </button>
            <button 
              className="btn-secondary-action" 
              style={{ fontSize: '0.72rem', padding: '6px 10px' }}
              onClick={() => setScriptText(PRESET_SCRIPTS.council)}
            >
              🏛️ Council Resolution
            </button>
            <button 
              className="btn-secondary-action" 
              style={{ fontSize: '0.72rem', padding: '6px 10px' }}
              onClick={() => setScriptText(PRESET_SCRIPTS.equity)}
            >
              🌳 Tree Equity Spotlight
            </button>
          </div>
        </div>

        {/* Script Text Area */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="control-label">Spoken Broadcast Script</label>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{scriptText.length} characters</span>
          </div>
          <textarea 
            className="control-select"
            rows={7}
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Type or paste briefing script to synthesize..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Generate Button */}
        <button 
          className="btn-primary-action"
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
          onClick={handleSynthesize}
          disabled={isSynthesizing}
        >
          {isSynthesizing ? <RefreshCw className="animate-spin" size={16} /> : <Volume2 size={16} />}
          <span>{isSynthesizing ? 'Synthesizing with ElevenLabs...' : 'Synthesize Audio Broadcast'}</span>
        </button>

        {/* Audio Player Card */}
        {audioUrl && (
          <div className="audio-player-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c084fc' }}>
                📻 Studio Audio Player
              </span>
              <a 
                href={audioUrl} 
                download="raleigh_heat_briefing.mp3" 
                className="btn-secondary-action"
                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              >
                <Download size={13} />
                <span>MP3</span>
              </a>
            </div>

            {/* Waveform Animation */}
            {isPlaying && (
              <div className="waveform-animation">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            )}

            <audio 
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
