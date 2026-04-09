'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.cluster}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.count} پیج</Box>
    </Box>
  );
}

export function ClusterRadarChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="خوشه‌بندی معنایی" icon="solar:atom-bold-duotone" info="توزیع پیج‌ها در خوشه‌های معنایی">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ cluster: item.cluster || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartCard
      title="خوشه‌بندی معنایی"
      icon="solar:atom-bold-duotone"
      info="پیج‌های هم‌سو در یک خوشه قرار می‌گیرند. خوشه‌های بزرگ‌تر = هم‌گرایی بیشتر"
    >
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <YAxis type="category" dataKey="cluster" width={100} tick={{ fontSize: 10, fill: theme.palette.text.primary }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={theme.palette.secondary.main} radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
