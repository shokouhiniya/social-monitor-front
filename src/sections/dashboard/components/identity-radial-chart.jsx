'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

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

const CATEGORY_ICONS = {
  news: 'solar:document-text-bold-duotone', activist: 'solar:flag-bold-duotone',
  celebrity: 'solar:star-bold-duotone', lifestyle: 'solar:heart-bold-duotone',
  economy: 'solar:chart-bold-duotone', local_news: 'solar:map-point-bold-duotone',
  politician: 'solar:buildings-bold-duotone', documentary: 'solar:videocamera-record-bold-duotone',
  religious: 'solar:moon-bold-duotone', art: 'solar:palette-bold-duotone',
  student: 'solar:square-academic-cap-bold-duotone', health: 'solar:health-bold-duotone',
  technology: 'solar:cpu-bolt-bold-duotone', culture: 'solar:book-bold-duotone',
  sports: 'solar:running-round-bold-duotone', analyst: 'solar:graph-bold-duotone',
  unknown: 'solar:question-circle-bold-duotone',
};

export function IdentityRadialChart({ data, loading }) {
  if (loading) {
    return (
      <ChartCard title="دماسنج هویت" icon="solar:pie-chart-2-bold-duotone" info="ترکیب شبکه بر اساس نوع پیج‌ها" sx={{ height: '100%' }}>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ key: item.category, label: CATEGORY_LABELS[item.category] || item.category || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <ChartCard
      title="دماسنج هویت"
      icon="solar:pie-chart-2-bold-duotone"
      info="ترکیب شبکه: هر ردیف یک دسته‌بندی. آیکون + نوار رنگی + درصد"
      sx={{ height: '100%' }}
    >
      <Stack spacing={1.25}>
        {items.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = COLORS[idx % COLORS.length];
          const icon = CATEGORY_ICONS[item.key] || 'solar:question-circle-bold-duotone';

          return (
            <Box key={item.key}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={icon} width={16} sx={{ color }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 700, color }}>{item.count} ({percent}%)</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 8, borderRadius: 1,
                  bgcolor: alpha(color, 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 1 },
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
