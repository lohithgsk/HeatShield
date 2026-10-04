# 🌡️ Raleigh Urban Climate Decision Hub (Node.js + React)

A full-stack, enterprise-grade geospatial decision-support application built with **React (Vite)**, **Node.js (Express)**, and **Leaflet**. Designed for the **City of Raleigh, North Carolina**, this platform identifies urban heat islands, surfaces demographic vulnerability, measures pedestrian walking-distance accessibility to cooling resources, and provides a scenario planner where municipal leaders can drop hypothetical interventions and evaluate real-time impact.

---

## 🏛️ Target Stakeholders & Personas

| Stakeholder Persona | Strategic Focus & Dashboard Capabilities |
| :--- | :--- |
| **🏗️ City Planners & Urban Designers** | Justification for urban tree canopy ordinances, pocket park locations, capital improvement programming (CIP), and transit corridor shade infrastructure. |
| **🚑 Emergency Management & Public Health** | Pinpointing isolated seniors and low-income populations during extreme heatwaves, activating emergency cooling centers, and optimizing EMS deployment. |
| **📢 Community Advocates & Citizens** | Environmental justice insights (Justice40 metrics), historical canopy deficits, and actionable neighborhood talking points for City Council. |

---

## ⚡ Tech Stack

- **Frontend:** React 19, Vite, Leaflet, React-Leaflet, Lucide Icons, Canvas Confetti
- **Styling:** Custom Vanilla CSS Design System (Dark Municipal Command Center with glassmorphism, responsive HUD, and dynamic status badges)
- **Backend:** Node.js, Express 5, Axios, Dotenv
- **Geospatial Datasets:** 248 real US Census Tracts, 746 verified OpenStreetMap cooling assets, and municipal boundary for Raleigh, NC
- **Sponsor Tools:**
  - **Google Gemini 3.8 Flash API:** Powers live Urban Climate Copilot diagnostics, City Council memorandums, and conversational climate resilience Q&A.
  - **ElevenLabs Text-to-Speech API:** Studio-quality neural voice synthesis for executive audio briefings, emergency radio broadcasts, and podcast summaries.

---

## 🚀 Key Features

### 1. Interactive Geospatial Choropleth & Dead-Zone Detection
- **248 Raleigh Census Tracts** with multi-layer metric toggles:
  - *Composite Heat Vulnerability Index (HVI)* (0–100 score)
  - *Summer Peak Surface Temperature (°F)* (up to 105.5°F)
  - *Tree Canopy Coverage (%)* vs. *Canopy Deficit*
  - *Impervious Surface (Asphalt & Roofs) %*
  - *Poverty Rate (< 200% FPL)*
  - *Senior Population (Age 65+) Concentration*
- **Critical Heat Dead Zones Overlay:**
  - Highlights tracts combining high/extreme heat vulnerability ($HVI \ge 55$) with zero cooling facilities within a safe 10-minute walk ($>800\text{m}$).
- **746 OpenStreetMap Cooling Assets:**
  - Categorized into Public Libraries, Community Centers, Pools/Aquatics, and Parks/Greenways.
  - Plotted with **10-minute pedestrian walk sheds (~800m circular catchments)** to visualize municipal coverage and service gaps.

### 2. Interactive Intervention Scenario Planner ("Drop an Intervention")
- Drop a hypothetical cooling facility anywhere on the Raleigh map by clicking directly on the map or selecting priority underserved hotspots (Southeast Raleigh / Walnut Creek, Garner Road corridor, New Bern Avenue corridor, Capital Blvd corridor).
- Intervention archetypes:
  - **Municipal Resilience Cooling Center** ($800\text{m}$ walk shed, indoor climate control, \$350k)
  - **Urban Forest & Pocket Park** ($600\text{m}$ walk shed, 120+ canopy trees, $-3.8^\circ\text{F}$ local cooling, \$180k)
  - **Community Splash Pad & Aquatics** ($700\text{m}$ walk shed, $-2.2^\circ\text{F}$ local cooling, \$240k)
  - **Shaded Transit & Hydration Hub** ($500\text{m}$ walk shed, solar mister pavilions, \$95k)
- **Real-Time ROI Calculation:**
  - Newly protected vulnerable citizens
  - Dead zones alleviated
  - Percentage reduction in citywide unserved population
  - Cost efficiency per person protected
  - Composite municipal ROI score (0–100)

### 3. Urban Climate Copilot (Gemini API Integration)
- Powered by **Gemini 3.8 Flash**.
- Generates:
  1. **Tract Microclimate Diagnosis**: Technical breakdown of thermal exposure vs. demographic sensitivity.
  2. **Pedestrian Dead-Zone Alert**: Safe walking radius evaluation.
  3. **Targeted Municipal Actions**: High-ROI capital interventions.
  4. **City Council Action Item**: Polished motion ready for municipal adoption.
- Formulates formal **Raleigh City Council Executive Memorandums** aligned with federal grant programs (**Justice40**, **FEMA BRIC**, and **USFS Urban Forestry**).
- Includes conversational AI chat for climate equity questions.

### 4. ElevenLabs Executive Audio Briefings
- Live studio voice synthesis using ElevenLabs API.
- Supports voice selection (Rachel, Adam, Nicole, George, Roger, etc.).
- Pre-configured templates: *Emergency Heatwave Advisory*, *City Council Briefing*, *Tree Canopy Equity Spotlight*.
- In-app audio player with animated waveform visualization and direct MP3 download.

### 5. Equity & Microclimate Analytics
- Empirical findings on thermal and canopy disparities across Raleigh.
- Full searchable, sortable census tract table with direct **CSV export**.

---

## ⚡ Running the Application

### 1. View Live Application
The app is currently active and accessible at:
- **`http://localhost:3000`** (Vite React Client with Hot-Reload)
- **`http://localhost:5000`** (Node.js Express Full-Stack Server)

### 2. Starting Manually
```bash
# In the project root:

# Run the full-stack Express server (serves API + React build):
npm start

# Or run Vite React client dev server with hot-reloading:
npm run client
```

### 3. API Key Configuration
The application reads keys directly from `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
*(Both keys are loaded and verified).*
*(Both keys are loaded and verified).*

### 4. Mobile App (Expo React Native)

The common-user mobile subset lives in `mobile/`. It includes live heat status, nearest cooling resources, opening-status badges, walking routes, and a plain-language heat summary for the user's area.

From the repository root, install the mobile dependencies and start the API. The API binds to `0.0.0.0`, so phones on the same Wi-Fi can reach it:

```powershell
cd mobile
npm install
cd ..
npm run server
```

In a second terminal, copy the mobile environment template, replace the example address with this computer's Wi-Fi IPv4 address, and start Expo:

```powershell
cd mobile
Copy-Item .env.example .env
# Edit .env: EXPO_PUBLIC_API_URL=http://<YOUR-LAN-IP>:5000
npm run start:lan:clear
```

Find `<YOUR-LAN-IP>` with `ipconfig` (the `IPv4 Address` under the active Wi-Fi adapter), then scan the QR code with Expo Go on a phone connected to that same Wi-Fi network. From the phone browser, open `http://<YOUR-LAN-IP>:5000/api/health` first; it should show JSON. If it does not, allow Node.js through Windows Defender Firewall on **Private** networks (or create an inbound TCP rule for port 5000). For an Android emulator, use `http://10.0.2.2:5000` instead. The mobile app also automatically derives the LAN API address from Expo Go when `expo start --lan` is used, and ignores a stale `localhost` setting on a physical device.

The walking-route card opens turn-by-turn walking directions in Google Maps (or its browser fallback). This avoids requiring a Google Maps SDK key inside Expo Go. The existing cooling dataset does not contain opening hours, so the mobile app displays `Hours unknown` until an authoritative hours registry is added. The area card currently describes the surrounding census tract because the repository does not include block-group data.

---

## 📁 Repository Structure

```
c:\Lohith\wolfhacks\
├── server/
│   ├── index.js                  # Express API server (Gemini, ElevenLabs, GeoJSON, Scenario engine)
│   └── package.json              # Server dependencies (express, cors, dotenv, axios)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top HUD bar, persona selector, drawer toggles
│   │   │   ├── MapView.jsx       # Leaflet interactive choropleth, buffers, click-to-place
│   │   │   ├── ControlPanel.jsx  # Floating layer visibility, metric selector, tract inspector
│   │   │   ├── ScenarioDrawer.jsx# Real-time ROI intervention planner & confetti
│   │   │   ├── CopilotDrawer.jsx # Gemini 3.8 Flash AI Copilot & Council memo generator
│   │   │   ├── AudioDrawer.jsx   # ElevenLabs TTS synthesizer & audio player
│   │   │   └── AnalyticsDrawer.jsx# Environmental equity table & CSV export
│   │   ├── App.jsx               # Main React application state container
│   │   ├── index.css             # Vanilla CSS design system (Dark Command Center)
│   │   └── main.jsx              # React entry point
│   ├── index.html                # HTML template with Leaflet & Google Fonts
│   ├── vite.config.js            # Vite configuration with /api proxy to port 5000
│   └── package.json              # Client dependencies (leaflet, react-leaflet, lucide-react)
├── data/
│   ├── raleigh_boundary.geojson          # City of Raleigh boundary
│   ├── raleigh_census_tracts.geojson     # 248 tracts with complete HVI metrics
│   └── raleigh_cooling_resources.geojson # 746 OSM cooling assets
├── package.json                  # Root npm scripts
├── .env                          # Active Gemini and ElevenLabs API keys
└── README.md                     # Documentation
```
