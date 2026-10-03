import os
import json
import streamlit as st
import geopandas as gpd
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

@st.cache_data(show_spinner=False)
def load_raleigh_boundary():
    path = os.path.join(DATA_DIR, "raleigh_boundary.geojson")
    if os.path.exists(path):
        return gpd.read_file(path)
    return None

@st.cache_data(show_spinner=False)
def load_census_tracts():
    path = os.path.join(DATA_DIR, "raleigh_census_tracts.geojson")
    if os.path.exists(path):
        gdf = gpd.read_file(path)
        # Ensure correct types
        gdf["heat_vulnerability_index"] = pd.to_numeric(gdf["heat_vulnerability_index"], errors="coerce")
        gdf["surface_temp_f"] = pd.to_numeric(gdf["surface_temp_f"], errors="coerce")
        gdf["canopy_cover_pct"] = pd.to_numeric(gdf["canopy_cover_pct"], errors="coerce")
        gdf["poverty_rate"] = pd.to_numeric(gdf["poverty_rate"], errors="coerce")
        gdf["pct_elderly"] = pd.to_numeric(gdf["pct_elderly"], errors="coerce")
        gdf["population"] = pd.to_numeric(gdf["population"], errors="coerce")
        gdf["vulnerable_pop_count"] = pd.to_numeric(gdf["vulnerable_pop_count"], errors="coerce")
        gdf["unserved_vulnerable_pop"] = pd.to_numeric(gdf["unserved_vulnerable_pop"], errors="coerce")
        gdf["dist_to_cooling_m"] = pd.to_numeric(gdf["dist_to_cooling_m"], errors="coerce")
        gdf["walk_time_min"] = pd.to_numeric(gdf["walk_time_min"], errors="coerce")
        gdf["is_dead_zone"] = gdf["is_dead_zone"].astype(bool)
        gdf["accessible_10min"] = gdf["accessible_10min"].astype(bool)
        return gdf
    return None

@st.cache_data(show_spinner=False)
def load_cooling_resources():
    path = os.path.join(DATA_DIR, "raleigh_cooling_resources.geojson")
    if os.path.exists(path):
        gdf = gpd.read_file(path)
        gdf["latitude"] = pd.to_numeric(gdf["latitude"], errors="coerce")
        gdf["longitude"] = pd.to_numeric(gdf["longitude"], errors="coerce")
        return gdf
    return None

def compute_city_kpis(tracts_gdf, resources_gdf):
    """Computes headline statistics for the citywide HUD."""
    if tracts_gdf is None or len(tracts_gdf) == 0:
        return {}
    
    total_pop = int(tracts_gdf["population"].sum())
    total_vuln = int(tracts_gdf["vulnerable_pop_count"].sum())
    dead_zones_count = int(tracts_gdf["is_dead_zone"].sum())
    unserved_vuln = int(tracts_gdf[tracts_gdf["is_dead_zone"]]["unserved_vulnerable_pop"].sum())
    
    avg_temp = round(float(tracts_gdf["surface_temp_f"].mean()), 1)
    max_temp = round(float(tracts_gdf["surface_temp_f"].max()), 1)
    avg_canopy = round(float(tracts_gdf["canopy_cover_pct"].mean()), 1)
    
    high_extreme_tracts = int((tracts_gdf["heat_vulnerability_index"] >= 55).sum())
    accessible_pct = round(float((tracts_gdf["accessible_10min"].sum() / len(tracts_gdf)) * 100.0), 1)
    
    resources_count = len(resources_gdf) if resources_gdf is not None else 0
    indoor_count = len(resources_gdf[resources_gdf["category"] == "Indoor A/C Refuge"]) if resources_gdf is not None else 0
    
    return {
        "total_population": total_pop,
        "vulnerable_population": total_vuln,
        "dead_zones_count": dead_zones_count,
        "unserved_vulnerable_pop": unserved_vuln,
        "avg_surface_temp": avg_temp,
        "max_surface_temp": max_temp,
        "avg_canopy_pct": avg_canopy,
        "high_extreme_tracts": high_extreme_tracts,
        "pct_tracts_accessible": accessible_pct,
        "total_cooling_assets": resources_count,
        "indoor_cooling_assets": indoor_count,
        "total_tracts": len(tracts_gdf)
    }
