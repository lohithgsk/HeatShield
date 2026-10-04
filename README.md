# HeatShield

HeatShield is a Raleigh, North Carolina urban-heat decision-support application. It combines neighborhood heat and vulnerability data, cooling-resource access, live weather, emergency reports, intervention simulation, historical heatwave replay, and operational recommendations in one web and mobile experience.

> **Find the heat. Understand the risk. Decide what to do next.**

The repository contains the current React/Vite web application, its Express API, an optional Flask forecasting service, a companion Expo mobile app, and the data/ML assets used by those applications.

## What the application does

### Web decision hub

The web interface is an interactive Leaflet map and operations workspace for Raleigh. It supports three operational personas:

- **Urban Planning** — inspect heat-vulnerability metrics, canopy and impervious-surface patterns, cooling access, intervention scenarios, analytics, and planning recommendations.
- **Community Advocates & Citizens** — find nearby cooling resources, view local heat conditions, subscribe addresses to community alerts, and report heat hazards or request help.
- **Emergency Management & Public Health** — triage active heat alerts, dispatch or resolve response units, inspect sensor telemetry, and prepare voice broadcasts.

### Mapping and equity analysis

The bundled Raleigh datasets currently include:

- 248 census-tract features
- 746 cooling-resource features
- 1 Raleigh boundary feature
- 22 precomputed heat dead zones
- 38 resources categorized as indoor A/C refuges

The map can display:

- Heat Vulnerability Index (HVI)
- Surface temperature
- Tree-canopy coverage and deficit
- Impervious-surface density
- Vulnerable population and access metrics
- Cooling-resource locations and walk-shed buffers
- Heatmap overlays
- Live user location and weather
- Emergency-alert locations

### Planning and response tools

- **Scenario Intervention Planner** — place or select an intervention such as a resilience cooling center, pocket park/urban forest, splash pad/aquatics site, or shaded transit and hydration hub. The API estimates protected population, access changes, eliminated dead zones, cost per person, and ROI score.
- **ML Heat Forecast** — view 30-, 60-, and 120-minute heat-index predictions for Raleigh station nodes when the forecasting service is available.
- **Historical Heatwave Replay** — replay bundled historical and modeled heatwave scenarios, including the 1998 Super El Niño event, and inspect changing risk indicators over time.
- **Heatwave War Room** — compare unmitigated and mitigated impacts for predefined high-impact scenarios and apply response actions to the map.
- **Emergency alerts** — create community heat reports, refresh the in-memory alert feed, dispatch a response unit, and resolve an alert.
- **AI planning advisory** — use Google Gemini for tract diagnostics, council briefings, and conversational questions when `GEMINI_API_KEY` is configured.
- **Voice broadcast** — synthesize emergency, council, or equity briefings with ElevenLabs when `ELEVENLABS_API_KEY` is configured.
- **TigerData telemetry** — optionally ingest Raleigh station observations into a Timescale/PostgreSQL database and expose live readings and trends.

### Mobile “Raleigh Heat” app

The Expo app is a focused resident experience. It:

1. Requests foreground location permission.
2. Shows current apparent temperature, risk level, and an advisory.
3. Finds the nearest indoor refuge and other nearby cooling resources.
4. Summarizes the surrounding census tract.
5. Requests a walking route and can hand off directions to Google Maps.

The mobile app falls back to downtown Raleigh, bundled cooling resources, local area calculations, direct Open-Meteo requests, and a straight-line route when the local API or network is unavailable.

## Architecture

```text
React + Vite web client (port 3000)
             |
             | /api proxy
             v
Express API (port 5000)
  |       |          |             |
  |       |          |             +-- Google Gemini (optional)
  |       |          +---------------- ElevenLabs (optional)
  |       +--------------------------- Timescale/PostgreSQL TigerData (optional)
  +----------------------------------- Open-Meteo weather
             |
             +--> Flask ML inference service (port 5050, optional)
             |       +-- scikit-learn forecasting artifacts
             |
             +--> Python walking-route helper
                     +-- bundled Raleigh walk graph

Expo mobile app
  +--> Express API over the local network
  +--> offline/local fallbacks
```

The Express server can also serve `client/dist` after a production client build, so the web application can run from one Node process.

## Repository layout

```text
.
├── client/                 React/Vite web application
│   └── src/components/     Map, persona panels, drawers, and modals
├── server/                 Express API and integrations
│   ├── index.js
│   ├── tigerService.js
│   ├── alertService.js
│   ├── historicalService.js
│   └── warRoomService.js
├── mobile/                 Expo React Native “Raleigh Heat” app
├── data/                   Raleigh GeoJSON layers and walking graph
├── ML_training/            Training notebook, sample telemetry, and joblib models
├── ml_service/             Flask model inference API
├── services/               Python data, scenario, AI/audio, and routing utilities
├── components/             Python/Streamlit-era map and UI helpers
├── verify_all.py           Python verification utility for the retained utility layer
├── package.json            Root scripts and server-level dependencies
└── .env.example            Root environment-variable template
```

The active browser runtime is `client/` + `server/`. The Python modules under `services/` and `components/` are retained analysis/research utilities; they are not launched by the root `npm` scripts.

## Prerequisites

Install the following before running the complete local stack:

- Node.js 20 or newer
- npm
- Python 3.10+ for the Flask forecast service and walking-route helper
- A device or emulator with Expo Go for mobile development
- Optional: a TimescaleDB/PostgreSQL connection for persistent telemetry and sample-user/community-subscription storage
- Optional API keys for Gemini and ElevenLabs

## Quick start: web application

From the repository root:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

Copy the environment template and edit it:

```powershell
Copy-Item .env.example .env
```

Start the API in one terminal:

```bash
npm run server
```

Start the Vite client in a second terminal:

```bash
npm run client
```

Open <http://localhost:3000>. The Vite development server proxies `/api` requests to `http://localhost:5000`.

The root `npm run dev` and `npm start` commands start the Express server only. They do not start Vite, so use the two-terminal flow above for local web development.

### Production-style local run

Build the client:

```bash
npm run build
```

Then start Express:

```bash
npm start
```

If `client/dist` exists, Express serves the built application and continues to serve the API from the same port. Open <http://localhost:5000>.

## Environment variables

The Express server loads `.env` from the repository root. Start from [.env.example](./.env.example):

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Express port; defaults to `5000`. |
| `HOST` | No | Bind address; defaults to `0.0.0.0`. Use `127.0.0.1` for local-only access. |
| `GEMINI_API_KEY` | No | Enables Gemini tract, council, and chat endpoints. |
| `ELEVENLABS_API_KEY` | No | Enables voice listing and text-to-speech endpoints. |
| `FORECAST_SERVICE_URL` | No | Flask forecast URL; defaults to `http://127.0.0.1:5050`. |
| `TIGER_DATA_URL` | No | PostgreSQL/Timescale connection string for live telemetry and persistence. |
| `PYTHON_BIN` | No | Python executable used by the walking-route helper; defaults to `python`. |
| `NODE_ENV` | No | In `production`, forecasts require live TigerData telemetry instead of sample telemetry. |

Never commit `.env`, API keys, database credentials, or other secrets. The repository `.gitignore` already excludes `.env` and dependency directories.

## ML forecasting service

The web forecast UI calls Express, and Express calls the internal Flask service. Start it in a separate terminal from the repository root:

```bash
python -m pip install -r ml_service/requirements.txt
python ml_service/app.py
```

The service listens on `http://127.0.0.1:5050` by default. Set `FORECAST_PORT` to change its port:

```powershell
$env:FORECAST_PORT = "5051"
python ml_service/app.py
```

The checked-in models are:

- `ML_training/artifacts/heat_index_model_30m.joblib`
- `ML_training/artifacts/heat_index_model_60m.joblib`
- `ML_training/artifacts/heat_index_model_120m.joblib`

They require **scikit-learn 1.7.1**. The Flask service intentionally fails fast when another scikit-learn version is active.

Check the service directly:

```bash
curl http://127.0.0.1:5050/health
```

In development, if TigerData is unavailable, the Express forecast endpoint uses the latest station rows from `ML_training/data/sample_tiger_data.csv`. In production (`NODE_ENV=production`), live TigerData telemetry is required.

## TigerData / TimescaleDB

Set `TIGER_DATA_URL` to enable the database-backed telemetry path. On startup, the server attempts to:

1. Create the `raleigh_heat_telemetry` table and Timescale hypertable.
2. Create station/tract time indexes.
3. Create the `heatshield_users` and `community_alert_subscriptions` tables.
4. Seed sample municipal users when the user table is empty.
5. Ingest an initial reading and then ingest every five minutes.

Without `TIGER_DATA_URL`, the rest of the web application still starts. TigerData endpoints report that the database is not configured, and development forecasts can use the bundled sample telemetry.

## Mobile app

Install dependencies:

```bash
cd mobile
npm install
```

For a physical device, copy [mobile/.env.example](./mobile/.env.example) to `mobile/.env` and set the computer’s LAN address:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.42:5000
```

`localhost` inside Expo Go refers to the phone, not the development computer. The mobile client first attempts to infer the Expo LAN host, then uses `EXPO_PUBLIC_API_URL`, and finally falls back to its built-in development address.

Start Expo:

```bash
npm run start:lan
```

Useful alternatives:

```bash
npm run start:lan:clear
npm run android
npm run ios
npm run web
```

Allow location access when prompted. If permission is denied, the app uses downtown Raleigh as a preview location.

## API surface

The Express API is available under `/api`. The main groups are:

| Group | Endpoints |
| --- | --- |
| Health/config | `GET /api/health` |
| Map data | `GET /api/geojson/tracts`, `/api/geojson/resources`, `/api/geojson/boundary` |
| City metrics | `GET /api/kpis`, `GET /api/block/me?lat=...&lon=...` |
| Weather/cooling | `GET /api/weather/live`, `GET/POST /api/cooling/nearest`, `GET/POST /api/resources/nearest` |
| Walking | `POST /api/walking/route` |
| Forecast | `GET /api/forecast` |
| AI | `POST /api/copilot/tract`, `/api/copilot/council`, `/api/copilot/chat` |
| Voice | `GET /api/voices`, `POST /api/tts` |
| Scenarios | `POST /api/scenario/evaluate`, `/api/simulation/run` |
| Historical/War Room | `GET /api/historical/heatwaves`, `/api/historical/heatwaves/:id`, `GET /api/warroom/scenarios`, `/api/warroom/scenarios/:id` |
| Alerts | `GET/POST /api/alerts`, `POST /api/alerts/:id/dispatch`, `POST /api/alerts/:id/resolve` |
| TigerData | `GET /api/tiger/status`, `/api/tiger/live`, `/api/tiger/trends`, `POST /api/tiger/ingest` |
| Auth/subscriptions | `POST /api/auth/login`, `GET /api/auth/sample-users`, `POST /api/community/subscribe`, `GET /api/community/subscriptions?email=...` |

Alerts are currently held in server memory and reset when the Node process restarts. Persistent telemetry, users, and subscriptions use TigerData when configured.

## Data and external services

- **Bundled geospatial data:** Raleigh census tracts, boundary, cooling resources, and a central walking graph under `data/`.
- **Weather:** Open-Meteo is queried by the Express API and, as a mobile fallback, directly by the Expo app.
- **AI:** Google Gemini is optional and used only by the server-side copilot endpoints.
- **Voice:** ElevenLabs is optional and used only by the server-side voice endpoints.
- **Telemetry:** TimescaleDB/PostgreSQL is optional and accessed through the `pg` dependency.
- **Map tiles:** Leaflet renders the map; tile availability depends on the configured/embedded tile provider and network access.

Forecast values, scenario impacts, historical replay values, and some emergency scenarios are decision-support estimates. They should not be treated as medical advice, official emergency forecasts, or a substitute for city, weather-service, or public-health guidance.

## Development commands

Run from the repository root unless noted:

| Command | Purpose |
| --- | --- |
| `npm run server` | Start Express on port 5000. |
| `npm run client` | Start Vite on port 3000. |
| `npm run build` | Build the React client into `client/dist`. |
| `npm start` | Alias for starting Express. |
| `npm run forecast` | Start Flask using the system `python` command. |
| `npm --prefix client run lint` | Run Oxlint for the client. |
| `python verify_all.py` | Exercise the retained Python data/scenario/AI/audio utility layer; install the root `requirements.txt` first. |

There is no automated test suite configured in `server/package.json`. The most useful smoke checks after setup are:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/kpis
```

Then confirm the browser loads <http://localhost:3000> and that the map, cooling lookup, and optional drawers behave as expected.

## Troubleshooting

### The browser shows API errors

Confirm Express is running on port 5000 and Vite is running on port 3000. Check `http://localhost:5000/api/health`. If using a different API port, update the proxy in `client/vite.config.js` and the mobile API URL as appropriate.

### Forecasts are unavailable

Start Flask, verify `/health`, and ensure the active Python environment has scikit-learn `1.7.1`. If running production mode, configure `TIGER_DATA_URL`; production intentionally does not use sample telemetry.

### The mobile app cannot reach the API

Use the computer’s LAN IP in `mobile/.env`, keep the phone and computer on the same network, allow Node through the firewall, and use `npm run start:lan`. Do not use `localhost` from a physical phone.

### Walking routes fall back to a straight line

The server invokes `services/route_service.py` and reads `data/raleigh_central_walk.graphml`. Install the Python dependencies from `requirements.txt`, ensure `PYTHON_BIN` points to the intended interpreter, and confirm the graph file exists.

### Gemini or ElevenLabs features are disabled

Set the matching key in the root `.env`, restart Express, and check `/api/health`. The rest of the application remains usable without either key.

## License

The root package declares the MIT license. Confirm any third-party dataset, map-tile, API, and model-artifact terms before redistributing or deploying the application.
