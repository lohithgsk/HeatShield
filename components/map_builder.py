import folium
from folium import plugins
import branca.colormap as cm
import json
import geopandas as gpd

def create_resilience_map(
    tracts_gdf,
    resources_gdf,
    active_metric="Heat Vulnerability Index (HVI)",
    show_dead_zones=True,
    show_resources=True,
    show_buffers=True,
    selected_resource_types=None,
    active_intervention=None,
    selected_tract_geoid=None,
    center_coords=(35.7796, -78.6382),
    zoom_start=11
):
    """
    Builds a Folium interactive map for Raleigh.
    """
    m = folium.Map(
        location=center_coords,
        zoom_start=zoom_start,
        tiles="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attr='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        name="Dark Matter",
        control_scale=True,
        prefer_canvas=True
    )
    
    # Optional tile layers
    folium.TileLayer(
        tiles="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attr='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        name="Light Positron"
    ).add_to(m)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri World Imagery",
        name="Satellite Imagery"
    ).add_to(m)
    folium.TileLayer(
        tiles="OpenStreetMap",
        name="OpenStreetMap Standard"
    ).add_to(m)

    # 1. Metric Color Map Setup
    metric_cols = {
        "Heat Vulnerability Index (HVI)": ("heat_vulnerability_index", ["#10b981", "#eab308", "#f97316", "#ef4444"], 20, 95, "HVI Score (0-100)"),
        "Surface Temperature (°F)": ("surface_temp_f", ["#3b82f6", "#10b981", "#fbbf24", "#f97316", "#ef4444"], 88, 104, "Surface Temp (°F)"),
        "Tree Canopy Cover (%)": ("canopy_cover_pct", ["#ef4444", "#f59e0b", "#84cc16", "#10b981", "#047857"], 10, 65, "Canopy Cover (%)"),
        "Impervious Surface (%)": ("impervious_pct", ["#10b981", "#facc15", "#f97316", "#dc2626"], 20, 85, "Impervious Surface (%)"),
        "Poverty Rate (%)": ("poverty_rate", ["#6ee7b7", "#fef08a", "#f97316", "#b91c1c"], 5, 38, "Poverty Rate (%)"),
        "Senior Population 65+ (%)": ("pct_elderly", ["#93c5fd", "#c4b5fd", "#f472b6", "#e11d48"], 6, 28, "Senior Pop (%)")
    }

    col_name, colors, vmin, vmax, legend_title = metric_cols.get(
        active_metric, metric_cols["Heat Vulnerability Index (HVI)"]
    )
    colormap = cm.LinearColormap(colors=colors, vmin=vmin, vmax=vmax, caption=legend_title)
    colormap.add_to(m)

    # 2. Census Tract Choropleth Layer
    if tracts_gdf is not None and len(tracts_gdf) > 0:
        tract_feature_group = folium.FeatureGroup(name="Census Tracts Vulnerability", show=True)
        
        for _, row in tracts_gdf.iterrows():
            val = row.get(col_name, vmin)
            color = colormap(val) if val is not None and not (isinstance(val, float) and val != val) else "#64748b"
            is_dead = row.get("is_dead_zone", False)
            geoid = row.get("GEOID", "")
            is_selected = (geoid == selected_tract_geoid)
            
            # Highlight border
            if is_selected:
                weight = 3.5
                border_color = "#38bdf8"
                fill_opacity = 0.85
            elif is_dead and show_dead_zones:
                weight = 2.2
                border_color = "#ef4444"
                fill_opacity = 0.68
            else:
                weight = 1.0
                border_color = "#334155"
                fill_opacity = 0.55
                
            popup_html = f"""
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 210px; color: #0f172a; padding: 4px;">
                <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
                    {row.get('neighborhood', 'Raleigh Tract')}
                </h4>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">GEOID: {geoid} | Tract: {row.get('BASENAME')}</div>
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <tr><td style="padding: 2px 0;"><b>HVI Score:</b></td><td style="text-align: right; color: #b91c1c;"><b>{row.get('heat_vulnerability_index', 'N/A')}/100</b></td></tr>
                    <tr><td style="padding: 2px 0;"><b>Risk Level:</b></td><td style="text-align: right;">{row.get('hvi_category', 'N/A')}</td></tr>
                    <tr><td style="padding: 2px 0;"><b>Surface Temp:</b></td><td style="text-align: right;">{row.get('surface_temp_f', 'N/A')}°F</td></tr>
                    <tr><td style="padding: 2px 0;"><b>Tree Canopy:</b></td><td style="text-align: right;">{row.get('canopy_cover_pct', 'N/A')}%</td></tr>
                    <tr><td style="padding: 2px 0;"><b>Poverty Rate:</b></td><td style="text-align: right;">{row.get('poverty_rate', 'N/A')}%</td></tr>
                    <tr><td style="padding: 2px 0;"><b>Elderly (65+):</b></td><td style="text-align: right;">{row.get('pct_elderly', 'N/A')}%</td></tr>
                    <tr><td style="padding: 2px 0;"><b>Walk to Cooling:</b></td><td style="text-align: right;">{row.get('dist_to_cooling_m', 'N/A')}m ({row.get('walk_time_min', 'N/A')}m)</td></tr>
                </table>
                <div style="margin-top: 8px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: {'#fee2e2; color: #dc2626;' if is_dead else '#dcfce7; color: #16a34a;'}">
                        {'⚠️ CRITICAL DEAD ZONE' if is_dead else '✅ Accessible (&lt;10 min walk)'}
                    </span>
                </div>
            </div>
            """

            folium.GeoJson(
                row.geometry.__geo_interface__,
                style_function=lambda x, c=color, w=weight, bc=border_color, fo=fill_opacity: {
                    "fillColor": c,
                    "color": bc,
                    "weight": w,
                    "fillOpacity": fo
                },
                highlight_function=lambda x: {
                    "fillOpacity": 0.9,
                    "weight": 3.0,
                    "color": "#38bdf8"
                },
                tooltip=f"<b>{row.get('neighborhood')}</b><br>HVI: {row.get('heat_vulnerability_index')}/100 | Temp: {row.get('surface_temp_f')}°F",
                popup=folium.Popup(popup_html, max_width=280)
            ).add_to(tract_feature_group)
            
        tract_feature_group.add_to(m)

    # 3. Cooling Resources Layer & 10-Minute Walk Buffers
    if resources_gdf is not None and len(resources_gdf) > 0 and show_resources:
        res_group = folium.FeatureGroup(name="Cooling Resources", show=True)
        buf_group = folium.FeatureGroup(name="10-Minute Walk Catchment (800m)", show=show_buffers)
        
        # Color mapping by resource category
        res_style = {
            "Public Library": {"color": "#3b82f6", "icon": "book", "prefix": "fa"},
            "Community Center": {"color": "#8b5cf6", "icon": "users", "prefix": "fa"},
            "Public Pool / Aquatic": {"color": "#06b6d4", "icon": "tint", "prefix": "fa"},
            "Park / Tree Shade": {"color": "#10b981", "icon": "tree", "prefix": "fa"}
        }

        # Filter by selected types if specified
        active_types = selected_resource_types or list(res_style.keys())
        filtered_res = resources_gdf[resources_gdf["type"].isin(active_types)]
        
        # Limit markers rendered if very dense to keep UI lightning fast
        sample_res = filtered_res.head(250)

        for _, res in sample_res.iterrows():
            lat = res.get("latitude")
            lon = res.get("longitude")
            if lat is None or lon is None or (isinstance(lat, float) and lat != lat):
                continue
                
            r_type = res.get("type", "Cooling Asset")
            style = res_style.get(r_type, {"color": "#64748b", "icon": "info-circle", "prefix": "fa"})
            
            # Add 800m pedestrian walk buffer (~10 min walk)
            if show_buffers:
                folium.Circle(
                    location=[lat, lon],
                    radius=800,
                    color=style["color"],
                    weight=0.8,
                    fill=True,
                    fill_color=style["color"],
                    fill_opacity=0.07,
                    dash_array="4, 6"
                ).add_to(buf_group)

            # Marker Popup
            r_popup = f"""
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px; padding: 4px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 13px;">{res.get('name', 'Cooling Resource')}</div>
                <div style="color: {style['color']}; font-size: 12px; font-weight: 600; margin: 2px 0;">{r_type}</div>
                <div style="font-size: 11px; color: #475569;">Category: {res.get('category', 'Indoor A/C')}</div>
                <div style="font-size: 11px; color: #475569;">Cooling Tier: <b>{res.get('cooling_capacity', 'Standard')}</b></div>
                <div style="margin-top: 6px; font-size: 10px; color: #10b981;">🛡️ 10-Min Pedestrian Refuge Zone</div>
            </div>
            """
            
            # Small circle marker for clean GIS performance
            folium.CircleMarker(
                location=[lat, lon],
                radius=5,
                color=style["color"],
                weight=1.5,
                fill=True,
                fill_color=style["color"],
                fill_opacity=0.9,
                tooltip=f"{res.get('name')} ({r_type})",
                popup=folium.Popup(r_popup, max_width=260)
            ).add_to(res_group)

        if show_buffers:
            buf_group.add_to(m)
        res_group.add_to(m)

    # 4. Active Hypothetical Intervention (Scenario Tool)
    if active_intervention is not None:
        int_group = folium.FeatureGroup(name="Proposed Intervention Scenario", show=True)
        i_lat = active_intervention["lat"]
        i_lon = active_intervention["lon"]
        i_type = active_intervention["intervention_type"]
        i_cfg = active_intervention["config"]
        c_geom = active_intervention["catchment_geom"]
        
        # Add catchment polygon
        folium.GeoJson(
            c_geom.__geo_interface__,
            style_function=lambda x, c=i_cfg["color"]: {
                "fillColor": c,
                "color": c,
                "weight": 2.5,
                "fillOpacity": 0.28,
                "dashArray": "5, 5"
            },
            tooltip=f"Proposed {i_type} Catchment ({i_cfg['radius_m']}m reach)"
        ).add_to(int_group)
        
        # Add beacon marker
        folium.Marker(
            location=[i_lat, i_lon],
            icon=folium.Icon(color="red", icon="star", prefix="fa"),
            tooltip=f"⭐ PROPOSED INTERVENTION: {i_type}",
            popup=f"""
            <div style="font-family: sans-serif; min-width: 180px;">
                <h4 style="margin: 0; color: #dc2626;">⭐ {i_type}</h4>
                <p style="margin: 4px 0; font-size: 12px;">{i_cfg['description']}</p>
                <div style="font-size: 12px; color: #16a34a; font-weight: bold;">
                    +{active_intervention['newly_served_vuln']:,} Residents Protected
                </div>
            </div>
            """
        ).add_to(int_group)
        
        int_group.add_to(m)

    folium.LayerControl(position="topright", collapsed=True).add_to(m)
    plugins.Fullscreen(position="topleft").add_to(m)
    
    return m
