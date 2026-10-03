import sys
from services.data_loader import load_raleigh_boundary, load_census_tracts, load_cooling_resources, compute_city_kpis
from services.scenario_service import evaluate_hypothetical_intervention, INTERVENTION_CONFIGS
from services.copilot_service import generate_tract_copilot_brief, generate_council_briefing
from services.audio_service import generate_audio_briefing, VOICE_PROFILES
from components.map_builder import create_resilience_map

print("=== 1. Testing Data Loading ===")
b_gdf = load_raleigh_boundary()
t_gdf = load_census_tracts()
r_gdf = load_cooling_resources()
print(f"Boundary: {len(b_gdf)} feature(s)")
print(f"Census Tracts: {len(t_gdf)} tracts")
print(f"Cooling Resources: {len(r_gdf)} assets")

kpis = compute_city_kpis(t_gdf, r_gdf)
print("City KPIs:", kpis)
assert kpis["dead_zones_count"] > 0, "Expected dead zones count > 0"
assert kpis["total_cooling_assets"] > 0, "Expected cooling assets > 0"

print("\n=== 2. Testing Scenario Planner ===")
res = evaluate_hypothetical_intervention(
    lat=35.7364,
    lon=-78.5920,
    intervention_type="Resilience Cooling Center",
    tracts_gdf=t_gdf
)
print("Scenario Simulation Output:")
print(f"Newly protected vulnerable: {res['newly_served_vuln']:,}")
print(f"Dead zones alleviated: {res['alleviated_dead_zones']}")
print(f"Deficit reduction: {res['pct_reduction']}%")
print(f"ROI score: {res['roi_score']}/100")
assert res["newly_served_vuln"] > 0, "Expected newly served vulnerable > 0"

print("\n=== 3. Testing Copilot Service ===")
sample_tract = t_gdf.iloc[0].to_dict()
brief_text, is_live = generate_tract_copilot_brief(sample_tract, persona="City Planners & Urban Designers")
print(f"Copilot Tract Brief generated (live={is_live}, length={len(brief_text)})")
print("Snippet length:", len(brief_text))

council_memo, is_live_council = generate_council_briefing(kpis, t_gdf[t_gdf["is_dead_zone"]], persona="Emergency Management & Public Health")
print(f"Council Memo generated (live={is_live_council}, length={len(council_memo)})")

print("\n=== 4. Testing Audio Service ===")
audio_bytes, fmt, a_live, msg = generate_audio_briefing("Test executive alert for Raleigh", voice_name=list(VOICE_PROFILES.keys())[0])
print(f"Audio generated: format={fmt}, bytes={len(audio_bytes)}, message={msg}")
assert len(audio_bytes) > 0, "Expected non-empty audio bytes"

print("\n=== 5. Testing Map Generation ===")
folium_map = create_resilience_map(
    tracts_gdf=t_gdf,
    resources_gdf=r_gdf,
    active_metric="Heat Vulnerability Index (HVI)",
    active_intervention=res
)
html_str = folium_map.get_root().render()
print(f"Folium map rendered successfully: {len(html_str)} bytes HTML")
assert len(html_str) > 1000, "Map HTML should be substantial"

print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
