// In-memory alert management service for Raleigh heat emergencies
let alerts = [
  {
    id: 'ALERT-101',
    category: 'Heat Exhaustion',
    urgency: 'CRITICAL',
    reporterName: 'Marcus Bell (Transit Rider)',
    address: 'Moore Square Bus Station, 214 S Blount St, Raleigh',
    lat: 35.7779,
    lon: -78.6367,
    tract_geoid: '37183050100',
    description: 'Two elderly passengers experiencing severe dizziness in unshaded bus shelter. No water available.',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    assignedUnit: null
  },
  {
    id: 'ALERT-102',
    category: 'Vulnerable Senior at Risk',
    urgency: 'HIGH',
    reporterName: 'Southeast Raleigh Health Worker',
    address: 'Walnut Terrace Senior Living, 1250 S State St, Raleigh',
    lat: 35.7665,
    lon: -78.6335,
    tract_geoid: '37183050600',
    description: 'Partial A/C failure in building B. 14 senior residents need indoor refuge or hydration.',
    timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    status: 'DISPATCHED',
    assignedUnit: 'Mobile Cooling Unit #2 (En Route)'
  },
  {
    id: 'ALERT-103',
    category: 'Cooling Center Overcapacity',
    urgency: 'HIGH',
    reporterName: 'Staff at John Chavis Community Center',
    address: '505 Martin Luther King Jr Blvd, Raleigh',
    lat: 35.7712,
    lon: -78.6271,
    tract_geoid: '37183050600',
    description: 'Indoor cooling capacity reached 100%. Requesting supplemental misting tent and bottled water.',
    timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    assignedUnit: null
  },
  {
    id: 'ALERT-104',
    category: 'Outdoor Worker Distress',
    urgency: 'MODERATE',
    reporterName: 'City Maintenance Crew',
    address: 'Garner Road & Peterson St Corridor, Raleigh',
    lat: 35.7580,
    lon: -78.6290,
    tract_geoid: '37183050800',
    description: 'Asphalt temperature exceeding 118°F. Requested mobile hydration supply.',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    status: 'RESOLVED',
    assignedUnit: 'Hydration Van #1'
  }
];

function getAlerts() {
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const dispatchedCount = alerts.filter(a => a.status === 'DISPATCHED').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  return {
    alerts,
    counts: {
      total: alerts.length,
      active: activeCount,
      dispatched: dispatchedCount,
      resolved: resolvedCount,
      critical: alerts.filter(a => a.urgency === 'CRITICAL' && a.status !== 'RESOLVED').length
    }
  };
}

function createAlert(data) {
  const newAlert = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    category: data.category || 'High Heat Exposure',
    urgency: data.urgency || 'HIGH',
    reporterName: data.reporterName || 'Community Citizen',
    address: data.address || 'Raleigh, NC',
    lat: parseFloat(data.lat) || 35.7796,
    lon: parseFloat(data.lon) || -78.6382,
    tract_geoid: data.tract_geoid || null,
    description: data.description || 'Citizen reported severe heat stress in neighborhood.',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    assignedUnit: null
  };

  alerts.unshift(newAlert);
  return newAlert;
}

function dispatchUnit(id, unitName = 'Mobile Cooling Unit #1') {
  const alert = alerts.find(a => a.id === id);
  if (!alert) return null;
  alert.status = 'DISPATCHED';
  alert.assignedUnit = unitName;
  return alert;
}

function resolveAlert(id) {
  const alert = alerts.find(a => a.id === id);
  if (!alert) return null;
  alert.status = 'RESOLVED';
  return alert;
}

module.exports = {
  getAlerts,
  createAlert,
  dispatchUnit,
  resolveAlert
};
