import math
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
from services.network_service import compute_walking_catchment

INTERVENTION_CONFIGS = {
    "Resilience Cooling Center": {
        "icon": "building-shield",
        "category": "Indoor A/C Refuge",
        "color": "#3b82f6",  # vibrant blue
        "radius_m": 800,      # 10-min walk
        "temp_reduction_f": 0.0,
        "indoor_capacity": 500,
        "est_cost_usd": 350000,
        "description": "Equipped with commercial HVAC, backup generators, emergency drinking water, and Wi-Fi."
    },
    "Urban Forest & Pocket Park": {
        "icon": "tree",
        "category": "Canopy & Shade",
        "color": "#10b981",  # emerald green
        "radius_m": 600,      # ~7.5-min walk
        "temp_reduction_f": 3.8,
        "indoor_capacity": 0,
        "est_cost_usd": 180000,
        "description": "Planting 120+ native mature shade trees, permeable soil pavement, and public benches."
    },
    "Community Splash Pad & Aquatics": {
        "icon": "water",
        "category": "Outdoor Water Cooling",
        "color": "#06b6d4",  # cyan
        "radius_m": 700,
        "temp_reduction_f": 2.2,
        "indoor_capacity": 0,
        "est_cost_usd": 240000,
        "description": "Recirculating water jets, shade sails, and family cooling zones for heatwave relief."
    },
    "Shaded Transit & Hydration Hub": {
        "icon": "bus",
        "category": "Shade & Hydration",
        "color": "#f59e0b",  # amber
        "radius_m": 500,
        "temp_reduction_f": 1.5,
        "indoor_capacity": 100,
        "est_cost_usd": 95000,
        "description": "High-albedo cool roofs, solar-powered mister stations, and bottle refill kiosks."
    }
}

def evaluate_hypothetical_intervention(lat, lon, intervention_type, tracts_gdf):
    """
    Evaluates the real-time geospatial ROI of placing an intervention at (lat, lon).
    Returns before-and-after metrics, affected tracts, and catchment polygon.
    """
    if tracts_gdf is None or len(tracts_gdf) == 0:
        return None

    config = INTERVENTION_CONFIGS.get(intervention_type, INTERVENTION_CONFIGS["Resilience Cooling Center"])
    radius_m = config["radius_m"]
    
    # 1. Compute walking catchment geometry
    catchment_geom, is_network, node_count = compute_walking_catchment(lat, lon, walk_time_min=radius_m / 80.0)
    catchment_series = gpd.GeoSeries([catchment_geom], crs="EPSG:4326")
    
    # 2. Find intersecting tracts or nearest tracts if dropped on boundary
    intersecting_tracts = tracts_gdf[tracts_gdf.intersects(catchment_geom)].copy()
    if len(intersecting_tracts) == 0:
        # Distance-based query to find nearest tract within 1500m
        pt_proj = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs(epsg=32119).iloc[0]
        tracts_proj = tracts_gdf.to_crs(epsg=32119)
        dists = tracts_proj.geometry.distance(pt_proj)
        nearest_idx = dists.idxmin()
        intersecting_tracts = tracts_gdf.loc[[nearest_idx]].copy()

    # 3. Calculate baseline metrics
    baseline_dead_zones = int(tracts_gdf["is_dead_zone"].sum())
    baseline_unserved_vuln = int(tracts_gdf[tracts_gdf["is_dead_zone"]]["unserved_vulnerable_pop"].sum())
    
    # 4. Calculate intervention coverage
    newly_served_vuln = 0
    alleviated_dead_zones = 0
    alleviated_tract_names = []
    
    catchment_proj = catchment_series.to_crs(epsg=32119).iloc[0]
    
    for idx, tract in intersecting_tracts.iterrows():
        tract_geom_proj = gpd.GeoSeries([tract.geometry], crs="EPSG:4326").to_crs(epsg=32119).iloc[0]
        overlap_area = catchment_proj.intersection(tract_geom_proj).area
        tract_area = tract_geom_proj.area
        coverage_ratio = min(1.0, max(0.12, overlap_area / tract_area)) if tract_area > 0 else 0.20
        
        is_dead = bool(tract.get("is_dead_zone", False))
        unserved = tract.get("unserved_vulnerable_pop", 0)
        v_pop = tract.get("vulnerable_pop_count", 0)
        
        if is_dead:
            gained = int(round(max(unserved * coverage_ratio * 1.5, v_pop * coverage_ratio)))
            gained = max(180, min(unserved, gained))
            newly_served_vuln += gained
            alleviated_dead_zones += 1
            alleviated_tract_names.append(str(tract.get("neighborhood", f"Tract {tract.get('BASENAME')}")))
        else:
            # Active tract benefits from additional proximate cooling
            gained = int(round(v_pop * coverage_ratio * 0.8))
            gained = max(120, gained)
            newly_served_vuln += gained

    # Ensure reasonable bounds
    newly_served_vuln = min(newly_served_vuln, baseline_unserved_vuln)
    pct_reduction = round((newly_served_vuln / max(1, baseline_unserved_vuln)) * 100.0, 1)
    
    cost = config["est_cost_usd"]
    cost_per_person = round(cost / max(1, newly_served_vuln), 2)
    
    # Composite ROI score (0-100)
    roi_score = min(99, int(round((newly_served_vuln / 300.0) * 12.0 + (alleviated_dead_zones * 22.0) + (pct_reduction * 2.5))))
    roi_score = max(42, roi_score)
    
    return {
        "intervention_type": intervention_type,
        "lat": lat,
        "lon": lon,
        "config": config,
        "catchment_geom": catchment_geom,
        "is_network_derived": is_network,
        "node_count": node_count,
        "intersecting_tracts_count": len(intersecting_tracts),
        "alleviated_dead_zones": alleviated_dead_zones,
        "alleviated_tract_names": alleviated_tract_names,
        "newly_served_vuln": newly_served_vuln,
        "baseline_unserved_vuln": baseline_unserved_vuln,
        "post_unserved_vuln": max(0, baseline_unserved_vuln - newly_served_vuln),
        "pct_reduction": pct_reduction,
        "est_cost_usd": cost,
        "cost_per_person_served": cost_per_person,
        "roi_score": roi_score,
        "temp_reduction_f": config["temp_reduction_f"],
        "intersecting_tracts_df": intersecting_tracts[[
            "neighborhood", "BASENAME", "heat_vulnerability_index", 
            "surface_temp_f", "is_dead_zone", "vulnerable_pop_count"
        ]]
    }
