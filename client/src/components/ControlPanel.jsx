import React from 'react';
import PlannerAnalyticsPanel from './PlannerAnalyticsPanel';
import EmergencyResponsePanel from './EmergencyResponsePanel';
import CommunityCitizenPanel from './CommunityCitizenPanel';

export default function ControlPanel(props) {
  const { persona } = props;

  if (persona === 'Emergency Management & Public Health') {
    return <EmergencyResponsePanel {...props} />;
  }

  if (persona === 'Community Advocates & Citizens') {
    return <CommunityCitizenPanel {...props} />;
  }

  // Default to City Planners view
  return <PlannerAnalyticsPanel {...props} />;
}
