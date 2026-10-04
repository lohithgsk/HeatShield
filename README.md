# 🌡️ HeatShield — Raleigh Urban Climate Decision Hub

> **Find the heat. Understand the risk. Fund the fix.** ❄️🌳💧

HeatShield is a full-stack **urban climate decision-support platform** built for **Raleigh, North Carolina**.

Instead of just showing where it's hot, HeatShield connects **heat exposure + demographic vulnerability + cooling accessibility + intervention planning + AI recommendations + real-world funding** into one platform.

---

## 🚨 What Problem Are We Solving?

Extreme heat doesn't affect every neighborhood equally.

HeatShield helps answer:

> **Where is the heat? Who is vulnerable? Who lacks access to cooling? What should we build? And how can we fund it?**

---

# ⚡ What HeatShield Does

### 🗺️ 1. Interactive Heat & Vulnerability Map

Analyze **248 Raleigh Census Tracts** using:

- 🌡️ Heat Vulnerability Index (HVI)
- ☀️ Surface temperature
- 🌳 Tree canopy & canopy deficit
- 🏙️ Impervious surface
- 💰 Poverty rate
- 👵 Senior population

The map also contains **746 OpenStreetMap cooling resources** including libraries, community centers, pools, parks, and greenways.

### 🔴 Heat Dead-Zone Detection

HeatShield automatically identifies areas where:

```text
High Heat Vulnerability
        +
No cooling resource within ~800m
        ↓
🔴 CRITICAL HEAT DEAD ZONE
```

---

### 📍 2. Drop an Intervention

Users can place hypothetical interventions directly on the map and simulate their impact.

Available interventions include:

| Intervention | Walk Shed | Cost |
|---|---:|---:|
| ❄️ Cooling Center | 800m | $350k |
| 🌳 Pocket Park / Urban Forest | 600m | $180k |
| 💧 Splash Pad / Aquatics | 700m | $240k |
| 🚏 Shaded Transit + Hydration Hub | 500m | $95k |

The scenario engine calculates:

- 👥 People protected
- 🔴 Dead zones eliminated
- 🚶 Accessibility improvement
- 💵 Cost per person
- 📊 Municipal ROI score

---

# 🤖 3. Urban Climate Copilot

Powered by **Google Gemini**, our Climate Copilot turns map data into actionable recommendations.

It can generate:

- 🌡️ Tract-level climate diagnosis
- 🚶 Pedestrian dead-zone analysis
- 🎯 Recommended interventions
- 🏛️ City Council action items
- 📑 Executive memorandums
- 💬 Conversational climate Q&A

So instead of staring at a map, city officials can simply ask:

> *"Why should we prioritize this neighborhood?"*

---

# 🔊 4. Executive Audio Briefings

Using **ElevenLabs**, HeatShield converts climate insights into realistic executive audio briefings.

Templates include:

- 🚨 Emergency Heatwave Advisory
- 🏛️ City Council Briefing
- 🌳 Tree Canopy Equity Spotlight

Users can generate, play, visualize, and download the briefing directly from the dashboard.

---

# 💰 5. Fund the Fix — Powered by Solana

This is where HeatShield goes beyond a traditional climate dashboard.

Normally, a system might say:

> **"This intervention could help 3,200 people."**

We ask:

> **"Can someone fund it?"**

When a high-priority area is selected, HeatShield creates an intervention opportunity:

```text
🔴 HEAT INTERVENTION OPPORTUNITY

Southeast Raleigh
Heat Exposure: HIGH
Vulnerability: HIGH
Cooling Access: LOW

3,240 residents affected
1,870 vulnerable residents

Estimated Cost: $5,000

[ ❄️ FUND THIS INTERVENTION ]
```

Users can connect a Solana wallet, choose an amount, and sign the transaction.

```text
$5    $10    $25    $50

≈ 0.XX SOL

[ CONNECT WALLET ]

        ↓

[ FUND WITH SOLANA ]
```

After confirmation:

```text
✅ INTERVENTION FUNDED

Tract: Raleigh-042
Intervention: Cooling Center
Amount: 0.XX SOL

Projected Impact:
+2,740 people within 10-min access

[ VIEW TRANSACTION ]
```

### 🔗 Impact Memo

The funding record can be associated with an intervention:

```text
INTERVENTION
Cooling Center

LOCATION
Raleigh Tract 042

PROJECTED BENEFICIARIES
2,740

ACCESS IMPROVEMENT
+18%

FUNDER
Wallet: 8x...
```

This makes Solana a **funding + coordination layer**, rather than a decorative blockchain integration.

---

# 🌎 6. Heat Relief Impact Ledger

All funded interventions can be surfaced in a transparent impact ledger:

```text
┌─────────────────────────────────────────────┐
│           🌎 HEAT RELIEF LEDGER             │
├─────────────────────────────────────────────┤
│ ❄️ Cooling Center      0.50 SOL   2,740 ppl │
│ 🌳 Shade Intervention  0.20 SOL   1,120 ppl │
│ 💧 Water Station       0.15 SOL     830 ppl │
│ ❄️ Cooling Center      0.75 SOL   4,210 ppl │
├─────────────────────────────────────────────┤
│ TOTAL FUNDING        1.60 SOL               │
│ PEOPLE REACHED       8,900                  │
└─────────────────────────────────────────────┘
```

Now the blockchain provides a **transparent trail from climate need → intervention → funding → projected impact.**

---

# 🧩 Tech Stack

### Frontend
**React 19 · Vite · Leaflet · React-Leaflet · Lucide · Vanilla CSS**

### Backend
**Node.js · Express 5 · Axios · Dotenv**

### AI & Voice
**Google Gemini · ElevenLabs**

### Blockchain
**Solana · Wallet-based transaction signing · On-chain intervention records**

### Data
**248 Census Tracts · 746 OSM Cooling Assets · Raleigh Municipal Boundary**

---

# 📁 Project Structure

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

# 🚀 Run Locally

```bash
npm install
npm start
```

Or run the React development server:

```bash
npm run client
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Solana wallet configuration is used for user-signed funding transactions.

> 🔐 Never commit private keys or seed phrases.

---

# 🧠 The Big Picture

HeatShield connects the full climate-response loop:

```text
🌡️ DETECT HEAT
      ↓
👥 FIND VULNERABILITY
      ↓
🚶 FIND COOLING GAPS
      ↓
📍 PLAN INTERVENTION
      ↓
📊 SIMULATE IMPACT
      ↓
🤖 AI RECOMMENDATION
      ↓
💰 FUND THE FIX
      ↓
🔗 TRACK IMPACT
```

### **HeatShield doesn't just show the problem.**

## **It helps decide what to do — and gives people a way to fund it.** 🌎❄️

**Built for Raleigh, NC 🇺🇸**

**React · Node.js · Leaflet · Gemini · ElevenLabs · Solana**