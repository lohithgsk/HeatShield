import React, { useState } from 'react';
import { 
  X, 
  Megaphone, 
  Bell, 
  AlertCircle, 
  Clock, 
  Building2, 
  Bus, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

const MUNICIPAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Emergency Cooling Centers Extended 24/7 Across Wake County',
    agency: 'Department of City Planning & Parks & Recreation',
    timestamp: '2 hours ago • Issued Oct 4, 2026',
    category: 'Emergency Directive',
    priority: 'high',
    icon: Building2,
    color: 'var(--semantic-red)',
    badgeBg: 'rgba(239, 68, 68, 0.14)',
    badgeColor: 'var(--semantic-red)',
    content: 'Due to severe urban surface heat spikes exceeding 104°F in Southeast Raleigh, the City of Raleigh has authorized immediate 24-hour operations at John Chavis Memorial Park, Green Road Community Center, and Moore Square Transit Station. All sites provide commercial HVAC, potable water bottle refill kiosks, and backup microgrid power.',
    actions: ['Free Admission', 'Pet Friendly Triage', 'Backup Power Active']
  },
  {
    id: 'ann-2',
    title: 'GoRaleigh Zero-Fare Emergency Cooling Shuttles Active',
    agency: 'Raleigh Transportation Division & GoRaleigh',
    timestamp: '4 hours ago • Issued Oct 4, 2026',
    category: 'Public Transit',
    priority: 'medium',
    icon: Bus,
    color: 'var(--semantic-blue)',
    badgeBg: 'rgba(37, 99, 235, 0.14)',
    badgeColor: 'var(--semantic-blue-lt)',
    content: 'Zero-fare air-conditioned cooling transit shuttles are running on 15-minute headways along Route 1 (Capital Blvd), Route 15 (WakeMed / New Bern Ave), and Route 5 (Biltmore / South State St). All buses are equipped with chilled hydration packets and directly connect unserved heat dead zones to designated municipal cooling refuges.',
    actions: ['Zero Fare', '15-Min Frequency', 'Chilled Water Aboard']
  },
  {
    id: 'ann-3',
    title: 'Mobile Misting Stations Deployed along High-Heat Pedestrian Corridors',
    agency: 'Wake County Public Health & Raleigh Urban Design',
    timestamp: 'Today at 8:00 AM',
    category: 'Public Health',
    priority: 'medium',
    icon: Droplets,
    color: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.14)',
    badgeColor: '#06b6d4',
    content: 'Mobile solar-powered high-pressure misting pavilions have been stationed along high-pedestrian corridors including Moore Square bus boarding platforms, Martin Luther King Jr Blvd pedestrian crossing, and Hillsborough St near campus. Pedestrians can lower skin surface temperature by up to 15°F in 30 seconds.',
    actions: ['Continuous Operation', 'Solar Powered', 'Instant Relief']
  },
  {
    id: 'ann-4',
    title: 'NWS Excessive Heat Advisory: Peak Afternoon Heat Index 104°F',
    agency: 'National Weather Service Raleigh & Wake Emergency Management',
    timestamp: 'Yesterday at 5:00 PM',
    category: 'Advisory',
    priority: 'low',
    icon: ShieldAlert,
    color: 'var(--semantic-amber)',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeColor: 'var(--semantic-amber-lt)',
    content: 'An Excessive Heat Advisory remains in effect across Wake County from 11:00 AM through 7:00 PM. High temperatures paired with 65%+ relative humidity will create dangerous heat stress conditions for outdoor labor, seniors, and infants. Residents are urged to stay hydrated and check on vulnerable neighbors.',
    actions: ['Check on Neighbors', 'Limit Strenuous Work', 'Hydrate Often']
  }
];

export default function CityAnnouncementsModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const filteredAnnouncements = filter === 'All' 
    ? MUNICIPAL_ANNOUNCEMENTS 
    : MUNICIPAL_ANNOUNCEMENTS.filter(a => a.category === filter);

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
              background: 'rgba(234, 88, 12, 0.15)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb923c'
            }}>
              <Megaphone size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  City Announcements & Official Directives
                </h2>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: 'var(--semantic-red-bg)',
                  color: 'var(--semantic-red)',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  {MUNICIPAL_ANNOUNCEMENTS.length} Active Bulletins
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Published in real time by Raleigh City Planning & Emergency Operations
              </span>
            </div>
          </div>
          <button 
            type="button"
            className="btn btn-ghost" 
            onClick={onClose}
            style={{ padding: '6px' }}
            title="Close announcements"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 22px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto'
        }}>
          {['All', 'Emergency Directive', 'Public Transit', 'Public Health', 'Advisory'].map(cat => (
            <button
              key={cat}
              type="button"
              className={`btn ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAnnouncements.map((ann) => {
            const Icon = ann.icon;
            return (
              <div 
                key={ann.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderLeft: `3px solid ${ann.color}`,
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Meta Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: ann.color, display: 'flex', alignItems: 'center' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {ann.title}
                      </h4>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {ann.agency} • {ann.timestamp}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: ann.badgeBg,
                    color: ann.badgeColor,
                    whiteSpace: 'nowrap'
                  }}>
                    {ann.category}
                  </span>
                </div>

                {/* Content */}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {ann.content}
                </p>

                {/* Key Points / Action Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {ann.actions.map((act, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        padding: '3px 8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={11} style={{ color: 'var(--semantic-green)' }} />
                      <span>{act}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
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
            Official Bulletins • City of Raleigh Public Resilience System
          </span>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ fontSize: '12px', padding: '5px 14px' }}
          >
            Close Bulletins
          </button>
        </div>
      </div>
    </div>
  );
}
