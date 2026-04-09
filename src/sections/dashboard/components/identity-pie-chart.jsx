'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630', '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#FF8B00', '#00C7B1', '#B76E00'];

const CATEGORY_LABELS = {
  news: 'خبری',
  activist: 'فعال',
  celebrity: 'سلبریتی',
  lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی',
  local_news: 'محلی',
  politician: 'سیاستمدار',
  documentary: 'مستند',
  religious: 'مذهبی',
  art: 'هنری',
  student: 'دانشجویی',
  health: 'سلامت',
  technology: 'تکنولوژی',
  culture: 'فرهنگی',
  sports: 'ورزشی',
  analyst: 'تحلیل‌گر',
  unknown: 'نامشخص',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600 }}>{d.label}</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{d.value} پیج ({d.percent}%)</Box>
    </Box>
  );
}

export function IdentityPieChart({ data, loading }) {
  if (loading) {
    return (
      <ChartCard title="دماسنج هویت" icon="solar:pie-chart-2-bold-duotone" info="توزیع دسته‌بندی پیج‌ها">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = data || [];
  const total = items.reduce((s, i) => s + Number(i.count), 0);
  const chartData = items
    .map((item) => ({
      name: item.category,
      label: CATEGORY_LABELS[item.category] || item.category || 'نامشخص',
      value: Number(item.count),
      percent: total > 0 ? Math.round((Number(item.count) / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard
      title="دماسنج هویت"
      icon="solar:pie-chart-2-bold-duotone"
      info="ترکیب شبکه: چند درصد پیج‌ها بلاگر، خبری، اکتیویست و... هستند"
    >
      <Box sx={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack spacing={0.5} sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
        {chartData.slice(0, 6).map((item, idx) => (
          <Stack key={item.name} direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length], flexShrink: 0 }} />
              <Typography variant="caption">{item.label}</Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.value}</Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
