'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.date}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>احساس: {Number(d.avg_sentiment).toFixed(2)}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.post_count} پست</Box>
    </Box>
  );
}

export function SentimentTimeline({ data }) {
  const theme = useTheme();
  const items = data || [];

  if (items.length === 0) {
    return (
      <ChartCard title="تایم‌لاین احساسات" icon="solar:graph-bold-duotone" info="نوسان لحن محتوا در طول زمان — بالای صفر: امیدوار، زیر صفر: خشمگین">
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
          داده‌ای موجود نیست
        </Box>
      </ChartCard>
    );
  }

  const chartData = items.map((item) => ({
    ...item,
    avg_sentiment: Number(item.avg_sentiment) || 0,
    post_count: Number(item.post_count) || 0,
  }));

  return (
    <ChartCard
      title="تایم‌لاین تغییر فاز"
      icon="solar:graph-bold-duotone"
      info="نوسان احساسات در طول زمان. بالای خط صفر = امیدوار، زیر خط = خشمگین/غمگین. نقاط عطف نشان‌دهنده تغییر لحن پیج هستند."
    >
      <Box sx={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                <stop offset="50%" stopColor={theme.palette.grey[500]} stopOpacity={0.05} />
                <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke={theme.palette.text.disabled} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="avg_sentiment" stroke={theme.palette.primary.main} fill="url(#sentimentGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
