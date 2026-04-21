'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGroupedAlerts } from 'src/api/strategic-alerts';

import { Iconify } from 'src/components/iconify';

// Reuse the alerts view structure from instagram
import { AlertsView } from '../alerts/view';

// ----------------------------------------------------------------------

export function TelegramAlertsView() {
  // For now, reuse the same alerts view — in the future, filter by platform
  return <AlertsView />;
}
