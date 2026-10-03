import os
import streamlit as st
import geopandas as gpd
from shapely.geometry import Point, Polygon
import osmnx as ox
import networkx as nx

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

@st.cache_resource(show_spinner=False)
def load_walk_graph():
    graph_path = os.path.join(DATA_DIR, "raleigh_central_walk.graphml")
    if os.path.exists(graph_path):
        try:
            return ox.load_graphml(graph_path)
        except Exception as e:
            print("Error loading walk graph:", e)
    return None

def compute_walking_catchment(lat, lon, walk_time_min=10, walking_speed_mps=1.33):
    """
    Computes walking catchment geometry:
    - If within central Raleigh street graph, computes exact network isochrone using OSMnx.
    - Otherwise, computes projected EPSG:32119 800m circular pedestrian buffer.
    """
    radius_meters = walk_time_min * 60 * walking_speed_mps  # ~800m for 10 min
    G = load_walk_graph()
    
    is_network_derived = False
    
    if G is not None:
        try:
            # Check bounding box of graph
            # Central Raleigh coords approx: lat ~35.75 to 35.81, lon ~-78.68 to -78.60
            if 35.75 <= lat <= 35.81 and -78.68 <= lon <= -78.60:
                center_node = ox.nearest_nodes(G, lon, lat)
                subgraph = nx.ego_graph(G, center_node, radius=radius_meters, distance="length")
                node_points = [Point(data["x"], data["y"]) for _, data in subgraph.nodes(data=True)]
                
                if len(node_points) >= 5:
                    pts_gdf = gpd.GeoSeries(node_points, crs="EPSG:4326").to_crs("EPSG:32119")
                    union_buf = pts_gdf.union_all().buffer(45)  # 45m street width buffer
                    isochrone_poly = gpd.GeoSeries([union_buf], crs="EPSG:32119").to_crs("EPSG:4326").iloc[0]
                    is_network_derived = True
                    return isochrone_poly, is_network_derived, len(node_points)
        except Exception as e:
            print("Network isochrone fallback:", e)

    # Standard high-precision projected metric buffer (EPSG:32119 NC State Plane)
    pt_proj = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs("EPSG:32119")
    buf_proj = pt_proj.buffer(radius_meters)
    buf_wgs84 = buf_proj.to_crs("EPSG:4326").iloc[0]
    return buf_wgs84, is_network_derived, 0
