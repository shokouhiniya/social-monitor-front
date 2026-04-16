'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630', '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#FF8B00', '#00C7B1', '#B76E00'];

const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر', unknown: 'نامشخص',
};

// Group categories into parent groups for sunburst effect
const PARENT_GROUPS = {
  'سیاسی': ['news', 'activist', 'politician', 'local_news', 'analyst'],
  'فرهنگی-اجتماعی': ['celebrity', 'lifestyle', 'art', 'culture', 'sports', 'religious', 'documentary', 'student'],
  'تخصصی': ['economy', 'health', 'technology'],
  'سایر': ['unknown'],
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 700 }}>{d.label}</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{d.value} پیج ({d.percent}%)</Box>
    </Box>
  );
}

export function IdentityRadialChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="دماسنج هویت" icon="solar:pie-chart-2-bold-duotone" info="ترکیب شبکه بر اساس نوع پیج‌ها" sx={{ height: '100%' }}>
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((item) => ({ key: item.category, count: Number(item.count) }));
  const total = items.reduce((s, i) => s + i.count, 0);

  // Inner ring: parent groups
  const innerData = Object.entries(PARENT_GROUPS).map(([group, cats], idx) => {
    const count = items.filter((i) => cats.includes(i.key)).reduce((s, i) => s + i.count, 0);
    return { name: group, label: group, value: count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  }).filter((d) => d.value > 0);

  // Outer ring: individual categories
  const outerData = items
    .map((item, idx) => ({
      name: item.key,
      label: CATEGORY_LABELS[item.key] || item.key || 'نامشخص',
      value: item.count,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Color mapping for outer ring based on parent group
  const outerColors = outerData.map((item) => {
    const groupIdx = Object.entries(PARENT_GROUPS).findIndex(([, cats]) => cats.includes(item.name));
    const baseColor = COLORS[groupIdx >= 0 ? groupIdx : 0];
    return baseColor;
  });

  const innerColors = ['#2065D1', '#8E33FF', '#00B8D9', '#919EAB'];

  return (
    <ChartCard
      title="دماسنج هویت"
      icon="solar:pie-chart-2-bold-duotone"
      info="حلقه داخلی: دسته اصلی (سیاسی/فرهنگی/تخصصی). حلقه بیرونی: زیردسته‌ها"
      sx={{ height: '100%' }}
    >
      <Box sx={{ height: 280, direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Inner ring - parent groups */}
            <Pie data={innerData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
              {innerData.map((_, idx) => (
                <Cell key={idx} fill={innerColors[idx % innerColors.length]} opacity={0.85} />
              ))}
            </Pie>
            {/* Outer ring - categories */}
            <Pie data={outerData} cx="50%" cy="50%" innerRadius={82} outerRadius={115} paddingAngle={1} dataKey="value">
              {outerData.map((_, idx) => (
                <Cell key={idx} fill={outerColors[idx]} opacity={0.7} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Center label */}
      <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, color: 'primary.main', mt: -18, mb: 16, position: 'relative', zIndex: 1 }}>
        {total}
      </Typography>

      {/* Legend */}
      <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ justifyContent: 'center' }}>
        {innerData.map((item, idx) => (
          <Stack key={item.name} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: innerColors[idx % innerColors.length] }} />
            <Typography variant="caption" sx={{ fontSize: 11 }}>{item.label} ({item.value})</Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
