// Heatwave War Room - Predictive Simulation & Pre-Emptive Playbook Engine
// Answers: "What happens if Raleigh gets hit tomorrow?" & "What should Raleigh do NOW to change that outcome?"

export const WAR_ROOM_SCENARIOS = [
  {
    id: 'super-heatdome-tomorrow',
    name: 'Category 4 Super Heat Dome (+14°F Anomaly)',
    badge: 'High Impact / Imminent',
    leadTimeHours: 24,
    forecastDate: 'Tomorrow · 14:00 - 19:00 EDT',
    ambientPeakTempF: 106.8,
    heatIndexPeakF: 114.2,
    overnightMinTempF: 86.5,
    humidityPct: 68,
    gridStressLevel: 'Severe (94% Peak Demand)',
    synopsis: 'A stalled subtropical ridge is projected to compress air directly over Wake County tomorrow afternoon. Solar radiation will superheat asphalt corridors while high humidity prevents human evaporative sweating.',
    baselineImpacts: {
      predictedCasualties: 48,
      predictedErVisits: 385,
      unservedVulnerableAtRisk: 38400,
      criticalBreachTracts: 24, // Tracts exceeding 104°F with 0 cooling reach
      blackoutProbabilityPct: 65,
      projectedEconomicLoss: 8400000 // $8.4M
    },
    threatTracts: [
      { geoid: '37183050600', name: 'Southeast Raleigh / Chavis Park', predictedTemp: 108.4, vulnPop: 4210, reason: 'Zero canopy buffer, 68% asphalt, high elderly density' },
      { geoid: '37183050801', name: 'Rock Quarry Road / Bragg St', predictedTemp: 107.9, vulnPop: 3890, reason: 'Priority dead zone, 1,420m to nearest indoor cooling' },
      { geoid: '371830504002', name: 'Downtown Core / Moore Square', predictedTemp: 109.1, vulnPop: 2980, reason: 'Extreme urban heat island amplification, homeless exposure' },
      { geoid: '37183052701', name: 'New Bern Ave / East Raleigh Corridor', predictedTemp: 106.5, vulnPop: 3450, reason: 'Heavy bus pedestrian traffic without shade coverage' },
      { geoid: '37183053709', name: 'Capital Blvd Light Industrial', predictedTemp: 108.0, vulnPop: 2100, reason: 'Impervious roof cluster, unconditioned warehouse housing' }
    ]
  },
  {
    id: 'blackout-compound-crisis',
    name: 'Compound Heat + Substation Failure Cascade',
    badge: 'Infrastructure Failure',
    leadTimeHours: 18,
    forecastDate: 'Tomorrow · 16:30 EDT',
    ambientPeakTempF: 103.5,
    heatIndexPeakF: 112.0,
    overnightMinTempF: 84.0,
    humidityPct: 62,
    gridStressLevel: 'Critical (Grid Failure Imminent)',
    synopsis: 'Excessive air conditioning load coupled with transmission line sag threatens the Garner Road & Southeast Raleigh substations. If trips occur, 22,000 residents lose A/C during triple-digit heat.',
    baselineImpacts: {
      predictedCasualties: 74,
      predictedErVisits: 520,
      unservedVulnerableAtRisk: 46200,
      criticalBreachTracts: 31,
      blackoutProbabilityPct: 88,
      projectedEconomicLoss: 14200000
    },
    threatTracts: [
      { geoid: '37183050600', name: 'Southeast Raleigh / Chavis Park', predictedTemp: 108.0, vulnPop: 4210, reason: 'Substation node at 104% rated capacity' },
      { geoid: '37183050801', name: 'Rock Quarry Road / Garner Corridor', predictedTemp: 107.2, vulnPop: 3890, reason: 'Secondary feeder overload risk' },
      { geoid: '37183051400', name: 'Midtown Commercial Grid', predictedTemp: 105.8, vulnPop: 2600, reason: 'High commercial chiller demand' }
    ]
  },
  {
    id: 'nocturnal-trap-5day',
    name: 'Prolonged 5-Day Nocturnal Heat Trap',
    badge: 'Chronic Physiological Trap',
    leadTimeHours: 36,
    forecastDate: 'Starting Tomorrow · 5-Day Window',
    ambientPeakTempF: 101.5,
    heatIndexPeakF: 109.4,
    overnightMinTempF: 88.2,
    humidityPct: 75,
    gridStressLevel: 'Moderate (Continuous)',
    synopsis: 'A stagnant tropical air mass anchors overnight lows above 85°F for 120 consecutive hours. Human cardiovascular systems cannot reset at night, driving cumulative mortality in unconditioned residences.',
    baselineImpacts: {
      predictedCasualties: 62,
      predictedErVisits: 440,
      unservedVulnerableAtRisk: 41000,
      criticalBreachTracts: 26,
      blackoutProbabilityPct: 45,
      projectedEconomicLoss: 11500000
    },
    threatTracts: [
      { geoid: '37183050600', name: 'Southeast Raleigh High-Density Residential', predictedTemp: 104.2, vulnPop: 4210, reason: 'Porous brick & asphalt retain nocturnal heat past 3 AM' },
      { geoid: '371830504002', name: 'Downtown Central Apartments', predictedTemp: 105.1, vulnPop: 2980, reason: 'Zero natural night ventilation' }
    ]
  }
];

// Pre-Emptive Action Playbook - Counter-Measures Planners Can Take NOW
export const PREEMPTIVE_ACTIONS = [
  {
    id: 'mobile_misting_fleet',
    name: 'Deploy 8 Emergency Mobile Misting & Hydration Fleets',
    category: 'Rapid Spatial Deployment',
    timeline: 'Within 6 Hours',
    costUsd: 24000,
    icon: 'Droplets',
    description: 'Dispatch high-pressure misting trailers, shaded pop-up gazebos, and cold hydration stations directly into the top 5 dead zone intersections.',
    targetCoords: [
      { name: 'Chavis Way & Martin Luther King Jr Blvd', lat: 35.7712, lon: -78.6271 },
      { name: 'Rock Quarry Rd & Bragg St', lat: 35.7580, lon: -78.6180 },
      { name: 'Moore Square Transit Station', lat: 35.7785, lon: -78.6360 },
      { name: 'New Bern Ave & Poole Rd', lat: 35.7830, lon: -78.5990 },
      { name: 'Garner Rd & Peterson St', lat: 35.7480, lon: -78.6340 }
    ],
    impact: {
      casualtyReductionPct: 28,
      erVisitReductionPct: 24,
      vulnProtectedCount: 13800,
      tempReliefDeltaF: -4.5,
      economicSavingsUsd: 1800000
    }
  },
  {
    id: 'extended_cooling_centers_24_7',
    name: 'Mandate 24/7 Extended Operations at 14 Cooling Centers',
    category: 'Civic Infrastructure',
    timeline: 'Within 12 Hours',
    costUsd: 42000,
    icon: 'Building2',
    description: 'Keep all Wake County libraries and community centers open continuously overnight with staff, backup diesel generators, cots, and bottled water.',
    impact: {
      casualtyReductionPct: 35,
      erVisitReductionPct: 32,
      vulnProtectedCount: 16400,
      tempReliefDeltaF: -18.0, // Indoors
      economicSavingsUsd: 2600000
    }
  },
  {
    id: 'free_transit_cooling_shuttles',
    name: 'Activate GoRaleigh Free "Cooling Loop" Express Shuttles',
    category: 'Equitable Mobility',
    timeline: 'Within 8 Hours',
    costUsd: 18500,
    icon: 'Bus',
    description: 'Convert 12 GoRaleigh air-conditioned buses into dedicated free circular shuttle routes picking up unserved dead zone residents and transporting them directly to regional cooling centers.',
    shuttleRoutes: [
      { name: 'Southeast Raleigh Dead-Zone Loop (Chavis ➔ Tarboro CC)', path: [[35.7712, -78.6271], [35.7650, -78.6150], [35.7790, -78.6120]] },
      { name: 'Rock Quarry Corridor Shuttle (Bragg St ➔ Worthdale CC)', path: [[35.7580, -78.6180], [35.7500, -78.6050], [35.7420, -78.5950]] }
    ],
    impact: {
      casualtyReductionPct: 22,
      erVisitReductionPct: 20,
      vulnProtectedCount: 11200,
      tempReliefDeltaF: -12.0,
      economicSavingsUsd: 1400000
    }
  },
  {
    id: 'substation_resilience_generators',
    name: 'Pre-Position Emergency Substation Generators & Load-Balancing',
    category: 'Power Grid Defense',
    timeline: 'Within 16 Hours',
    costUsd: 55000,
    icon: 'Zap',
    description: 'Partner with Duke Energy Carolinas to pre-stage 2.5 MW mobile diesel generators at the Southeast Raleigh & Garner Road substations to prevent rolling brownouts.',
    impact: {
      casualtyReductionPct: 18,
      erVisitReductionPct: 15,
      vulnProtectedCount: 22000,
      blackoutRiskDropPct: 75,
      economicSavingsUsd: 3200000
    }
  },
  {
    id: 'door_to_door_senior_checks',
    name: 'Mobilize 150-Person Community Health Alert Corps',
    category: 'Direct Human Outreach',
    timeline: 'Within 4 Hours',
    costUsd: 12000,
    icon: 'Users',
    description: 'Coordinate Wake County EMS, Red Cross, and local volunteers to conduct direct door-to-door welfare checks on 4,200 isolated seniors living in pre-1980 housing without central A/C.',
    impact: {
      casualtyReductionPct: 26,
      erVisitReductionPct: 22,
      vulnProtectedCount: 8400,
      tempReliefDeltaF: 0,
      economicSavingsUsd: 1900000
    }
  }
];

// Helper to compute combined mitigated metrics when specific action IDs are checked
export function computeWarRoomMitigation(scenario, activeActionIds) {
  const base = scenario.baselineImpacts;
  const activeActions = PREEMPTIVE_ACTIONS.filter(a => activeActionIds.includes(a.id));

  if (activeActions.length === 0) {
    return {
      casualties: base.predictedCasualties,
      erVisits: base.predictedErVisits,
      unservedAtRisk: base.unservedVulnerableAtRisk,
      blackoutProb: base.blackoutProbabilityPct,
      totalCostUsd: 0,
      totalSavingsUsd: 0,
      netRoiRatio: 0,
      casualtiesPrevented: 0,
      erVisitsAverted: 0,
      residentsProtected: 0,
      percentRiskReduction: 0
    };
  }

  // Calculate compound reductions (using diminishing return multiplication so it never exceeds 92%)
  let remainingCasualtyRatio = 1.0;
  let remainingErRatio = 1.0;
  let totalCost = 0;
  let totalSavings = 0;
  let residentsProtected = 0;
  let blackoutRiskDrop = 0;

  activeActions.forEach(a => {
    remainingCasualtyRatio *= (1 - (a.impact.casualtyReductionPct / 100));
    remainingErRatio *= (1 - (a.impact.erVisitReductionPct / 100));
    totalCost += a.costUsd;
    totalSavings += a.impact.economicSavingsUsd;
    residentsProtected += a.impact.vulnProtectedCount;
    if (a.impact.blackoutRiskDropPct) {
      blackoutRiskDrop += a.impact.blackoutRiskDropPct;
    }
  });

  // Clamp reduction between 0% and 88%
  const casualtyReduction = 1 - Math.max(0.12, remainingCasualtyRatio);
  const erReduction = 1 - Math.max(0.15, remainingErRatio);

  const mitigatedCasualties = Math.max(2, Math.round(base.predictedCasualties * (1 - casualtyReduction)));
  const mitigatedEr = Math.max(15, Math.round(base.predictedErVisits * (1 - erReduction)));
  const casualtiesPrevented = base.predictedCasualties - mitigatedCasualties;
  const erAverted = base.predictedErVisits - mitigatedEr;

  const mitigatedBlackout = Math.max(5, Math.round(base.blackoutProbabilityPct * (1 - Math.min(0.85, blackoutRiskDrop / 100))));
  const unservedRemaining = Math.max(1200, Math.round(base.unservedVulnerableAtRisk - residentsProtected * 0.65));

  const roi = totalCost > 0 ? (totalSavings / totalCost).toFixed(1) : 0;
  const percentReduction = Math.round(casualtyReduction * 100);

  return {
    casualties: mitigatedCasualties,
    erVisits: mitigatedEr,
    unservedAtRisk: unservedRemaining,
    blackoutProb: mitigatedBlackout,
    totalCostUsd: totalCost,
    totalSavingsUsd: totalSavings,
    netRoiRatio: roi,
    casualtiesPrevented,
    erVisitsAverted: erAverted,
    residentsProtected: Math.min(base.unservedVulnerableAtRisk, residentsProtected),
    percentRiskReduction: percentReduction
  };
}
