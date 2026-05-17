'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from './chart-card';
import { topicalLabel } from '../../pages/constants';

// ----------------------------------------------------------------------

const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630', '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#FF8B00', '#00C7B1', '#B76E00', '#A95EE7', '#FF6F61', '#3DD598', '#1E88E5', '#7E57C2', '#26A69A', '#FFA726', '#5C6BC0', '#EC407A', '#66BB6A', '#FFCA28', '#42A5F5', '#AB47BC'];

const CATEGORY_ICONS = {
  technology: 'solar:cpu-bolt-bold-duotone',
  marketing: 'solar:megaphone-bold-duotone',
  science: 'solar:atom-bold-duotone',
  quran: 'solar:book-bookmark-bold-duotone',
  eulogy: 'solar:moon-stars-bold-duotone',
  mysticism: 'solar:soul-bold-duotone',
  parenting: 'solar:emoji-funny-circle-bold-duotone',
  beauty: 'solar:gallery-favourite-bold-duotone',
  fashion: 'solar:bag-bold-duotone',
  art: 'solar:palette-bold-duotone',
  music: 'solar:music-note-2-bold-duotone',
  photography: 'solar:camera-bold-duotone',
  anime_games: 'solar:gamepad-bold-duotone',
  news_politics: 'solar:document-text-bold-duotone',
  environment: 'solar:leaf-bold-duotone',
  comedy: 'solar:emoji-funny-square-bold-duotone',
  dance: 'solar:running-round-bold-duotone',
  travel: 'solar:plane-bold-duotone',
  history: 'solar:hourglass-bold-duotone',
  sports: 'solar:running-2-bold-duotone',
  cooking: 'solar:chef-hat-bold-duotone',
  military: 'solar:shield-keyhole-bold-duotone',
  business_crypto: 'solar:wallet-money-bold-duotone',
  social_legal: 'solar:scale-bold-duotone',
  medicine: 'solar:health-bold-duotone',
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
    .map((item) => ({ key: item.category || 'unknown', label: topicalLabel(item.category) || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <ChartCard
      title="دماسنج هویت"
      icon="solar:pie-chart-2-bold-duotone"
      info="ترکیب شبکه: هر ردیف یک خوشه موضوعی. آیکون + نوار رنگی + درصد"
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
