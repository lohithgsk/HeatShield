// Historical Heat Waves & El Nino Teleconnection Modeling Service

const HISTORICAL_HEATWAVES = [
  {
    id: 'elnino-1998',
    name: '1998 Super El Niño Heat Dome',
    year: 1998,
    badge: 'Flagship Event',
    ensoPhase: 'Super El Niño (Oceanic Niño Index +2.4°C)',
    noaaAnomaly: '+7.8°F vs Normal',
    summary: 'The landmark 1997–1998 "Godzilla" El Niño produced an unprecedented subtropical ridge that stalled over the Carolinas during Summer 1998, locking in triple-digit heat and nocturnal traps.',
    description: 'During Summer 1998, planetary-scale teleconnections from the historic 1997–1998 Super El Niño displaced the jet stream northward, anchoring a massive subtropical high pressure heat dome over the Southeastern United States. In Raleigh, daytime surface temperatures surged beyond 104°F, while nocturnal cooling completely collapsed in impervious urban zones, creating the deadliest heat wave in modern North Carolina records.',
    keyStats: {
      peakTemp: '106.4°F',
      avgAnomaly: '+5.4°F',
      durationDays: 14,
      hospitalSurge: '+420%',
      uhiDifferential: '14.2°F'
    },
    steps: [
      {
        stepIndex: 0,
        label: 'Day 1 · 10:00 EDT',
        phase: 'Subtropical Ridge Advection',
        baseTempF: 88.5,
        anomalyF: 2.2,
        uhiMultiplier: 0.6,
        canopyMitigation: 0.5,
        raleighAvgTemp: 89.2,
        downtownTemp: 92.4,
        umsteadTemp: 85.1,
        distressCallsCount: 3,
        vulnerableAtRisk: 14200,
        gridLoadPct: 74,
        narrative: 'A persistent high-pressure ridge begins encroaching from the Gulf of Mexico. Atmospheric subsidence compresses air, suppressing cloud formation and initiating rapid solar heating.'
      },
      {
        stepIndex: 1,
        label: 'Day 2 · 14:00 EDT',
        phase: 'Atmospheric Stagnation & Compression',
        baseTempF: 94.2,
        anomalyF: 4.5,
        uhiMultiplier: 0.8,
        canopyMitigation: 0.65,
        raleighAvgTemp: 95.8,
        downtownTemp: 99.6,
        umsteadTemp: 90.3,
        distressCallsCount: 9,
        vulnerableAtRisk: 28600,
        gridLoadPct: 86,
        narrative: 'Wind speeds drop below 3 mph across Wake County. Thermal radiation accumulates rapidly in asphalt corridors. Tree canopy deficit in Southeast Raleigh begins driving microclimate separation.'
      },
      {
        stepIndex: 2,
        label: 'Day 3 · 16:30 EDT',
        phase: 'Super El Niño Peak Heat Dome',
        baseTempF: 101.8,
        anomalyF: 7.8,
        uhiMultiplier: 1.25,
        canopyMitigation: 0.85,
        raleighAvgTemp: 103.4,
        downtownTemp: 106.4,
        umsteadTemp: 94.2,
        distressCallsCount: 28,
        vulnerableAtRisk: 52400,
        gridLoadPct: 98,
        narrative: 'Peak solar forcing under the core of the El Niño heat dome. Downtown Raleigh and commercial corridors cross 106°F. Priority dead zones experience severe compound thermal exposure.'
      },
      {
        stepIndex: 3,
        label: 'Day 3 · 23:30 EDT',
        phase: 'Severe Nocturnal Heat Trap',
        baseTempF: 84.1,
        anomalyF: 6.9,
        uhiMultiplier: 1.4,
        canopyMitigation: 0.9,
        raleighAvgTemp: 85.6,
        downtownTemp: 90.1,
        umsteadTemp: 76.5,
        distressCallsCount: 19,
        vulnerableAtRisk: 46800,
        gridLoadPct: 89,
        narrative: 'Critical nocturnal urban heat island failure: impervious surfaces re-radiate stored heat into humid nighttime air. Minimum temperatures in high-density census tracts fail to fall below 88°F.'
      },
      {
        stepIndex: 4,
        label: 'Day 4 · 15:00 EDT',
        phase: 'Accumulated Thermal Stress & EMS Surge',
        baseTempF: 103.5,
        anomalyF: 8.4,
        uhiMultiplier: 1.35,
        canopyMitigation: 0.95,
        raleighAvgTemp: 104.8,
        downtownTemp: 107.8,
        umsteadTemp: 95.1,
        distressCallsCount: 42,
        vulnerableAtRisk: 61200,
        gridLoadPct: 102,
        narrative: 'Fourth consecutive day of extreme heat. Human biological threshold exceeded in unairconditioned housing. 911 dispatch calls surge +420% for hyperthermia, cardiac strain, and dehydration.'
      },
      {
        stepIndex: 5,
        label: 'Day 5 · 17:00 EDT',
        phase: 'Maximum Microclimate Divergence',
        baseTempF: 102.0,
        anomalyF: 7.6,
        uhiMultiplier: 1.45,
        canopyMitigation: 1.1,
        raleighAvgTemp: 103.2,
        downtownTemp: 108.1,
        umsteadTemp: 93.9,
        distressCallsCount: 31,
        vulnerableAtRisk: 54100,
        gridLoadPct: 95,
        narrative: 'A staggering 14.2°F thermal delta separates high-canopy Umstead State Park (93.9°F) from concrete-heavy Downtown and Southeast Raleigh (108.1°F), proving the vital role of urban tree cover.'
      },
      {
        stepIndex: 6,
        label: 'Day 6 · 18:00 EDT',
        phase: 'Maritime Boundary Relief',
        baseTempF: 83.2,
        anomalyF: -1.2,
        uhiMultiplier: 0.4,
        canopyMitigation: 0.4,
        raleighAvgTemp: 83.8,
        downtownTemp: 85.4,
        umsteadTemp: 80.9,
        distressCallsCount: 4,
        vulnerableAtRisk: 8900,
        gridLoadPct: 62,
        narrative: 'An Atlantic maritime cold front sweeps through the Piedmont, fracturing the heat dome. Surface temperatures plummet 20°F within two hours, concluding the historic crisis.'
      }
    ]
  },
  {
    id: 'elnino-2016',
    name: '2015–2016 Global El Niño Crisis',
    year: 2016,
    badge: 'Very Strong El Niño',
    ensoPhase: 'Strong El Niño (Oceanic Niño Index +2.6°C)',
    noaaAnomaly: '+6.5°F vs Normal',
    summary: 'The 2015–2016 El Niño drove Raleigh to 24 days above 90°F in July alone, pairing extreme humidity with prolonged urban core heat stagnation.',
    description: 'Tied with 1997–98 as the strongest El Niño in modern instrumentation, this event triggered global atmospheric circulation anomalies that drove high dewpoints (76°F+) and heat index values exceeding 110°F across Wake County.',
    keyStats: {
      peakTemp: '104.2°F',
      avgAnomaly: '+4.8°F',
      durationDays: 11,
      hospitalSurge: '+310%',
      uhiDifferential: '12.6°F'
    },
    steps: [
      {
        stepIndex: 0,
        label: 'Phase 1 · Onset',
        phase: 'Equatorial Heat Advection',
        baseTempF: 90.1,
        anomalyF: 2.8,
        uhiMultiplier: 0.7,
        canopyMitigation: 0.5,
        raleighAvgTemp: 91.2,
        downtownTemp: 94.6,
        umsteadTemp: 86.8,
        distressCallsCount: 5,
        vulnerableAtRisk: 18200,
        gridLoadPct: 78,
        narrative: 'Tropical heat plume advances inland. Humidity spikes to 78% relative humidity.'
      },
      {
        stepIndex: 1,
        label: 'Phase 2 · Compression',
        phase: 'Heat Dome Lock-in',
        baseTempF: 96.4,
        anomalyF: 5.1,
        uhiMultiplier: 0.95,
        canopyMitigation: 0.7,
        raleighAvgTemp: 97.9,
        downtownTemp: 102.1,
        umsteadTemp: 91.5,
        distressCallsCount: 14,
        vulnerableAtRisk: 34500,
        gridLoadPct: 91,
        narrative: 'High humidity traps infrared radiation. Heat index crosses 105°F across 80% of Raleigh.'
      },
      {
        stepIndex: 2,
        label: 'Phase 3 · Peak Dome',
        phase: 'Triple-Digit Maximum',
        baseTempF: 101.2,
        anomalyF: 7.2,
        uhiMultiplier: 1.2,
        canopyMitigation: 0.85,
        raleighAvgTemp: 102.9,
        downtownTemp: 105.8,
        umsteadTemp: 93.8,
        distressCallsCount: 32,
        vulnerableAtRisk: 53100,
        gridLoadPct: 99,
        narrative: 'Urban corridors reach peak heat index of 111°F. Emergency cooling center activations expand.'
      },
      {
        stepIndex: 3,
        label: 'Phase 4 · Night Stagnation',
        phase: 'Tropical Dewpoint Trap',
        baseTempF: 83.5,
        anomalyF: 6.2,
        uhiMultiplier: 1.3,
        canopyMitigation: 0.8,
        raleighAvgTemp: 84.8,
        downtownTemp: 88.9,
        umsteadTemp: 77.2,
        distressCallsCount: 22,
        vulnerableAtRisk: 42000,
        gridLoadPct: 87,
        narrative: 'Nighttime temperatures remain dangerous for senior citizens without central air conditioning.'
      },
      {
        stepIndex: 4,
        label: 'Phase 5 · Relief Passage',
        phase: 'Thunderstorm Outflow',
        baseTempF: 85.0,
        anomalyF: 0.5,
        uhiMultiplier: 0.5,
        canopyMitigation: 0.4,
        raleighAvgTemp: 85.8,
        downtownTemp: 87.5,
        umsteadTemp: 82.1,
        distressCallsCount: 6,
        vulnerableAtRisk: 11000,
        gridLoadPct: 68,
        narrative: 'Convective thunderstorm cluster sweeps through, venting the urban boundary layer.'
      }
    ]
  },
  {
    id: 'elnino-2023',
    name: '2023–2024 Record El Niño Event',
    year: 2024,
    badge: 'Modern Record',
    ensoPhase: 'Extreme El Niño + Marine Heatwave',
    noaaAnomaly: '+8.1°F vs Normal',
    summary: 'The hottest meteorological summer on global instrumental record, pairing strong El Niño atmospheric forcing with record Atlantic sea surface temperatures.',
    description: 'During Summer 2023–2024, compounded climate anomalies generated unprecedented thermal loads. Dense urban census tracts in Raleigh experienced heat index values of 114°F, demonstrating compound risk in unserved dead zones.',
    keyStats: {
      peakTemp: '107.1°F',
      avgAnomaly: '+6.1°F',
      durationDays: 16,
      hospitalSurge: '+460%',
      uhiDifferential: '15.1°F'
    },
    steps: [
      {
        stepIndex: 0,
        label: 'Onset · Day 1',
        phase: 'Planetary Heat Teleconnection',
        baseTempF: 92.5,
        anomalyF: 3.5,
        uhiMultiplier: 0.75,
        canopyMitigation: 0.55,
        raleighAvgTemp: 93.8,
        downtownTemp: 97.4,
        umsteadTemp: 88.2,
        distressCallsCount: 7,
        vulnerableAtRisk: 22100,
        gridLoadPct: 82,
        narrative: 'Compound marine heatwave and El Niño teleconnections induce early-season high pressure.'
      },
      {
        stepIndex: 1,
        label: 'Peak Max · Day 3',
        phase: 'Record Solar Insolation',
        baseTempF: 104.2,
        anomalyF: 8.6,
        uhiMultiplier: 1.35,
        canopyMitigation: 0.95,
        raleighAvgTemp: 105.8,
        downtownTemp: 109.2,
        umsteadTemp: 95.8,
        distressCallsCount: 39,
        vulnerableAtRisk: 58900,
        gridLoadPct: 104,
        narrative: 'Hottest hour on record in Raleigh metro. Pavement temperatures exceed 145°F.'
      },
      {
        stepIndex: 2,
        label: 'Night Trap · Day 3',
        phase: 'Midnight Concrete Re-radiation',
        baseTempF: 86.8,
        anomalyF: 7.9,
        uhiMultiplier: 1.45,
        canopyMitigation: 0.9,
        raleighAvgTemp: 88.2,
        downtownTemp: 93.1,
        umsteadTemp: 78.4,
        distressCallsCount: 26,
        vulnerableAtRisk: 49500,
        gridLoadPct: 92,
        narrative: 'Downtown core stays over 93°F past midnight due to high thermal mass of buildings.'
      },
      {
        stepIndex: 3,
        label: 'Recovery · Day 5',
        phase: 'Post-Frontal Advection',
        baseTempF: 84.5,
        anomalyF: -0.2,
        uhiMultiplier: 0.45,
        canopyMitigation: 0.4,
        raleighAvgTemp: 85.1,
        downtownTemp: 87.0,
        umsteadTemp: 81.6,
        distressCallsCount: 5,
        vulnerableAtRisk: 9500,
        gridLoadPct: 65,
        narrative: 'Trough sweeps humidity offshore; temperatures stabilize to seasonal normals.'
      }
    ]
  },
  {
    id: 'heatwave-2011',
    name: 'July 2011 Carolina Mega-Heatwave',
    year: 2011,
    badge: 'Station Record',
    ensoPhase: 'Severe Continental Heat Dome',
    noaaAnomaly: '+9.2°F vs Normal',
    summary: 'Raleigh recorded its all-time official temperature record of 105.0°F at RDU Airport, triggering widespread emergency response.',
    description: 'In late July 2011, a historic high-pressure cell stagnated over North Carolina. State emergency management activated cooling shelters while pavement buckled across central NC.',
    keyStats: {
      peakTemp: '107.8°F',
      avgAnomaly: '+6.8°F',
      durationDays: 8,
      hospitalSurge: '+380%',
      uhiDifferential: '13.8°F'
    },
    steps: [
      {
        stepIndex: 0,
        label: 'Day 1 · Ridge Build',
        phase: 'Continental Air Mass Inflow',
        baseTempF: 93.0,
        anomalyF: 4.1,
        uhiMultiplier: 0.8,
        canopyMitigation: 0.6,
        raleighAvgTemp: 94.5,
        downtownTemp: 98.2,
        umsteadTemp: 88.9,
        distressCallsCount: 8,
        vulnerableAtRisk: 24000,
        gridLoadPct: 85,
        narrative: 'Continental high pressure establishes over the Appalachian lee trough.'
      },
      {
        stepIndex: 1,
        label: 'Day 2 · All-Time Record',
        phase: 'Historic 105°F Benchmark',
        baseTempF: 105.0,
        anomalyF: 9.2,
        uhiMultiplier: 1.3,
        canopyMitigation: 0.95,
        raleighAvgTemp: 106.5,
        downtownTemp: 109.8,
        umsteadTemp: 96.0,
        distressCallsCount: 45,
        vulnerableAtRisk: 63500,
        gridLoadPct: 105,
        narrative: 'All-time official weather station record tied at 105°F. Critical dead zones hit maximum triage.'
      },
      {
        stepIndex: 2,
        label: 'Day 3 · Frontal Relief',
        phase: 'Severe T-Storm Front',
        baseTempF: 86.2,
        anomalyF: 0.8,
        uhiMultiplier: 0.5,
        canopyMitigation: 0.45,
        raleighAvgTemp: 86.9,
        downtownTemp: 89.1,
        umsteadTemp: 83.2,
        distressCallsCount: 6,
        vulnerableAtRisk: 10200,
        gridLoadPct: 70,
        narrative: 'Severe squall line breaks the ridge, ending the historic heat wave.'
      }
    ]
  }
];

function getAllEvents() {
  return HISTORICAL_HEATWAVES;
}

function getEventById(id) {
  return HISTORICAL_HEATWAVES.find(e => e.id === id) || null;
}

module.exports = {
  HISTORICAL_HEATWAVES,
  getAllEvents,
  getEventById
};
