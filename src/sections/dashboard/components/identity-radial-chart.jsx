'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630', '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#FF8B00', '#00C7B1', '#B76E00', '#5119B7', '#007867', '#B71D18'];

const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر', unknown: 'نامشخص',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3, minWidth: 120 }}>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{d.label}</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{d.count} پیج ({d.percent}%)</Box>
    </Box>
  );
}

function CustomContent({ x, y, width, height, label, fill, percent }) {
  if (width < 35 || height < 25) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={fill} opacity={0.9} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
      {width > 55 && height > 35 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={width > 90 ? 13 : 11} fontWeight={700}>
            {label}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.7)" fontSize={10}>
            {percent}%
          </text>
        </>
      )}
    </g>
  );
}

export function IdentityRadialChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="دماسنج هویت" icon="solar:pie-chart-2-bold-duotone" info="ترکیب شبکه بر اساس نوع پیج‌ها">
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ key: item.category, label: CATEGORY_LABELS[item.category] || item.category || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);

  const treemapData = items.map((item, idx) => ({
    name: item.key,
    label: item.label,
    size: item.count,
    count: item.count,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <ChartCard
      title="دماسنج هویت"
      icon="solar:pie-chart-2-bold-duotone"
      info="ترکیب شبکه: هر بلوک یک دسته‌بندی است. اندازه بلوک = تعداد پیج‌ها"
    >
      <Box sx={{ height: 300, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            nameKey="label"
            content={<CustomContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {items.slice(0, 8).map((item, idx) => (
          <Stack key={item.key} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: COLORS[idx % COLORS.length], flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">{item.label} ({item.count})</Typography>
          </Stack>
        ))}
      </Box>
    </ChartCard>
  );
}
