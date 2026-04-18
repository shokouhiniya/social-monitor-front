'use client';

import { Bar, XAxis, YAxis, Tooltip, BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useReactionVelocity } from 'src/api/analytics';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.date}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.unique_pages} پیج فعال</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.total_posts} پست</Box>
    </Box>
  );
}

export function ReactionVelocityChart() {
  const theme = useTheme();
  const { data, isLoading } = useReactionVelocity(30);

  if (isLoading) {
    return (
      <ChartCard title="سرعت واکنش شبکه" icon="solar:bolt-bold-duotone" info="تعداد پیج‌های فعال در هر روز — نشان‌دهنده سرعت واکنش شبکه به رویدادها">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((item) => ({
    ...item,
    unique_pages: Number(item.unique_pages),
    total_posts: Number(item.total_posts),
    date: item.date?.slice(5) || '',
  }));

  return (
    <ChartCard
      title="سرعت واکنش شبکه"
      icon="solar:bolt-bold-duotone"
      info="تعداد پیج‌های فعال در هر روز. ستون‌های بلندتر = واکنش سریع‌تر شبکه"
    >
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="unique_pages" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
