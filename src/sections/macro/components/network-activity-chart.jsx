'use client';

import { Area, XAxis, YAxis, Tooltip, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useNetworkPulse } from 'src/api/analytics';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>ساعت {d.hour}:00</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.post_count} پست</Box>
    </Box>
  );
}

export function NetworkActivityChart() {
  const theme = useTheme();
  const { data, isLoading } = useNetworkPulse();

  if (isLoading) {
    return (
      <ChartCard title="فعالیت ۲۴ ساعته شبکه" icon="solar:pulse-bold-duotone" info="حجم فعالیت شبکه در ۲۴ ساعت اخیر به تفکیک ساعت">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((item) => ({
    hour: Number(item.hour),
    post_count: Number(item.post_count),
  }));

  return (
    <ChartCard
      title="فعالیت ۲۴ ساعته شبکه"
      icon="solar:pulse-bold-duotone"
      info="نمودار ضربان شبکه — ساعات اوج فعالیت و سکوت"
    >
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={items} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="post_count" stroke={theme.palette.primary.main} fill="url(#pulseGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
