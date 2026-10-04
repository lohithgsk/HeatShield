// War Room Predictive Simulation Service for Server

const WAR_ROOM_SCENARIOS = [
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
      criticalBreachTracts: 24,
      blackoutProbabilityPct: 65,
      projectedEconomicLoss: 8400000
    }
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
    synopsis: 'Excessive air conditioning load coupled with transmission line sag threatens the Garner Road & Southeast Raleigh substations.',
    baselineImpacts: {
      predictedCasualties: 74,
      predictedErVisits: 520,
      unservedVulnerableAtRisk: 46200,
      criticalBreachTracts: 31,
      blackoutProbabilityPct: 88,
      projectedEconomicLoss: 14200000
    }
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
    synopsis: 'A stagnant tropical air mass anchors overnight lows above 85°F for 120 consecutive hours.',
    baselineImpacts: {
      predictedCasualties: 62,
      predictedErVisits: 440,
      unservedVulnerableAtRisk: 41000,
      criticalBreachTracts: 26,
      blackoutProbabilityPct: 45,
      projectedEconomicLoss: 11500000
    }
  }
];

function getScenarios() {
  return WAR_ROOM_SCENARIOS;
}

function getScenarioById(id) {
  return WAR_ROOM_SCENARIOS.find(s => s.id === id) || null;
}

module.exports = {
  WAR_ROOM_SCENARIOS,
  getScenarios,
  getScenarioById
};
