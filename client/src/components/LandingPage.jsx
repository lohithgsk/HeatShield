import React, { useState } from 'react';
import Logo from './Logo';
import { 
  Building2, 
  ShieldAlert, 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Bell, 
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PRESET_COMMUNITY_ADDRESSES = [
  { label: 'Chavis Park / SE Raleigh', address: '505 Martin Luther King Jr Blvd, Raleigh, NC 27601', lat: 35.7712, lon: -78.6271 },
  { label: 'Downtown Core / Moore Square', address: '214 S Blount St, Raleigh, NC 27601', lat: 35.7779, lon: -78.6367 },
  { label: 'Walnut Terrace / South State', address: '1250 S State St, Raleigh, NC 27610', lat: 35.7665, lon: -78.6335 },
  { label: 'North Hills Commercial District', address: '4200 Six Forks Rd, Raleigh, NC 27609', lat: 35.8364, lon: -78.6433 }
];

export default function LandingPage({
  onSelectRole,
  liveWeather,
  sampleUsers = [],
  onCloseToMap
}) {
  // Operational Staff Tab ('planner' | 'ems')
  const [staffTab, setStaffTab] = useState('planner');

  // Community Form State
  const [showAddressAlerts, setShowAddressAlerts] = useState(false);
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home / Primary Residence', address: '505 Martin Luther King Jr Blvd, Raleigh, NC' }
  ]);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(null);
  const [communityError, setCommunityError] = useState('');

  // Planner Login State
  const [plannerUsername, setPlannerUsername] = useState('');
  const [plannerPassword, setPlannerPassword] = useState('');
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState('');

  // EMS Login State
  const [emsUsername, setEmsUsername] = useState('');
  const [emsPassword, setEmsPassword] = useState('');
  const [emsLoading, setEmsLoading] = useState(false);
  const [emsError, setEmsError] = useState('');

  const handleAddAddressRow = () => {
    const nextId = Date.now();
    setAddresses(prev => [
      ...prev,
      { id: nextId, label: `Address #${prev.length + 1}`, address: '' }
    ]);
  };

  const handleUpdateAddress = (id, field, value) => {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleRemoveAddress = (id) => {
    if (addresses.length <= 1) return;
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSelectPreset = (preset) => {
    setAddresses(prev => {
      if (prev.length === 1 && !prev[0].address) {
        return [{ id: 1, label: preset.label, address: preset.address, lat: preset.lat, lon: preset.lon }];
      }
      return [
        ...prev,
        { id: Date.now(), label: preset.label, address: preset.address, lat: preset.lat, lon: preset.lon }
      ];
    });
  };

  const handleCommunitySubscribeAndLaunch = async (e) => {
    e.preventDefault();
    setCommunityError('');

    const validAddresses = addresses.filter(a => a.address && a.address.trim().length > 0);
    if (!validAddresses.length) {
      setCommunityError('Please specify at least one address or explore the map directly.');
      return;
    }
    if (!email || !email.includes('@')) {
      setCommunityError('Please enter a valid email address to receive advisories.');
      return;
    }

    setSubscribing(true);
    try {
      const res = await fetch('/api/community/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), addresses: validAddresses })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save address subscription');
      }

      setSubscribeSuccess({
        count: validAddresses.length,
        email: email.trim(),
        message: data.message
      });

      setTimeout(() => {
        onSelectRole('community', {
          email: email.trim(),
          trackedAddresses: validAddresses
        });
      }, 1000);
    } catch (err) {
      setCommunityError(err.message || 'Subscription failed. You can skip directly to the map.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSkipToCommunityMap = () => {
    if (onCloseToMap) {
      onCloseToMap();
    } else {
      onSelectRole('community', { email: null, trackedAddresses: [] });
    }
  };

  const handlePlannerLogin = async (e) => {
    e.preventDefault();
    setPlannerError('');
    if (!plannerUsername || !plannerPassword) {
      setPlannerError('Username and password required');
      return;
    }

    setPlannerLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: plannerUsername.trim(), password: plannerPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (data.user.role !== 'city_planner') {
        throw new Error('This account does not have City Planner permissions');
      }
      onSelectRole('city_planner', { user: data.user });
    } catch (err) {
      setPlannerError(err.message);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleEmsLogin = async (e) => {
    e.preventDefault();
    setEmsError('');
    if (!emsUsername || !emsPassword) {
      setEmsError('Username and password required');
      return;
    }

    setEmsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emsUsername.trim(), password: emsPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (data.user.role !== 'emergency_ems') {
        throw new Error('This account does not have EMS permissions');
      }
      onSelectRole('emergency_ems', { user: data.user });
    } catch (err) {
      setEmsError(err.message);
    } finally {
      setEmsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Institutional Municipal Masthead */}
      <header className="landing-top-bar">
        <div className="landing-brand">
          <Logo size={32} />
          <div>
            <div className="landing-brand-title">HeatShield | City of Raleigh</div>
            <div className="landing-brand-sub">Urban Resilience & Heat Equity System | Wake County, NC</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="landing-status-pills">
            <div className="landing-pill">
              <span className="live-dot" />
              <span className="pill-text">Live Telemetry</span>
            </div>
            <div className="landing-pill">
              <span className="pill-text">{liveWeather?.temp_f ?? 78.4}°F | Normal Advisory</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSkipToCommunityMap}
            id="btn-nav-view-map"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <span>Open Resident Map</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Asymmetric Layout */}
      <main className="landing-main-asymmetric">
        
        {/* LEFT COLUMN: Dominant Public Resident Experience (65%) */}
        <section className="landing-col-dominant">
          <div className="dominant-header">
            <div className="dominant-tag">
              <span>MUNICIPAL PUBLIC SERVICE | CITY OF RALEIGH</span>
            </div>
            <h1 className="dominant-title">
              Raleigh Urban Heat Resilience
            </h1>
            <p className="dominant-desc">
              Real-time microclimate intelligence, walking access to air-conditioned cooling centers, and heat vulnerability tracking across 248 Raleigh census tracts.
            </p>
          </div>

          {/* Primary Action Card: The ONE Focal Point */}
          <div className="public-hero-card">
            <div className="hero-card-badge">
              <Compass size={14} className="text-green" />
              <span>Public Resident Access | No Account Required</span>
            </div>

            <h2 className="hero-card-title">
              Explore Neighborhood Heat Exposure & Cooling Shelters
            </h2>
            <p className="hero-card-desc">
              Locate open air-conditioned community centers, libraries, and shaded transit misting pavilions within walking distance of your address or live GPS location.
            </p>

            <div className="hero-card-actions">
              <button
                type="button"
                className="btn btn-primary btn-hero"
                onClick={handleSkipToCommunityMap}
                id="btn-skip-to-community-map"
              >
                <span>Launch Resident Cooling Map</span>
                <ArrowRight size={16} />
              </button>

              <div className="hero-metrics-strip">
                <div className="hero-metric">
                  <span className="hero-metric-val text-green">12</span>
                  <span className="hero-metric-lbl">Active Cooling Centers</span>
                </div>
                <div className="hero-metric">
                  <span className="hero-metric-val">{liveWeather?.temp_f ?? 78.4}°F</span>
                  <span className="hero-metric-lbl">Current City Temp</span>
                </div>
                <div className="hero-metric">
                  <span className="hero-metric-val">800m</span>
                  <span className="hero-metric-lbl">Pedestrian Target Buffer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Collapsible: Optional Heat Alert Subscription */}
          <div className="alerts-accordion-card">
            <button
              type="button"
              className="accordion-toggle-btn"
              onClick={() => setShowAddressAlerts(!showAddressAlerts)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={14} className="text-green" />
                <span className="accordion-title">
                  Optional: Register Addresses for Automated Heat Advisories
                </span>
              </div>
              {showAddressAlerts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAddressAlerts && (
              <div className="accordion-content">
                <p className="accordion-desc">
                  Save your home, workplace, or family addresses to receive automated notifications when dangerous heat indices impact your specific neighborhood microclimate.
                </p>

                {communityError && (
                  <div className="portal-alert error" style={{ marginBottom: 12 }}>
                    <AlertCircle size={14} />
                    <span>{communityError}</span>
                  </div>
                )}

                {subscribeSuccess ? (
                  <div className="portal-alert success">
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>Advisory Registration Active</strong>
                      <p>Monitoring {subscribeSuccess.count} address(es) for {subscribeSuccess.email}. Launching map...</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCommunitySubscribeAndLaunch}>
                    <div className="form-group">
                      <label className="input-label">
                        <Mail size={12} /> Email for Heat Advisories
                      </label>
                      <input
                        type="email"
                        className="landing-input"
                        placeholder="resident@raleighnc.gov"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="address-header-row">
                        <label className="input-label">
                          <MapPin size={12} /> Monitored Addresses
                        </label>
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={handleAddAddressRow}
                        >
                          <Plus size={12} /> Add Location
                        </button>
                      </div>

                      <div className="address-rows-list">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="address-input-row">
                            <input
                              type="text"
                              className="landing-input address-label-input"
                              placeholder="Label (Home, Work, Parents)"
                              value={addr.label}
                              onChange={(e) => handleUpdateAddress(addr.id, 'label', e.target.value)}
                            />
                            <input
                              type="text"
                              className="landing-input address-full-input"
                              placeholder="Street Address in Raleigh, NC"
                              value={addr.address}
                              onChange={(e) => handleUpdateAddress(addr.id, 'address', e.target.value)}
                            />
                            {addresses.length > 1 && (
                              <button
                                type="button"
                                className="btn-icon-danger"
                                onClick={() => handleRemoveAddress(addr.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="presets-suggestion-box">
                        <span className="preset-hint">Quick Presets:</span>
                        {PRESET_COMMUNITY_ADDRESSES.slice(0, 3).map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="preset-chip"
                            onClick={() => handleSelectPreset(p)}
                          >
                            + {p.label.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={subscribing}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {subscribing ? 'Saving to Database...' : 'Save Addresses & Open Map'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Supporting Authorized Municipal Terminal (35%) */}
        <aside className="landing-col-supporting">
          <div className="staff-card">
            <div className="staff-card-header">
              <div className="staff-tag">
                <Lock size={12} />
                <span>Authorized Staff Access</span>
              </div>
              <h3 className="staff-title">Municipal Operations Portal</h3>
              <p className="staff-desc">
                Role-based console for long-range capital planning and 911 dispatch triage.
              </p>
            </div>

            {/* Segmented Tab Switcher between Planner and EMS */}
            <div className="staff-tabs">
              <button
                type="button"
                className={'staff-tab-btn ' + (staffTab === 'planner' ? 'active' : '')}
                onClick={() => setStaffTab('planner')}
              >
                <Building2 size={13} />
                <span>City Planning</span>
              </button>
              <button
                type="button"
                className={'staff-tab-btn ' + (staffTab === 'ems' ? 'active' : '')}
                onClick={() => setStaffTab('ems')}
              >
                <ShieldAlert size={13} />
                <span>911 / EMS</span>
              </button>
            </div>

            {/* PLANNER TAB */}
            {staffTab === 'planner' && (
              <div className="staff-tab-body">
                <div className="staff-context-note">
                  Census tract equity analytics, Heatwave War Room simulation, and tree canopy investment modeling.
                </div>

                {plannerError && (
                  <div className="portal-alert error" style={{ marginBottom: 10 }}>
                    <AlertCircle size={14} />
                    <span>{plannerError}</span>
                  </div>
                )}

                <form onSubmit={handlePlannerLogin}>
                  <div className="form-group">
                    <label className="input-label">Staff Username</label>
                    <input
                      type="text"
                      className="landing-input"
                      placeholder="planner_sarah"
                      value={plannerUsername}
                      onChange={(e) => setPlannerUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Password</label>
                    <input
                      type="password"
                      className="landing-input"
                      placeholder="••••••••?"
                      value={plannerPassword}
                      onChange={(e) => setPlannerPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={plannerLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 6 }}
                    id="btn-login-planner"
                  >
                    {plannerLoading ? 'Verifying Credentials...' : 'Sign In to Planning Console'}
                  </button>
                </form>

                <div className="sample-accounts-section">
                  <span className="sample-title">Quick Fill Authorized Accounts:</span>
                  <div className="sample-btns-col">
                    <button
                      type="button"
                      className="sample-row-btn"
                      onClick={() => { setPlannerUsername('planner_sarah'); setPlannerPassword('raleigh2026!'); }}
                    >
                      <span className="sample-user">planner_sarah</span>
                      <span className="sample-role">Sarah Jenkins (Climate Equity)</span>
                    </button>
                    <button
                      type="button"
                      className="sample-row-btn"
                      onClick={() => { setPlannerUsername('planner_marcus'); setPlannerPassword('heatshield!'); }}
                    >
                      <span className="sample-user">planner_marcus</span>
                      <span className="sample-role">Marcus Vance (Infrastructure)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EMS TAB */}
            {staffTab === 'ems' && (
              <div className="staff-tab-body">
                <div className="staff-context-note">
                  Emergency heat triage, paramedic mobile hydration unit dispatch, and field voice broadcast issuing.
                </div>

                {emsError && (
                  <div className="portal-alert error" style={{ marginBottom: 10 }}>
                    <AlertCircle size={14} />
                    <span>{emsError}</span>
                  </div>
                )}

                <form onSubmit={handleEmsLogin}>
                  <div className="form-group">
                    <label className="input-label">Operator ID</label>
                    <input
                      type="text"
                      className="landing-input"
                      placeholder="ems_dispatch"
                      value={emsUsername}
                      onChange={(e) => setEmsUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Terminal Password</label>
                    <input
                      type="password"
                      className="landing-input"
                      placeholder="••••••••?"
                      value={emsPassword}
                      onChange={(e) => setEmsPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emsLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 6 }}
                    id="btn-login-ems"
                  >
                    {emsLoading ? 'Connecting to CAD...' : 'Sign In to EMS Terminal'}
                  </button>
                </form>

                <div className="sample-accounts-section">
                  <span className="sample-title">Quick Fill Authorized Accounts:</span>
                  <div className="sample-btns-col">
                    <button
                      type="button"
                      className="sample-row-btn"
                      onClick={() => { setEmsUsername('ems_dispatch'); setEmsPassword('wake911!'); }}
                    >
                      <span className="sample-user">ems_dispatch</span>
                      <span className="sample-role">Dispatcher Ortiz (Wake 911)</span>
                    </button>
                    <button
                      type="button"
                      className="sample-row-btn"
                      onClick={() => { setEmsUsername('ems_captain_davis'); setEmsPassword('dispatch2026!'); }}
                    >
                      <span className="sample-user">ems_captain_davis</span>
                      <span className="sample-role">Capt. Ronald Davis (Heat Div)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

      </main>

      {/* Institutional Data Infrastructure Footnote */}
      <footer className="landing-footer-strip">
        <div className="footer-stat">
          <span className="footer-label">Telemetry Hypertable:</span>
          <span className="footer-val">Timescale Tiger Data (Active)</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Geospatial Cartography:</span>
          <span className="footer-val">Census TIGER/Line 2026 | OpenStreetMap Overpass</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Jurisdiction:</span>
          <span className="footer-val">City of Raleigh & Wake County Public Health</span>
        </div>
      </footer>
    </div>
  );
}
