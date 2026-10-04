import json
import os
import sys

import networkx as nx
import osmnx as ox


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_graph():
    return ox.load_graphml(os.path.join(DATA_DIR, "raleigh_central_walk.graphml"))


def route(payload):
    graph = load_graph()
    origin = payload["origin"]
    destination = payload["destination"]
    origin_node = ox.nearest_nodes(graph, origin["lon"], origin["lat"])
    destination_node = ox.nearest_nodes(graph, destination["lon"], destination["lat"])
    nodes = nx.shortest_path(graph, origin_node, destination_node, weight="length")

    coordinates = [[origin["lon"], origin["lat"]]]
    steps = []
    total_distance = 0.0
    for start, end in zip(nodes, nodes[1:]):
        edge_options = graph.get_edge_data(start, end) or {}
        edge = min(edge_options.values(), key=lambda item: float(item.get("length", 0)))
        distance = float(edge.get("length", 0))
        total_distance += distance
        name = edge.get("name") or "the next street"
        if isinstance(name, list):
            name = name[0]
        steps.append({
            "instruction": f"Continue on {name}",
            "distance_meters": round(distance),
        })
        geometry = edge.get("geometry")
        if geometry is not None and hasattr(geometry, "coords"):
            coordinates.extend([[round(lon, 7), round(lat, 7)] for lon, lat in geometry.coords][1:])
        else:
            coordinates.append([float(graph.nodes[end]["x"]), float(graph.nodes[end]["y"])])

    coordinates.append([destination["lon"], destination["lat"]])
    return {
        "route_source": "raleigh_walk_graph",
        "distance_meters": round(total_distance),
        "duration_seconds": round(total_distance / 1.33),
        "geometry": coordinates,
        "steps": steps,
    }


if __name__ == "__main__":
    try:
        print(json.dumps(route(json.load(sys.stdin))))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)