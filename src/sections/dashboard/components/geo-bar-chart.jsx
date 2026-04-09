'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600 }}>{d.country}</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{d.count} پیج</Box>
    </Box>
  );
}

export function GeoBarChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="توزیع جغرافیایی" icon="solar:globe-bold-duotone" info="پراکندگی جغرافیایی پیج‌ها بر اساس کشور">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ country: item.country || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartCard
      title="توزیع جغرافیایی"
      icon="solar:globe-bold-duotone"
      info="پراکندگی جغرافیایی پیج‌ها — حس وسعت امپراتوری رسانه‌ای"
    >
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
            <XAxis type="number" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
            <YAxis type="category" dataKey="country" width={70} tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill={theme.palette.info.main} radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
