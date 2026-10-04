# HeatShield — Raleigh Urban Climate Decision Hub

> **Find the heat. Understand the risk. Fund the fix.**

HeatShield is a full-stack urban climate decision-support platform built for Raleigh, North Carolina.

Instead of solely identifying high-temperature zones, HeatShield integrates heat exposure, demographic vulnerability, cooling accessibility, intervention planning, AI-driven recommendations, and decentralized real-world funding into a unified platform.

<p align="center">
  <img src="https://github.com/lohithgsk/HeatShield/raw/main/docs/images/HeatShield.png" alt="HeatShield Logo" width="100%" />
</p>

---

## What Problem Are We Solving?

Extreme heat events do not impact every neighborhood equally. HeatShield addresses critical municipal inquiries:

- Where is the localized heat concentrated?
- Which demographics are most vulnerable?
- Which populations lack physical access to cooling infrastructure?
- What infrastructure should be constructed, and where?
- How can these projects be financed transparently?

---

## Core Features

### 1. Interactive Heat & Vulnerability Map

Provides analysis across **248 Raleigh Census Tracts** utilizing metrics including:

- Heat Vulnerability Index (HVI)
- Surface temperature gradients
- Tree canopy coverage and canopy deficit analysis
- Impervious surface density
- Poverty rate distribution
- Senior population concentration

The mapping interface incorporates **746 OpenStreetMap cooling resources**, covering libraries, community centers, public pools, parks, and greenways.

### Heat Dead-Zone Detection

The platform automatically isolates critical heat dead zones defined by high heat vulnerability coupled with a lack of cooling resources within an 800-meter radius.

### 2. Scenario-Based Intervention Planner

Users can deploy hypothetical urban interventions onto the map to simulate localized impact.

| Intervention Type | Target Walk Shed | Estimated Cost |
| :--- | :---: | :---: |
| Cooling Center | 800m | $350,000 |
| Pocket Park / Urban Forest | 600m | $180,000 |
| Splash Pad / Aquatics | 700m | $240,000 |
| Shaded Transit & Hydration Hub | 500m | $95,000 |

The scenario engine computes key performance metrics:

- Total population protected
- Critical dead zones eliminated
- Pedestrian accessibility improvements
- Cost per person protected
- Municipal ROI score

### 3. Urban Climate Copilot

Powered by **Google Gemini**, the Climate Copilot processes spatial map data to deliver automated operational recommendations, including:

- Tract-level climate diagnostics
- Pedestrian dead-zone evaluations
- Optimized intervention siting
- City Council action items and executive memorandums
- Conversational climate intelligence Q&A

### 4. Executive Audio Briefings

Integrated with **ElevenLabs**, HeatShield transforms climate data analytics into synthesized executive audio briefings.

Templates include:

- Emergency heatwave advisories
- City council briefings
- Tree canopy equity spotlights

### 5. Decentralized Funding — Powered by Solana

HeatShield acts as a coordination and financial settlement layer. When high-priority intervention sites are selected, users can connect a Solana wallet, select a funding tier, and sign transactions to finance the infrastructure directly.

Funding actions record permanent on-chain data mapped to projected beneficiaries and access improvements.

### 6. Heat Relief Impact Ledger

All funded interventions feed directly into a transparent public impact ledger, establishing a verifiable audit trail from climate need to financial execution and projected social impact.

---

## Technology Stack

- **Frontend:** React 19, Vite, Leaflet, React-Leaflet, Lucide, Vanilla CSS
- **Backend:** Node.js, Express 5, Axios, Dotenv
- **ML Forecasting:** Flask, scikit-learn HistGradientBoosting, TigerData telemetry
- **AI & Voice:** Google Gemini, ElevenLabs
- **Blockchain:** Solana, wallet-based transaction signing, on-chain intervention ledgers
- **Mobile Support:** Expo Go
- **Data Sources:** 248 Census Tracts, 746 OpenStreetMap cooling assets, Raleigh Municipal Boundary

---

## Project Directory Structure

```text
wolfhacks/
├── server/
│   ├── index.js
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── ScenarioDrawer.jsx
│   │   │   ├── CopilotDrawer.jsx
│   │   │   ├── AudioDrawer.jsx
│   │   │   ├── AnalyticsDrawer.jsx
│   │   │   ├── FundingDrawer.jsx
│   │   │   └── ImpactLedger.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── data/
│   ├── raleigh_boundary.geojson
│   ├── raleigh_census_tracts.geojson
│   └── raleigh_cooling_resources.geojson
│
├── package.json
├── .env
└── README.md
```

---

# Local Installation & Execution

## Prerequisites

- Node.js installed on your system.
- For mobile application usage, setting up Expo Go is mandatory (create an account on Expo Go).

## 1. Install Dependencies

Run the installation command from the root directory:

```bash
npm install
```

## 2. Configure Environment Variables

Create a `.env` file in the root directory and populate your API credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

> **Note:** Never commit private keys or seed phrases.

## 3. Run the Backend Server

To execute the backend server, you can either run the following command from the root of the package:

```bash
node server
```

## 4. Run the ML Forecast Service

The Forecast drawer uses the saved `HistGradientBoosting` artifacts from
`ML_training/artifacts/`. Start the Flask service in a second terminal:

```bash
C:/Users/Lenovo/miniconda3/python.exe -m pip install -r ml_service/requirements.txt
python ml_service/app.py
```

The service listens on `http://127.0.0.1:5050`. Express proxies the browser
request at `GET /api/forecast`, so the frontend does not need a separate CORS
configuration. The Forecast action in the navbar displays 30-, 60-, and
120-minute station predictions and the estimated probability of exceeding a
90°F heat index.

The inference environment pins scikit-learn to `1.7.1`, matching the version
used to create the saved model artifacts. If Flask reports a model compatibility
error, install the requirements with the same Python interpreter used to start
Flask, then restart it.

Or navigate into the server directory and execute:

```bash
cd server
node index.js
```

## 4. Run the Frontend Application

To start the React development client from the root directory:

```bash
npm run dev
```

## 5. Run the Mobile Application

Ensure your Expo Go account is configured, then run:

```bash
npm run start:lan:clear
```

---

## ⚠️ AI Usage Declaration

HeatShield was developed with the assistance of generative AI tools.

- **Google Gemini:** Used for the **Urban Climate Copilot**, including spatial data analysis, climate diagnostics, intervention recommendations, and conversational climate intelligence.
- **OpenAI Codex:** Used during development for **project ideation, architectural brainstorming, and initial code/project skeleton generation**.

AI-generated suggestions and code were reviewed, adapted, and integrated by the development team. The final implementation, design decisions, testing, data integration, and project execution were performed and validated by the team.
