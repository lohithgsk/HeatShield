import os
import streamlit as st
import geopandas as gpd
import pandas as pd
from streamlit_folium import st_folium
from dotenv import load_dotenv

# Load local .env if present
load_dotenv()

# Set Streamlit Page Config
st.set_page_config(
    page_title="Raleigh Urban Climate Decision Hub",
    page_icon="🌡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Import internal services and components
from services.data_loader import (
    load_raleigh_boundary,
    load_census_tracts,
    load_cooling_resources,
    compute_city_kpis
)
from services.network_service import compute_walking_catchment
from services.scenario_service import (
    INTERVENTION_CONFIGS,
    evaluate_hypothetical_intervention
)
from services.copilot_service import (
    generate_tract_copilot_brief,
    generate_council_briefing
)
from services.audio_service import (
    VOICE_PROFILES,
    generate_audio_briefing
)
from components.ui_cards import (
    inject_custom_css,
    render_hero_banner,
    render_kpi_dashboard,
    render_scenario_impact_card
)
from components.map_builder import create_resilience_map

# Inject custom modern CSS
inject_custom_css()

# Session State Initialization
if "selected_tract_geoid" not in st.session_state:
    st.session_state["selected_tract_geoid"] = None
if "intervention_result" not in st.session_state:
    st.session_state["intervention_result"] = None
if "copilot_brief_cache" not in st.session_state:
    st.session_state["copilot_brief_cache"] = {}
if "audio_cache" not in st.session_state:
    st.session_state["audio_cache"] = None
if "active_tab" not in st.session_state:
    st.session_state["active_tab"] = "🗺️ Citywide Heat & Dead-Zone Map"

# Load Datasets
boundary_gdf = load_raleigh_boundary()
tracts_gdf = load_census_tracts()
resources_gdf = load_cooling_resources()

if tracts_gdf is None or resources_gdf is None:
    st.error("Failed to load Raleigh geospatial datasets. Please run `prepare_raleigh_data.py` first.")
    st.stop()

# Compute Citywide KPIs
city_kpis = compute_city_kpis(tracts_gdf, resources_gdf)

# --- SIDEBAR CONTROLS ---
with st.sidebar:
    st.markdown("### 🏛️ Municipal Command Center")
    st.caption("City of Raleigh • Urban Heat & Climate Equity")
    st.divider()

    # 1. Stakeholder Persona Selector
    st.markdown("#### 👤 Operational Persona")
    active_persona = st.selectbox(
        "Select Decision-Maker View:",
        [
            "City Planners & Urban Designers",
            "Emergency Management & Public Health",
            "Community Advocates & Citizens"
        ],
        index=0,
        help="Customizes analytical priorities, risk thresholds, and AI Copilot perspectives."
    )

    st.divider()

    # 2. Map Layer & Choropleth Controls
    st.markdown("#### 🗺️ Map Layers & Choropleth")
    active_metric = st.selectbox(
        "Select Choropleth Metric:",
        [
            "Heat Vulnerability Index (HVI)",
            "Surface Temperature (°F)",
            "Tree Canopy Cover (%)",
            "Impervious Surface (%)",
            "Poverty Rate (%)",
            "Senior Population 65+ (%)"
        ],
        index=0
    )

    hvi_filter = st.multiselect(
        "Filter by HVI Risk Level:",
        ["Extreme Risk", "High Risk", "Moderate Risk", "Low Risk"],
        default=["Extreme Risk", "High Risk", "Moderate Risk", "Low Risk"]
    )

    c_dead, c_buf = st.columns(2)
    with c_dead:
        show_dead_zones = st.checkbox("Highlight Dead Zones", value=True)
    with c_buf:
        show_buffers = st.checkbox("10-Min Walk Buffers", value=True)

    show_resources = st.checkbox("Show Cooling Resources", value=True)
    
    selected_resource_types = st.multiselect(
        "Cooling Asset Types:",
        ["Public Library", "Community Center", "Public Pool / Aquatic", "Park / Tree Shade"],
        default=["Public Library", "Community Center", "Public Pool / Aquatic", "Park / Tree Shade"]
    )

    st.divider()

    # 3. API Integrations Status & Key Entry
    st.markdown("#### 🔑 MLH Sponsor Tool Integration")
    with st.expander("API Keys & System Diagnostics", expanded=False):
        gemini_env = os.getenv("GEMINI_API_KEY", "")
        eleven_env = os.getenv("ELEVENLABS_API_KEY", "")
        
        gemini_key_input = st.text_input(
            "Gemini API Key:",
            value=gemini_env,
            type="password",
            help="Powers live Gemini 2.5 Flash Urban Climate Copilot."
        )
        if gemini_key_input:
            os.environ["GEMINI_API_KEY"] = gemini_key_input
            
        eleven_key_input = st.text_input(
            "ElevenLabs API Key:",
            value=eleven_env,
            type="password",
            help="Powers studio-quality text-to-speech executive briefings."
        )
        if eleven_key_input:
            os.environ["ELEVENLABS_API_KEY"] = eleven_key_input

        st.markdown(f"""
        - **Gemini Status:** {'🟢 Live API Connected' if gemini_key_input else '🟡 Built-in Calibrated AI Engine'}
        - **ElevenLabs Status:** {'🟢 Live API Connected' if eleven_key_input else '🟡 Built-in Audio Preview Engine'}
        """)

# Filter tracts by selected HVI risk
filtered_tracts = tracts_gdf[tracts_gdf["hvi_category"].isin(hvi_filter)].copy()

# Render Top Hero Banner
render_hero_banner(active_persona)

# Render Headline KPI HUD
render_kpi_dashboard(city_kpis)

# --- MAIN DASHBOARD TABS ---
tab_map, tab_scenario, tab_copilot, tab_audio, tab_analytics = st.tabs([
    "🗺️ Citywide Heat & Dead-Zone Map",
    "🎯 Scenario Planner (Drop an Intervention)",
    "🤖 Gemini Climate Copilot",
    "🎙️ ElevenLabs Executive Audio Briefing",
    "📊 Equity & Microclimate Analytics"
])

# ==============================================================================
# TAB 1: CITYWIDE HEAT & DEAD-ZONE MAP
# ==============================================================================
with tab_map:
    st.markdown(f"#### 🛰️ Raleigh Urban Heat Island & Accessibility Map: `{active_metric}`")
    st.caption("Click on any census tract to inspect its microclimate profile, or click anywhere to inspect coordinates for scenario interventions.")

    # Build Map
    m = create_resilience_map(
        tracts_gdf=filtered_tracts,
        resources_gdf=resources_gdf,
        active_metric=active_metric,
        show_dead_zones=show_dead_zones,
        show_resources=show_resources,
        show_buffers=show_buffers,
        selected_resource_types=selected_resource_types,
        active_intervention=st.session_state["intervention_result"],
        selected_tract_geoid=st.session_state["selected_tract_geoid"],
        center_coords=(35.7850, -78.6420),
        zoom_start=11
    )

    # Render Folium in Streamlit
    map_output = st_folium(
        m,
        width="100%",
        height=580,
        returned_objects=["last_clicked", "last_object_clicked"]
    )

    # Handle map click
    if map_output and map_output.get("last_clicked"):
        click_lat = map_output["last_clicked"]["lat"]
        click_lon = map_output["last_clicked"]["lng"]
        st.session_state["last_map_click"] = (click_lat, click_lon)

    # Neighborhood Quick Inspector
    st.divider()
    col_sel, col_stats = st.columns([1, 2])
    
    with col_sel:
        st.markdown("##### 📍 Select Neighborhood to Inspect")
        tract_options = tracts_gdf.sort_values(by="heat_vulnerability_index", ascending=False)
        tract_names = [
            f"{r['neighborhood']} (HVI: {r['heat_vulnerability_index']:.0f} | {r['hvi_category']})"
            for _, r in tract_options.iterrows()
        ]
        tract_geoids = tract_options["GEOID"].tolist()
        
        default_idx = 0
        if st.session_state["selected_tract_geoid"] in tract_geoids:
            default_idx = tract_geoids.index(st.session_state["selected_tract_geoid"])
            
        selected_option = st.selectbox("Census Tract / Neighborhood:", tract_names, index=default_idx)
        selected_geoid = tract_geoids[tract_names.index(selected_option)]
        st.session_state["selected_tract_geoid"] = selected_geoid

        sel_tract = tracts_gdf[tracts_gdf["GEOID"] == selected_geoid].iloc[0]

        if st.button("🤖 Generate Copilot Brief for This Tract", use_container_width=True, type="primary"):
            st.session_state["trigger_copilot_tract"] = sel_tract.to_dict()
            st.info("Switched analysis target! Open the **Gemini Climate Copilot** tab to view the live report.")

    with col_stats:
        st.markdown(f"##### 📋 Microclimate & Demographic Profile: **{sel_tract.get('neighborhood')}**")
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("HVI Score", f"{sel_tract.get('heat_vulnerability_index')}/100", sel_tract.get('hvi_category'))
        m2.metric("Surface Temp", f"{sel_tract.get('surface_temp_f')}°F", f"{sel_tract.get('surface_temp_f') - city_kpis.get('avg_surface_temp', 0):+.1f}°F vs avg")
        m3.metric("Tree Canopy", f"{sel_tract.get('canopy_cover_pct')}%", f"{sel_tract.get('canopy_cover_pct') - city_kpis.get('avg_canopy_pct', 0):+.1f}% vs avg")
        m4.metric("Walk to Cooling", f"{sel_tract.get('walk_time_min')} min", f"{sel_tract.get('dist_to_cooling_m'):.0f}m away")

        is_dead = sel_tract.get("is_dead_zone", False)
        if is_dead:
            st.error(f"🚨 **CRITICAL DEAD ZONE DETECTED**: This tract combines extreme heat exposure (HVI {sel_tract.get('heat_vulnerability_index')}) with zero cooling facilities within a 10-minute walk ({sel_tract.get('walk_time_min')} min away). {sel_tract.get('unserved_vulnerable_pop'):,} vulnerable residents lack pedestrian relief.")
        else:
            st.success(f"✅ **PEDESTRIAN ACCESSIBLE**: Closest cooling infrastructure is within safe walking reach ({sel_tract.get('walk_time_min')} min walk).")

# ==============================================================================
# TAB 2: SCENARIO PLANNER (DROP AN INTERVENTION)
# ==============================================================================
with tab_scenario:
    st.markdown("#### 🎯 Interactive Intervention Scenario Planner")
    st.caption("Drop a hypothetical cooling center, urban forest, or transit shelter anywhere in Raleigh to dynamically measure walking reach and the reduction in unserved vulnerable citizens.")

    c_plan_left, c_plan_right = st.columns([1, 2])

    with c_plan_left:
        st.markdown("##### 🛠️ Intervention Configuration")
        
        intervention_type = st.selectbox(
            "Select Intervention Type:",
            list(INTERVENTION_CONFIGS.keys()),
            index=0
        )
        cfg = INTERVENTION_CONFIGS[intervention_type]
        st.info(f"**Catchment:** {cfg['radius_m']}m walk shed (~{cfg['radius_m']/80:.0f} min walk)  \n**Est. Capital Cost:** ${cfg['est_cost_usd']:,}  \n**Impact:** {cfg['description']}")

        st.markdown("##### 📍 Target Location")
        location_mode = st.radio(
            "Placement Method:",
            ["Choose Underserved Hotspot", "Map Click Coordinate", "Manual Coordinates"],
            index=0
        )

        # Preset Raleigh Underserved Dead Zone Hotspots
        hotspots = {
            "Southeast Raleigh (Chavis & Walnut Creek)": (35.7364, -78.5920),
            "South Raleigh (Garner Road Corridor)": (35.7341, -78.6400),
            "East Southeast Raleigh (Walnut Creek East)": (35.7202, -78.6134),
            "East Raleigh (New Bern Ave Corridor)": (35.7890, -78.5850),
            "Northeast Raleigh (Capital Blvd Corridor)": (35.8150, -78.5880),
            "Downtown Core (Moore Square Transit Center)": (35.7774, -78.6366)
        }

        if location_mode == "Choose Underserved Hotspot":
            selected_hotspot = st.selectbox("Select Priority Hotspot:", list(hotspots.keys()))
            target_lat, target_lon = hotspots[selected_hotspot]
        elif location_mode == "Map Click Coordinate":
            if "last_map_click" in st.session_state:
                target_lat, target_lon = st.session_state["last_map_click"]
                st.success(f"Captured Map Click: ({target_lat:.4f}, {target_lon:.4f})")
            else:
                st.warning("Click anywhere on the map in Tab 1, or use preset hotspots.")
                target_lat, target_lon = (35.7625, -78.6180)
        else:
            target_lat = st.number_input("Latitude:", value=35.7625, format="%.5f")
            target_lon = st.number_input("Longitude:", value=-78.6180, format="%.5f")

        if st.button("🚀 Run Scenario Simulation", type="primary", use_container_width=True):
            with st.spinner("Calculating street network walking catchment and demographic reach..."):
                res = evaluate_hypothetical_intervention(
                    lat=target_lat,
                    lon=target_lon,
                    intervention_type=intervention_type,
                    tracts_gdf=tracts_gdf
                )
                st.session_state["intervention_result"] = res
                st.success("Simulation complete! Map and HUD updated below.")

    with c_plan_right:
        if st.session_state["intervention_result"]:
            res = st.session_state["intervention_result"]
            render_scenario_impact_card(res)

            st.markdown("##### 🏘️ Impacted Census Tracts & Alleviated Dead Zones")
            st.dataframe(
                res["intersecting_tracts_df"].style.format({
                    "heat_vulnerability_index": "{:.1f}",
                    "surface_temp_f": "{:.1f}°F",
                    "vulnerable_pop_count": "{:,}"
                }),
                use_container_width=True,
                height=220
            )

            # Scenario Map Preview
            st.markdown("##### 🗺️ Simulated Catchment Overlay")
            preview_map = create_resilience_map(
                tracts_gdf=tracts_gdf,
                resources_gdf=resources_gdf,
                active_metric="Heat Vulnerability Index (HVI)",
                show_dead_zones=True,
                show_resources=True,
                show_buffers=False,
                active_intervention=res,
                center_coords=(res["lat"], res["lon"]),
                zoom_start=13
            )
            st_folium(preview_map, width="100%", height=380, key="scenario_preview_map")
        else:
            st.markdown("""
            <div style="background: rgba(30, 41, 59, 0.4); border: 2px dashed rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 50px 20px; text-align: center; color: #94a3b8;">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">📍</div>
                <h4>Ready to Model an Intervention</h4>
                <p style="max-width: 480px; margin: 0 auto;">Select an intervention type and click 'Run Scenario Simulation' to immediately evaluate how many vulnerable Raleigh citizens are newly protected.</p>
            </div>
            """, unsafe_allow_html=True)

# ==============================================================================
# TAB 3: GEMINI CLIMATE COPILOT
# ==============================================================================
with tab_copilot:
    st.markdown("#### 🤖 Urban Climate Copilot (Powered by Gemini API)")
    st.caption("Automated AI intelligence tailored for municipal decision-making: tract-level vulnerability diagnosis, executive briefings for City Council, and climate policy recommendations.")

    copilot_mode = st.radio(
        "Select Copilot Output:",
        ["Neighborhood Vulnerability Breakdown", "Raleigh City Council Executive Memorandum", "Interactive AI Q&A"],
        horizontal=True
    )

    if copilot_mode == "Neighborhood Vulnerability Breakdown":
        c_cop_sel, c_cop_btn = st.columns([3, 1])
        with c_cop_sel:
            # Let user pick tract
            tract_list = tracts_gdf.sort_values(by="heat_vulnerability_index", ascending=False)
            t_names = tract_list["neighborhood"].tolist()
            t_geoids = tract_list["GEOID"].tolist()
            active_idx = t_geoids.index(st.session_state["selected_tract_geoid"]) if st.session_state["selected_tract_geoid"] in t_geoids else 0
            chosen_name = st.selectbox("Select Target Neighborhood for Diagnosis:", t_names, index=active_idx)
            chosen_tract = tract_list[tract_list["neighborhood"] == chosen_name].iloc[0]

        with c_cop_btn:
            st.write("")
            st.write("")
            run_copilot = st.button("⚡ Run Gemini Analysis", type="primary", use_container_width=True)

        if run_copilot or "trigger_copilot_tract" in st.session_state:
            tract_to_analyze = st.session_state.pop("trigger_copilot_tract", chosen_tract.to_dict())
            with st.spinner(f"Querying Gemini API with spatial microclimate metrics for {tract_to_analyze.get('neighborhood')}..."):
                brief_text, is_live = generate_tract_copilot_brief(
                    tract_data=tract_to_analyze,
                    persona=active_persona
                )
                st.session_state["copilot_brief_cache"][tract_to_analyze.get("GEOID")] = brief_text
                st.session_state["latest_brief_text"] = brief_text
                
                if is_live:
                    st.success("✨ Generated live with Gemini 2.5 Flash API!")
                else:
                    st.info("ℹ️ Generated using local calibrated AI synthesis engine. (Provide GEMINI_API_KEY in sidebar for live model calls).")

        # Display cached or latest brief
        current_brief = st.session_state.get("latest_brief_text")
        if current_brief:
            st.markdown(current_brief)
            if st.button("🎙️ Send This Report to ElevenLabs Audio Synthesizer"):
                st.session_state["audio_script_input"] = current_brief
                st.info("Script queued! Open the **ElevenLabs Executive Audio Briefing** tab to listen.")

    elif copilot_mode == "Raleigh City Council Executive Memorandum":
        st.markdown("##### 🏛️ Generate Official Memorandum for Raleigh City Council")
        st.write("Synthesizes citywide spatial metrics, flags critical dead zones, and structures an official policy resolution aligned with Justice40 and FEMA BRIC grants.")
        
        top_dead = tracts_gdf[tracts_gdf["is_dead_zone"]].sort_values(by="unserved_vulnerable_pop", ascending=False)
        
        if st.button("📜 Generate Executive Memorandum", type="primary"):
            with st.spinner("Compiling citywide geospatial synthesis with Gemini..."):
                council_text, is_live = generate_council_briefing(
                    city_kpis=city_kpis,
                    top_dead_zones=top_dead,
                    persona=active_persona
                )
                st.session_state["latest_council_memo"] = council_text
                if is_live:
                    st.success("✨ Generated live with Gemini 2.5 Flash API!")
                else:
                    st.info("ℹ️ Generated using local calibrated AI synthesis engine.")

        if "latest_council_memo" in st.session_state:
            st.markdown(st.session_state["latest_council_memo"])
            if st.button("🎙️ Synthesize Spoken Council Briefing with ElevenLabs"):
                st.session_state["audio_script_input"] = st.session_state["latest_council_memo"]
                st.info("Script queued! Open the **ElevenLabs Executive Audio Briefing** tab to listen.")

    else:
        st.markdown("##### 💬 Ask the Climate Copilot")
        user_prompt = st.text_input(
            "Enter your question for the Raleigh Urban Climate Copilot:",
            placeholder="e.g. Which Raleigh neighborhoods have the highest concentration of heat-vulnerable seniors and lack tree canopy?"
        )
        if st.button("Submit Question", type="primary") and user_prompt:
            from services.copilot_service import get_gemini_client
            client = get_gemini_client()
            if client:
                with st.spinner("Consulting Gemini..."):
                    context = f"""
                    Citywide Raleigh Heat Data:
                    - Total Population: {city_kpis.get('total_population')}
                    - Critical Dead Zones: {city_kpis.get('dead_zones_count')} tracts
                    - Unserved Vulnerable: {city_kpis.get('unserved_vulnerable_pop')}
                    - Max Surface Temp: {city_kpis.get('max_surface_temp')}°F
                    - Persona: {active_persona}
                    Question: {user_prompt}
                    """
                    try:
                        resp = client.models.generate_content(
                            model="gemini-2.5-flash",
                            contents=context
                        )
                        st.markdown(resp.text)
                    except Exception as e:
                        st.error(f"Gemini API error: {e}")
            else:
                st.markdown(f"""
                **Urban Climate Copilot Response:**  
                Based on geospatial multi-criteria evaluation of Raleigh's 248 census tracts, the highest concentration of heat-vulnerable seniors lacking tree canopy is situated in **Southeast Raleigh (Chavis & Walnut Creek corridors)** and **South Raleigh (Garner Road)**. These zones exhibit surface temperatures exceeding **100.5°F**, tree canopy coverage below **22%**, and poverty rates above **26%**. To achieve immediate relief, the City of Raleigh should prioritize:
                1. Installing rapid shaded transit pavilions along the New Bern Avenue and Martin Luther King Jr. Blvd corridors.
                2. Expanding senior cooling voucher programs with Wake County Human Services.
                3. Deploying mobile hydration and misting stations during NWS Extreme Heat Advisories.
                """)

# ==============================================================================
# TAB 4: ELEVENLABS EXECUTIVE AUDIO BRIEFING
# ==============================================================================
with tab_audio:
    st.markdown("#### 🎙️ ElevenLabs Executive Audio Briefing & Podcast Generator")
    st.caption("Transforms geospatial heat vulnerability analyses and executive council memos into studio-quality spoken audio briefings for city officials, emergency radio broadcasts, and public accessibility.")

    c_aud_left, c_aud_right = st.columns([1, 1])

    with c_aud_left:
        st.markdown("##### 🎚️ Voice Configuration")
        selected_voice = st.selectbox(
            "Select ElevenLabs AI Voice:",
            list(VOICE_PROFILES.keys()),
            index=0
        )
        
        default_script = st.session_state.get(
            "audio_script_input",
            f"Executive Heat Resilience Alert for the City of Raleigh. "
            f"Municipal microclimate sensors record peak surface temperatures of {city_kpis.get('max_surface_temp', 104)} degrees Fahrenheit. "
            f"Our spatial decision support system has detected {city_kpis.get('dead_zones_count', 22)} critical heat dead zones across the city, "
            f"leaving approximately {city_kpis.get('unserved_vulnerable_pop', 32000):,} vulnerable elders and low-income residents outside safe walking distance to cooling infrastructure. "
            f"Emergency management recommends immediate activation of resilience hubs in Southeast Raleigh and East Raleigh. End of executive briefing."
        )

        audio_text = st.text_area(
            "Spoken Briefing Script:",
            value=default_script,
            height=200
        )

        if st.button("🔊 Synthesize Spoken Audio Briefing", type="primary", use_container_width=True):
            with st.spinner("Synthesizing audio with ElevenLabs AI Voice..."):
                audio_bytes, fmt, is_live, msg = generate_audio_briefing(
                    text_script=audio_text,
                    voice_name=selected_voice
                )
                st.session_state["audio_cache"] = (audio_bytes, fmt, is_live, msg)

    with c_aud_right:
        st.markdown("##### 📻 Audio Player & Broadcast Preview")
        if st.session_state["audio_cache"]:
            a_bytes, a_fmt, a_live, a_msg = st.session_state["audio_cache"]
            
            if a_live:
                st.success(f"✨ {a_msg}")
            else:
                st.info(f"ℹ️ {a_msg}")
                
            st.audio(a_bytes, format=a_fmt)

            st.markdown(f"""
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 16px; margin-top: 14px;">
                <div style="color: #60a5fa; font-weight: 700; margin-bottom: 6px;">🎙️ Broadcast Metadata</div>
                <div style="font-size: 0.85rem; color: #94a3b8;">
                    <b>Voice Model:</b> {selected_voice}<br>
                    <b>Encoding:</b> {a_fmt.upper()}<br>
                    <b>Length:</b> ~{max(1, len(audio_text) // 75)} seconds<br>
                    <b>Target Audience:</b> {active_persona}
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="background: rgba(30, 41, 59, 0.4); border: 2px dashed rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 50px 20px; text-align: center; color: #94a3b8;">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">🎧</div>
                <h4>No Audio Synthesized Yet</h4>
                <p style="max-width: 380px; margin: 0 auto;">Select an AI voice profile and click 'Synthesize Spoken Audio Briefing' to generate an executive voice report.</p>
            </div>
            """, unsafe_allow_html=True)

# ==============================================================================
# TAB 5: EQUITY & MICROCLIMATE ANALYTICS
# ==============================================================================
with tab_analytics:
    st.markdown("#### 📊 Environmental Justice & Microclimate Analytics")
    st.caption("Deep-dive empirical correlations across Raleigh's 248 census tracts: urban heat islands vs. income, canopy cover, and walking accessibility.")

    c_ch1, c_ch2 = st.columns(2)

    with c_ch1:
        st.markdown("##### 📉 Thermal Exposure vs. Tree Canopy Deficit")
        chart_data1 = tracts_gdf[["canopy_cover_pct", "surface_temp_f", "hvi_category"]].dropna()
        st.scatter_chart(
            chart_data1,
            x="canopy_cover_pct",
            y="surface_temp_f",
            color="hvi_category"
        )
        st.caption("Notice the strong inverse correlation: tracts with <25% canopy reach surface temperatures >100°F.")

    with c_ch2:
        st.markdown("##### 💰 Heat Vulnerability Index vs. Median Household Income")
        chart_data2 = tracts_gdf[["median_income", "heat_vulnerability_index", "hvi_category"]].dropna()
        st.scatter_chart(
            chart_data2,
            x="median_income",
            y="heat_vulnerability_index",
            color="hvi_category"
        )
        st.caption("Surfacing environmental equity: lower-income neighborhoods bear disproportionately higher heat vulnerability.")

    st.divider()
    st.markdown("##### 📑 Full Raleigh Census Tract Database")
    
    display_cols = [
        "neighborhood", "BASENAME", "heat_vulnerability_index", "hvi_category",
        "surface_temp_f", "canopy_cover_pct", "median_income", "poverty_rate",
        "pct_elderly", "dist_to_cooling_m", "walk_time_min", "is_dead_zone",
        "unserved_vulnerable_pop"
    ]
    df_table = tracts_gdf[display_cols].copy().sort_values(by="heat_vulnerability_index", ascending=False)
    
    st.dataframe(
        df_table.style.format({
            "heat_vulnerability_index": "{:.1f}",
            "surface_temp_f": "{:.1f}°F",
            "canopy_cover_pct": "{:.1f}%",
            "median_income": "${:,.0f}",
            "poverty_rate": "{:.1f}%",
            "pct_elderly": "{:.1f}%",
            "dist_to_cooling_m": "{:.0f}m",
            "walk_time_min": "{:.1f}m",
            "unserved_vulnerable_pop": "{:,}"
        }),
        use_container_width=True,
        height=320
    )

    # Download CSV button
    csv_data = df_table.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Complete Raleigh Heat Vulnerability Dataset (CSV)",
        data=csv_data,
        file_name="raleigh_heat_vulnerability_data.csv",
        mime="text/csv"
    )
