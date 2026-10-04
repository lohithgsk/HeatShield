import React, { useState } from 'react';
import { 
  X, 
  HeartHandshake, 
  Droplets, 
  AlertTriangle, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Users, 
  Dog, 
  Thermometer, 
  Clock, 
  Wind,
  Sparkles
} from 'lucide-react';

export default function SafetyPrecautionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('immediate'); // 'immediate' | 'symptoms' | 'vulnerable' | 'contacts'

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '16px'
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--semantic-green-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--semantic-green-lt)'
            }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Heat Wave Safety & Health Protocol
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                City of Raleigh • Department of Public Health & Emergency Preparedness
              </span>
            </div>
          </div>
          <button 
            type="button"
            className="btn btn-ghost" 
            onClick={onClose}
            style={{ padding: '6px' }}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '10px 22px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'immediate', label: 'Feel Better Now', icon: Droplets },
            { id: 'symptoms', label: 'Symptom Triage', icon: Activity },
            { id: 'vulnerable', label: 'Neighbors & Pets', icon: Users },
            { id: 'contacts', label: 'Emergency Hotlines', icon: Phone },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: '11.5px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: isActive ? 600 : 500,
                  flex: 1,
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: IMMEDIATE RELIEF */}
          {activeTab === 'immediate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '12px 14px',
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Experiencing overheating or lethargy right now?</strong> Follow these immediate clinical first-aid cooling interventions to rapidly lower core body temperature.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Droplets size={16} style={{ color: 'var(--semantic-blue-lt)' }} />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Pulse-Point Compresses</strong>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Place cold wet cloths or ice wrapped in fabric onto your major arterial pulse points: <strong>neck, wrists, armpits, and groin</strong>. This cools blood before it circulates back to your core.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Activity size={16} style={{ color: 'var(--semantic-green-lt)' }} />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Continuous Hydration</strong>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Drink <strong>4 to 8 ounces of cool water every 15-20 minutes</strong>. Add an electrolyte pinch or citrus. Avoid alcohol, energy drinks, and sugary sodas which accelerate dehydration.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Wind size={16} style={{ color: '#06b6d4' }} />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Tepid Sponge Shower</strong>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Take a lukewarm or tepid shower or mist your skin with a spray bottle. Avoid freezing ice baths without medical supervision as rapid shivering can paradoxically raise core heat.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--semantic-amber-lt)' }} />
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Solar Blocking at Home</strong>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    Draw curtains and blinds shut on east and west-facing windows. Keep lights and ovens off. If indoor temperature exceeds 90°F without AC, relocate to a designated City Cooling Center.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYMPTOM TRIAGE */}
          {activeTab === 'symptoms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={18} style={{ color: 'var(--semantic-red)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                  <strong>Heat Stroke is a severe medical emergency.</strong> If anyone displays confusion, slurred speech, or loss of consciousness, dial <strong>911</strong> immediately.
                </span>
              </div>

              {/* Triage Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Heat Exhaustion */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderLeft: '3px solid var(--semantic-amber)', padding: '12px 14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--semantic-amber-lt)', fontSize: '13px' }}>Heat Exhaustion (Moderate / Urgent)</strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>Move to A/C</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Symptoms:</strong> Heavy sweating, pale/cold/clammy skin, rapid weak pulse, dizziness, nausea or vomiting, muscle cramps, weakness.
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--semantic-green-lt)', marginTop: '4px' }}>
                    <strong>Immediate Action:</strong> Move to an air-conditioned room or shade. Loosen tight clothing. Sip cool water. If vomiting continues or symptoms worsen after 45 minutes, seek medical care.
                  </div>
                </div>

                {/* Heat Stroke */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderLeft: '3px solid var(--semantic-red)', padding: '12px 14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--semantic-red)', fontSize: '13px' }}>Heat Stroke (CRITICAL EMERGENCY)</strong>
                    <span style={{ fontSize: '10.5px', color: '#fff', background: 'var(--semantic-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>CALL 911</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Symptoms:</strong> High core body temperature (103°F+), hot/red skin (dry or damp), confusion, altered mental status, fainting, seizures, rapid strong pulse.
                  </div>
                  <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}>
                    <strong>Immediate Action:</strong> <strong>Call 911 immediately.</strong> Do NOT give liquids to drink. Move person to cool shade. Douse with cool water and pack ice on neck and armpits until paramedics arrive.
                  </div>
                </div>

                {/* Heat Cramps & Rash */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderLeft: '3px solid var(--semantic-blue)', padding: '12px 14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--semantic-blue-lt)', fontSize: '13px' }}>Heat Cramps & Heat Rash (Early Warning)</strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>Rest & Hydrate</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Symptoms:</strong> Painful spasms in calves, thighs, or abdomen; tiny red blister clusters in skin folds or neck.
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '4px' }}>
                    <strong>Immediate Action:</strong> Stop all physical exertion. Rest in cool air. Drink an electrolyte drink. Keep rash areas dry.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: VULNERABLE GROUPS & PETS */}
          {activeTab === 'vulnerable' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Users size={16} style={{ color: '#a855f7' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Elderly Neighbors (65+)</strong>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  Adults over 65 do not adjust to sudden temperature spikes as rapidly and are less likely to sense thirst. Check on senior family members or neighbors twice daily during heat emergencies.
                </p>
              </div>

              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={16} style={{ color: '#38bdf8' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Infants & Toddlers</strong>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  Children sweat less efficiently than adults. <strong>Never leave an infant or child in an unattended car</strong>, even with cracked windows?interior car temperatures can reach lethal levels in under 5 minutes.
                </p>
              </div>

              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Dog size={16} style={{ color: '#f59e0b' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Pet Asphalt Paw Test</strong>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  Hold the back of your bare hand firmly to the asphalt street for <strong>7 seconds</strong>. If it is uncomfortably hot for your hand, it will blister and burn your pet?s paw pads. Walk dogs on grass in the early morning.
                </p>
              </div>

              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '14px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Activity size={16} style={{ color: '#10b981' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Outdoor Workers</strong>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  Take mandated 15-minute shade breaks every 45-60 minutes when the heat index exceeds 95°F. Pair up with a buddy to monitor each other for slurred speech or disorientation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Official Raleigh and Wake County emergency services and assistance hotlines:
              </div>

              {[
                { name: 'Emergency Medical Dispatch (911)', number: '911', desc: 'Critical heat stroke, loss of consciousness, respiratory distress', tag: 'Emergency', danger: true },
                { name: 'Wake County Community Services (2-1-1)', number: '2-1-1', desc: 'Information on cooling center transit, utility bill assistance, shelter', tag: 'Assistance' },
                { name: 'Raleigh Parks & Recreation Cooling Line', number: '(919) 996-3285', desc: 'Hours, free public pool hours, and air-conditioned facility status', tag: 'Facilities' },
                { name: 'Wake County Public Health Center', number: '(919) 856-7000', desc: 'Health advisories, clinical guidance, heat vulnerability outreach', tag: 'Health Dept' }
              ].map((contact, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{contact.name}</strong>
                      <span style={{ fontSize: '10px', color: contact.danger ? 'var(--semantic-red)' : 'var(--semantic-blue)', background: 'var(--bg-card)', padding: '1px 6px', borderRadius: '3px' }}>
                        {contact.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {contact.desc}
                    </div>
                  </div>

                  <a 
                    href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                    className={`btn ${contact.danger ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                  >
                    <Phone size={12} />
                    <span>{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            HeatShield Raleigh Municipal Resilience System
          </span>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ fontSize: '12px', padding: '5px 14px' }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
