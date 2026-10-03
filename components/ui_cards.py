import streamlit as st

def inject_custom_css():
    st.markdown("""
    <style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Command Center Header */
    .hero-banner {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px 28px;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(12px);
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(90deg, #60a5fa 0%, #38bdf8 40%, #f97316 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 6px;
        letter-spacing: -0.02em;
    }
    .hero-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
    }

    /* KPI Cards */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
    }
    .kpi-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 18px 20px;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
    }
    .kpi-card:hover {
        border-color: rgba(96, 165, 250, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }
    .kpi-label {
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #94a3b8;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .kpi-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.1;
        margin-bottom: 4px;
        font-family: 'JetBrains Mono', monospace;
    }
    .kpi-subtext {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 500;
    }

    /* Status Badges */
    .badge-critical {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.4);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-success {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-warning {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    /* Persona Selector Card */
    .persona-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        padding: 14px 18px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 14px;
    }

    /* Scenario HUD */
    .scenario-hud {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 14px;
        padding: 20px;
        margin-top: 15px;
        margin-bottom: 20px;
    }
    .scenario-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #60a5fa;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Clean Streamlit elements */
    div[data-testid="stSidebarNav"] {
        display: none;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px 8px 0 0;
        padding: 10px 18px;
        font-weight: 600;
    }
    </style>
    """, unsafe_allow_html=True)

def render_hero_banner(active_persona):
    st.markdown(f"""
    <div class="hero-banner">
        <div class="hero-title">Raleigh Climate Resilience & Urban Heat Decision Hub</div>
        <div class="hero-subtitle">
            Empowering municipal leaders to pinpoint urban heat islands, diagnose demographic vulnerability, measure walking reach to cooling infrastructure, and model targeted climate interventions in real time.
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_kpi_dashboard(kpis):
    c1, c2, c3, c4, c5 = st.columns(5)
    
    with c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">🚨 Critical Dead Zones</div>
            <div class="kpi-value" style="color: #ef4444;">{kpis.get('dead_zones_count', 0)}</div>
            <div class="kpi-subtext">High heat &gt;10 min walk</div>
        </div>
        """, unsafe_allow_html=True)
        
    with c2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">👥 Unserved Vulnerable</div>
            <div class="kpi-value" style="color: #f97316;">{kpis.get('unserved_vulnerable_pop', 0):,}</div>
            <div class="kpi-subtext">Low-income elders at risk</div>
        </div>
        """, unsafe_allow_html=True)
        
    with c3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">🌡️ Peak Surface Temp</div>
            <div class="kpi-value" style="color: #eab308;">{kpis.get('max_surface_temp', 0):.1f}°F</div>
            <div class="kpi-subtext">Avg: {kpis.get('avg_surface_temp', 0):.1f}°F across city</div>
        </div>
        """, unsafe_allow_html=True)
        
    with c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">🌳 Mean Tree Canopy</div>
            <div class="kpi-value" style="color: #10b981;">{kpis.get('avg_canopy_pct', 0):.1f}%</div>
            <div class="kpi-subtext">Target: &gt;40% municipal goal</div>
        </div>
        """, unsafe_allow_html=True)
        
    with c5:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">🏛️ Cooling Assets</div>
            <div class="kpi-value" style="color: #3b82f6;">{kpis.get('total_cooling_assets', 0)}</div>
            <div class="kpi-subtext">{kpis.get('indoor_cooling_assets', 0)} indoor A/C facilities</div>
        </div>
        """, unsafe_allow_html=True)

def render_scenario_impact_card(result):
    if not result:
        return
    
    cfg = result["config"]
    pct = result["pct_reduction"]
    newly = result["newly_served_vuln"]
    cost = result["est_cost_usd"]
    alleviated = result["alleviated_dead_zones"]
    
    st.markdown(f"""
    <div class="scenario-hud">
        <div class="scenario-title">
            🎯 Simulated Intervention Impact: <span style="color: #f8fafc;">{result['intervention_type']}</span>
        </div>
        <div style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 16px;">
            Location: <code>({result['lat']:.4f}, {result['lon']:.4f})</code> | 
            Catchment: <code>{cfg['radius_m']}m walk shed</code> | 
            Algorithm: <code>{'OSMnx Pedestrian Street Network' if result['is_network_derived'] else 'NC State Plane High-Precision Buffer'}</code>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border-left: 3px solid #10b981;">
                <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Protected Residents</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #34d399;">+{newly:,}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Previously unserved</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Dead Zones Alleviated</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #60a5fa;">{alleviated}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Upgraded to &lt;10m walk</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border-left: 3px solid #f97316;">
                <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Deficit Reduction</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #fb923c;">-{pct}%</div>
                <div style="font-size: 0.75rem; color: #64748b;">Citywide unserved relief</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; border-left: 3px solid #eab308;">
                <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Cost Efficiency</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #fde047;">${result['cost_per_person_served']}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Per person protected</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
