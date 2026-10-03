import os
import osmnx as ox
import networkx as nx

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
graph_file = os.path.join(DATA_DIR, "raleigh_central_walk.graphml")

if not os.path.exists(graph_file):
    print("Fetching walking network for Central Raleigh (~2500m radius around Capitol)...")
    # Central Raleigh coordinates (Capitol): (35.7796, -78.6382)
    G = ox.graph_from_point((35.7796, -78.6382), dist=2500, network_type="walk")
    print(f"Network nodes: {len(G.nodes)}, edges: {len(G.edges)}")
    ox.save_graphml(G, graph_file)
    print(f"Saved walking network to {graph_file}")
else:
    print(f"Walk graph already exists at {graph_file}")
