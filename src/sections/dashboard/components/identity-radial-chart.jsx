'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630', '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#FF8B00'];

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
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="دماسنج هویت" icon="solar:pie-chart-2-bold-duotone" info="ترکیب شبکه بر اساس نوع پیج‌ها">
        <Box sx={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
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
      info="ترکیب شبکه: چند درصد پیج‌ها خبری، فعال، سلبریتی و... هستند"
    >
      {/* Summary circle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
        <Box
          sx={(t) => ({
            width: 100, height: 100, borderRadius: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(t.palette.primary.main, 0.08),
            border: `3px solid ${alpha(t.palette.primary.main, 0.2)}`,
          })}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" color="text.secondary">پیج</Typography>
        </Box>
      </Box>

      {/* Category bars */}
      <Stack spacing={1.25} sx={{ maxHeight: 260, overflow: 'auto' }}>
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
