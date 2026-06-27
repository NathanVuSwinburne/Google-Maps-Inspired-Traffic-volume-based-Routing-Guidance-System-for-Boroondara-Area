"""
Generates static JSON data files for the fully-static frontend.
Run from the project root: python scripts/generate_static_data.py

Outputs to frontend/public/data/:
  network.json         - pre-computed sites + connections
  traffic_LSTM.json    - LSTM traffic lookup
  traffic_GRU.json     - GRU traffic lookup
  traffic_Bi_LSTM.json - BiLSTM traffic lookup
"""
import json
import math
import os
import sys
import pandas as pd
from haversine import haversine, Unit

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE, "frontend", "public", "data")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Build site network ────────────────────────────────────────────────────────

with open(os.path.join(BASE, "processed_data/preprocessed_data/sites_metadata.json")) as f:
    raw_sites = json.load(f)

sites_data = {}
for sid, data in raw_sites.items():
    sites_data[sid] = {
        **data,
        "latitude": data["latitude"] + 0.0012,
        "longitude": data["longitude"] + 0.0012,
    }

def find_connections(sites_data):
    road_to_sites = {}
    for sid, site in sites_data.items():
        for road in site["connected_roads"]:
            road_to_sites.setdefault(road, []).append(sid)

    opposite = {"N": "S", "S": "N", "E": "W", "W": "E"}
    connections = []

    for road, site_ids in road_to_sites.items():
        if len(site_ids) <= 1:
            continue
        sites_on_road = [
            {"id": sid, "lat": sites_data[sid]["latitude"], "lng": sites_data[sid]["longitude"], "data": sites_data[sid]}
            for sid in site_ids
            if not (sites_data[sid]["latitude"] == 0 and sites_data[sid]["longitude"] == 0)
        ]
        if len(sites_on_road) <= 1:
            continue

        lats = [s["lat"] for s in sites_on_road]
        lngs = [s["lng"] for s in sites_on_road]
        lat_var = sum((x - sum(lats)/len(lats))**2 for x in lats)
        lng_var = sum((x - sum(lngs)/len(lngs))**2 for x in lngs)
        sites_on_road.sort(key=lambda s: s["lng"] if lng_var > lat_var else s["lat"])

        for i in range(len(sites_on_road) - 1):
            s1, s2 = sites_on_road[i], sites_on_road[i + 1]
            dist = haversine((s1["lat"], s1["lng"]), (s2["lat"], s2["lng"]), unit=Unit.KILOMETERS)
            if dist >= 5.0:
                continue

            lat_diff = s2["lat"] - s1["lat"]
            lng_diff = s2["lng"] - s1["lng"]
            card = ("N" if lat_diff > 0 else "S") if abs(lat_diff) > abs(lng_diff) else ("E" if lng_diff > 0 else "W")

            for from_s, to_s, approach_dir in [(s1, s2, opposite[card]), (s2, s1, card)]:
                for loc in to_s["data"]["locations"]:
                    if road.lower() in loc.lower() and f"{approach_dir} of".lower() in loc.lower():
                        connections.append({
                            "from_id": int(from_s["id"]),
                            "to_id": int(to_s["id"]),
                            "shared_road": road,
                            "distance": round(dist, 6),
                            "approach_location": loc,
                            "from_lat": from_s["lat"],
                            "from_lng": from_s["lng"],
                            "to_lat": to_s["lat"],
                            "to_lng": to_s["lng"],
                        })
                        break

    return connections

connections = find_connections(sites_data)

sites_list = [
    {
        "site_id": int(sid),
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "connected_roads": data["connected_roads"],
        "locations": data["locations"],
    }
    for sid, data in sites_data.items()
]

network = {"sites": sites_list, "connections": connections}
network_path = os.path.join(OUT_DIR, "network.json")
with open(network_path, "w") as f:
    json.dump(network, f, separators=(",", ":"))
print(f"✓ network.json  ({len(sites_list)} sites, {len(connections)} connections)")

# ── Build traffic lookups ─────────────────────────────────────────────────────

approach_locs = set(c["approach_location"].upper() for c in connections)

model_files = {
    "LSTM":    os.path.join(BASE, "processed_data/complete_csv_oct_nov_2006/lstm_model/lstm_model_complete_data.csv"),
    "GRU":     os.path.join(BASE, "processed_data/complete_csv_oct_nov_2006/gru_model/gru_model_complete_data.csv"),
    "Bi_LSTM": os.path.join(BASE, "processed_data/complete_csv_oct_nov_2006/bi_lstm_model/bi_lstm_model_complete_data.csv"),
}

for model_name, csv_path in model_files.items():
    print(f"  Loading {model_name}...", flush=True)
    df = pd.read_csv(csv_path, low_memory=False)

    # Filter to only approach locations used in routing graph (case-insensitive)
    df["loc_upper"] = df["Location"].str.upper()
    df_filtered = df[df["loc_upper"].isin(approach_locs)]

    # Build nested lookup: { date: { interval_id: { LOCATION_UPPER: volume } } }
    lookup: dict = {}
    for row in df_filtered.itertuples(index=False):
        d = str(row.Date)
        iv = str(int(row.interval_id))
        loc = row.loc_upper
        vol = round(float(row.traffic_volume), 1)
        lookup.setdefault(d, {}).setdefault(iv, {})[loc] = vol

    out_path = os.path.join(OUT_DIR, f"traffic_{model_name}.json")
    with open(out_path, "w") as f:
        json.dump(lookup, f, separators=(",", ":"))
    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"✓ traffic_{model_name}.json  ({size_mb:.1f} MB, {len(lookup)} dates, {len(df_filtered):,} rows)")

print("\nDone. Files written to frontend/public/data/")
