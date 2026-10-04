import React, { useMemo, useState } from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';

const HORIZONS = [30, 60, 120];

function formatHorizon(minutes) {
  return `${minutes} min`;
}

export default function ForecastPredictionCard({ audience = 'city' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const predictions = useMemo(() => {
    const forecasts = forecast?.forecasts || [];
    return HORIZONS.map((horizon) => {
      const candidates = forecasts.filter(item => item.horizon_minutes === horizon);
      if (!candidates.length) return null;
      return candidates.reduce((highest, item) => (
        item.predicted_heat_index_f > highest.predicted_heat_index_f ? item : highest
      ));
    }).filter(Boolean);
  }, [forecast]);

  const loadForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/forecast');
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || 'Forecast unavailable');
      }
      setForecast(payload);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '10px 12px',
      background: isOpen ? 'rgba(59, 130, 246, 0.10)' : 'var(--bg-elevated)',
      border: `1px solid ${isOpen ? 'rgba(96, 165, 250, 0.35)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--semantic-blue-lt)',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <BrainCircuit size={13} />
            ML heat predictions
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 10.5, marginTop: 3 }}>
            {audience === 'community'
              ? 'Plan for the next 2 hours near Raleigh'
              : 'Highest forecast heat index across stations'}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadForecast}
          disabled={loading}
          title={forecast ? 'Refresh predictions' : 'Show ML predictions'}
          style={{ whiteSpace: 'nowrap' }}
        >
          {loading ? <RefreshCw size={12} className="spin" /> : <BrainCircuit size={12} />}
          {loading ? 'Loading...' : forecast ? 'Refresh' : 'Show predictions'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: 9 }}>
          {error && (
            <div style={{
              padding: '7px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--semantic-red-bg)',
              color: 'var(--semantic-red)',
              fontSize: 10.5,
              lineHeight: 1.35
            }}>
              {error}. Start the ML service with <code>python ml_service/app.py</code>.
            </div>
          )}

          {!error && predictions.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                {predictions.map((item) => (
                  <div key={item.horizon_minutes} style={{
                    padding: '7px 6px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>
                      {formatHorizon(item.horizon_minutes)}
                    </div>
                    <div style={{ color: 'var(--semantic-amber-lt)', fontSize: 15, fontWeight: 800, marginTop: 2 }}>
                      {item.predicted_heat_index_f}°F
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 9, marginTop: 2 }}>
                      {Math.round(item.probability_hi_90 * 100)}% above 90°F
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 9, marginTop: 6 }}>
                Peak station: {predictions[0].station_name || predictions[0].station_id || 'Telemetry station'}
                {forecast.telemetry_source ? ` · ${forecast.telemetry_source}` : ''}
              </div>
            </>
          )}

          {!error && !predictions.length && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>
              No station predictions were returned.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
