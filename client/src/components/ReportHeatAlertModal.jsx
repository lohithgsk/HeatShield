import React, { useState } from 'react';
import { AlertCircle, Flame, MapPin, Send, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ReportHeatAlertModal({ isOpen, onClose, userLocation, userAddress, onAlertSubmitted }) {
  const [category, setCategory] = useState('Heat Exhaustion');
  const [urgency, setUrgency] = useState('HIGH');
  const [reporterName, setReporterName] = useState('');
  const [address, setAddress] = useState(userAddress || 'Downtown Raleigh / MLK Jr Blvd');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        category,
        urgency,
        reporterName: reporterName.trim() || 'Raleigh Citizen',
        address: address.trim() || 'Raleigh, NC',
        lat: userLocation?.lat || 35.7796,
        lon: userLocation?.lon || -78.6382,
        description: description.trim() || 'Citizen reported extreme heat vulnerability.'
      };

      const res = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSuccess(true);
      if (onAlertSubmitted) onAlertSubmitted(data);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to submit heat alert:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          color: '#f8fafc',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Report Heat Hazard / Request Help</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Directly feeds the Raleigh Emergency Heat Triage console
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#4ade80' }}>Alert Broadcast to Emergency Dispatch!</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Your distress report has been logged and dispatched to Raleigh emergency responders.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Issue Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Heat Exhaustion">🚨 Heat Exhaustion / Medical Distress</option>
                <option value="Vulnerable Senior at Risk">👵 Vulnerable Senior Isolated in Heat</option>
                <option value="Cooling System Failure">❄️ Facility A/C Outage / Failure</option>
                <option value="Need Hydration / Water">💧 Water / Hydration Point Needed</option>
                <option value="Unshaded Transit Hazard">🚏 Extreme Sun / No Shade Transit Stop</option>
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Urgency Level
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'CRITICAL', label: 'Critical (Immediate)', color: '#ef4444' },
                  { id: 'HIGH', label: 'High Priority', color: '#f97316' },
                  { id: 'MODERATE', label: 'Moderate', color: '#eab308' }
                ].map(tier => (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => setUrgency(tier.id)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: urgency === tier.id ? tier.color : '#1e293b',
                      color: urgency === tier.id ? '#ffffff' : '#94a3b8',
                      border: `1px solid ${urgency === tier.id ? tier.color : '#334155'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location / Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Location / Address
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="#38bdf8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 505 Martin Luther King Jr Blvd, Raleigh"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Reporter Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Your Name / Organization (Optional)
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="e.g. Community Neighbor, Transit Rider"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.88rem'
                }}
              >
              </input>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Situation Details
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what is happening, number of people affected, or what supplies are needed..."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  resize: 'none'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #475569',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Send size={15} />
                <span>{submitting ? 'Broadcasting...' : 'Broadcast Heat Alert'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
