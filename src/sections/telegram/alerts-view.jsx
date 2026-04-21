'use client';




// Reuse the alerts view structure from instagram
import { AlertsView } from '../alerts/view';

// ----------------------------------------------------------------------

export function TelegramAlertsView() {
  // For now, reuse the same alerts view — in the future, filter by platform
  return <AlertsView />;
}
