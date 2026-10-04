import React, { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, RefreshCw, X } from 'lucide-react';

const horizonLabels = { 30: '30 min', 60: '60 min', 120: '120 min' };

export default function ForecastDrawer({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/forecast');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || payload.error || 'Forecast unavailable');
      setData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    loadForecast();
    const interval = setInterval(loadForecast, 300000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const grouped = useMemo(() => {
    const groups = new Map();
    (data?.forecasts || []).forEach(forecast => {
      if (!groups.has(forecast.station_id)) groups.set(forecast.station_id, []);
      groups.get(forecast.station_id).push(forecast);
    });
    return [...groups.values()];
  }, [data]);

  return (
    <div className={`action-drawer ${isOpen ? 'open' : ''}`} style={{ width: '500px' }}>
      <div className="drawer-header">
        <div className="drawer-title-group">
          <BrainCircuit size={20} style={{ color: '#a78bfa' }} />
          <div>
            <h3 className="drawer-title">ML Heat Forecast</h3>
            <span className="drawer-subtitle">HistGradientBoosting · TigerData telemetry</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-close-drawer" onClick={loadForecast} title="Refresh forecast">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-close-drawer" onClick={onClose} title="Close forecast">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="drawer-body">
        {/* <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(167, 139, 250, 0.25)', color: '#c4b5fd', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {data?.telemetry_source && (
            <div style={{ marginTop: '6px', color: '#fbbf24' }}>
              Telemetry source: {data.telemetry_source}
            </div>
          )}
        </div> */}

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5', fontSize: '0.8rem' }}>
            {error}. Make sure the Flask service is running with <code>python ml_service/app.py</code>.
          </div>
        )}

        {loading && !grouped.length && <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Loading station forecasts…</div>}

        {grouped.map(stationForecasts => {
          const station = stationForecasts[0];
          return (
            <div key={station.station_id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(30, 41, 59, 0.65)', color: '#f8fafc', fontWeight: 700 }}>
                {station.station_name || station.station_id}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {stationForecasts.sort((a, b) => a.horizon_minutes - b.horizon_minutes).map(forecast => (
                  <div key={forecast.horizon_minutes} style={{ padding: '10px', borderRight: '1px solid var(--border-color)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{horizonLabels[forecast.horizon_minutes]}</div>
                    <div style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 800 }}>{forecast.predicted_heat_index_f}°F</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.68rem' }}>
                      {Math.round(forecast.probability_hi_90 * 100)}% above 90°F
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {data?.generated_at && (
          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
            Updated {new Date(data.generated_at).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
