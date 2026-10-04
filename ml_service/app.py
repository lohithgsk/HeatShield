"""Small Flask inference service for the HeatShield forecasting artifacts."""

from datetime import datetime, timezone
import os
from pathlib import Path
import math

import joblib
import numpy as np
import pandas as pd
import sklearn
from flask import Flask, jsonify, request


ROOT = Path(__file__).resolve().parent.parent
ARTIFACT_DIR = ROOT / "ML_training" / "artifacts"
HORIZONS = (30, 60, 120)
MODEL_SKLEARN_VERSION = "1.7.1"

app = Flask(__name__)
models = {}


def load_models():
    if sklearn.__version__ != MODEL_SKLEARN_VERSION:
        raise RuntimeError(
            f"Forecast artifacts require scikit-learn {MODEL_SKLEARN_VERSION}; "
            f"the active Python environment has {sklearn.__version__}. "
            "Install ml_service/requirements.txt and restart Flask."
        )
    for horizon in HORIZONS:
        artifact_path = ARTIFACT_DIR / f"heat_index_model_{horizon}m.joblib"
        if not artifact_path.exists():
            continue
        bundle = joblib.load(artifact_path)
        if isinstance(bundle, dict):
            model = bundle["model"]
            features = bundle.get("features", [])
            residual_std = float(bundle.get("residual_std_f", 2.0))
        else:
            model = bundle
            features = []
            residual_std = 2.0
        models[horizon] = {
            "model": model,
            "features": features,
            "residual_std_f": max(residual_std, 0.5),
        }


def feature_rows(stations, feature_names):
    rows = []
    for station in stations:
        row = {name: np.nan for name in feature_names}
        row.update({
            "station_id": station.get("station_id"),
            "temperature_f": station.get("temperature_f"),
            "humidity_pct": station.get("humidity_pct"),
            "wind_speed_mph": station.get("wind_speed_mph"),
            "solar_radiation": station.get("solar_radiation"),
            "uhi_offset_f": station.get("uhi_offset_f", 0),
            "latitude": station.get("latitude"),
            "longitude": station.get("longitude"),
            "hour_of_day": datetime.now(timezone.utc).hour,
            "day_of_year": datetime.now(timezone.utc).timetuple().tm_yday,
        })
        # With only the latest TigerData row, current observations are the safest
        # available fallback for missing lag/rolling values.
        for name in feature_names:
            if name.startswith("temperature_f_lag_") or name.startswith("rolling_temp_mean_"):
                row[name] = station.get("temperature_f")
            elif name.startswith("humidity_pct_lag_") or name == "rolling_humidity_mean_30m":
                row[name] = station.get("humidity_pct")
            elif "_change_" in name:
                row[name] = 0
        for name, value in row.items():
            if value is None or (isinstance(value, float) and math.isnan(value)):
                row[name] = 0
        rows.append(row)
    return pd.DataFrame(rows, columns=feature_names)


def threshold_probability(prediction, threshold, residual_std):
    return 0.5 * (1 + math.erf((prediction - threshold) / (residual_std * math.sqrt(2))))


@app.get("/health")
def health():
    return jsonify({
        "status": "online",
        "models": sorted(models),
        "service": "heatshield-forecast",
        "sklearn_version": sklearn.__version__,
    })


@app.post("/forecast")
def forecast():
    payload = request.get_json(silent=True) or {}
    stations = payload.get("stations")
    if not isinstance(stations, list) or not stations:
        return jsonify({"error": "stations must be a non-empty array"}), 400

    forecasts = []
    for horizon, bundle in models.items():
        inputs = feature_rows(stations, bundle["features"])
        predictions = bundle["model"].predict(inputs)
        for station, prediction in zip(stations, predictions):
            value = round(float(prediction), 1)
            forecasts.append({
                "station_id": station.get("station_id"),
                "station_name": station.get("station_name"),
                "latitude": station.get("latitude"),
                "longitude": station.get("longitude"),
                "horizon_minutes": horizon,
                "predicted_heat_index_f": value,
                "probability_hi_90": round(threshold_probability(value, 90, bundle["residual_std_f"]), 3),
                "probability_hi_105": round(threshold_probability(value, 105, bundle["residual_std_f"]), 3),
            })
    return jsonify({"generated_at": datetime.now(timezone.utc).isoformat(), "forecasts": forecasts})


load_models()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("FORECAST_PORT", "5050")))
