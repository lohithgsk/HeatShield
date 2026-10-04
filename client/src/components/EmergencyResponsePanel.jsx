import React, { useState } from 'react';
import { ShieldAlert, Activity, Navigation, CheckCircle2, Truck, RefreshCw, Volume2, MapPin } from 'lucide-react';

export default function EmergencyResponsePanel({
  alerts,
  onRefreshAlerts,
  onLocateAlert,
  onDispatchAlert,
  onResolveAlert,
  onOpenVoiceBroadcast,
  onOpenTigerData,
  liveWeather,
  kpis
}) {
  const [filter, setFilter] = useState('ALL');
  const [dispatchingId, setDispatchingId] = useState(null);

  const alertList = alerts?.alerts || [];
  const counts = alerts?.counts || { total: 0, active: 0, dispatched: 0, resolved: 0, critical: 0 };

  const filteredAlerts = alertList.filter(a => {
    if (filter === 'ACTIVE') return a.status === 'ACTIVE';
    if (filter === 'DISPATCHED') return a.status === 'DISPATCHED';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  const handleDispatch = async (alertId) => {
    setDispatchingId(alertId);
    try {
      if (onDispatchAlert) {
        await onDispatchAlert(alertId, 'Mobile Cooling Unit #2 (En Route)');
      }
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="floating-control-panel emergency-response-panel">

      {/* Header */}
      <div className="panel-head">
        <div className="panel-identity">
          <div className="panel-icon red">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="panel-title">EMS Heat Triage</div>
            <div className="panel-subtitle red">Live Alerts & Dispatch</div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onRefreshAlerts} title="Refresh alerts">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Panel Body */}
      <div className="panel-body">

        {/* Triage Stats */}
        <div>
          <div className="section-label">Incident Summary</div>
          <div className="stats-row cols-3">
            <div className="stat-card danger">
              <div className="stat-card-label">Active</div>
              <div className="stat-card-value text-red">{counts.active}</div>
              <div className="stat-card-sub">{counts.critical} critical</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-card-label">En Route</div>
              <div className="stat-card-value text-orange">{counts.dispatched}</div>
              <div className="stat-card-sub">units</div>
            </div>
            <div className="stat-card success">
              <div className="stat-card-label">Resolved</div>
              <div className="stat-card-value text-green">{counts.resolved}</div>
              <div className="stat-card-sub">cleared</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-danger btn-full" onClick={onOpenVoiceBroadcast}>
            <Volume2 size={13} />
            Voice Broadcast
          </button>
          <button className="btn btn-warning" onClick={onOpenTigerData} title="Tiger Data Sensors">
            <span style={{ fontSize: 13 }}>🐅</span>
            Sensors
          </button>
        </div>

        <div className="divider" />

        {/* Filter Tabs */}
        <div>
          <div className="seg-control">
            {['ALL', 'ACTIVE', 'DISPATCHED', 'RESOLVED'].map(tab => (
              <button
                key={tab}
                className={`seg-btn${filter === tab ? ' active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Live Alerts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-tertiary)', fontSize: 12 }}>
              No {filter.toLowerCase()} alerts at this time.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.urgency === 'CRITICAL';
              const isDispatched = alert.status === 'DISPATCHED';
              const isResolved = alert.status === 'RESOLVED';
              const urgencyClass = isCritical ? 'critical' : isDispatched ? 'dispatched' : isResolved ? 'resolved' : 'high';

              return (
                <div key={alert.id} className={`alert-card ${urgencyClass}`}>
                  <div className="alert-card-header">
                    <div className="alert-meta">
                      <span className={`urgency-chip ${alert.urgency}`}>{alert.urgency}</span>
                      <span className="alert-category">{alert.category}</span>
                    </div>
                    <span className="alert-id">{alert.id}</span>
                  </div>

                  <div className="alert-location">
                    <MapPin size={11} />
                    {alert.address}
                  </div>

                  <div className="alert-description">{alert.description}</div>

                  {alert.assignedUnit && (
                    <div className="alert-unit-badge">
                      <Truck size={11} />
                      <span>{alert.assignedUnit}</span>
                    </div>
                  )}

                  <div className="alert-actions">
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: 11 }}
                      onClick={() => onLocateAlert(alert)}
                    >
                      <Navigation size={11} />
                      Locate
                    </button>

                    {!isResolved && !isDispatched && (
                      <button
                        className="btn btn-warning"
                        style={{ flex: 1, fontSize: 11 }}
                        onClick={() => handleDispatch(alert.id)}
                        disabled={dispatchingId === alert.id}
                      >
                        <Truck size={11} />
                        Dispatch
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        className="btn btn-success"
                        style={{ fontSize: 11 }}
                        onClick={() => onResolveAlert(alert.id)}
                      >
                        <CheckCircle2 size={11} />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
