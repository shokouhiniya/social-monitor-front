'use client';

import { Area, XAxis, YAxis, Tooltip, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useSentimentTimeline } from 'src/api/posts';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const sentiment = Number(d.avg_sentiment);
  const label = sentiment > 0.3 ? 'امیدوار' : sentiment < -0.3 ? 'خشمگین' : sentiment < -0.1 ? 'غمگین' : 'خنثی';
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.date}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>لحن: {label} ({sentiment.toFixed(2)})</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.post_count} پست</Box>
    </Box>
  );
}

export function SentimentOverviewChart() {
  const theme = useTheme();
  const { data, isLoading } = useSentimentTimeline(undefined, 30);

  if (isLoading) {
    return (
      <ChartCard title="نوسان احساسات کل شبکه" icon="solar:graph-bold-duotone" info="تغییرات لحن غالب شبکه در ۳۰ روز اخیر">
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((item) => ({
    ...item,
    avg_sentiment: Number(item.avg_sentiment) || 0,
    post_count: Number(item.post_count) || 0,
  }));

  return (
    <ChartCard
      title="نوسان احساسات کل شبکه"
      icon="solar:graph-bold-duotone"
      info="تایم‌لاین لحن غالب تمام پیج‌ها. بالای صفر = امیدوار، زیر صفر = خشمگین. نقاط عطف نشان‌دهنده رویدادهای مهم هستند."
    >
      <Box sx={{ height: 250 }}>
        {items.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
            داده‌ای موجود نیست
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={items} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="macroSentGrad" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="avg_sentiment" stroke={theme.palette.info.main} fill="url(#macroSentGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ChartCard>
  );
}
