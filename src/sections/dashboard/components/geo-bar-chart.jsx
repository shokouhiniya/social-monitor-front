'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const COUNTRY_FLAGS = {
  'ایران': '🇮🇷', 'آمریکا': '🇺🇸', 'بریتانیا': '🇬🇧', 'فلسطین': '🇵🇸', 'قطر': '🇶🇦',
  'لبنان': '🇱🇧', 'استرالیا': '🇦🇺', 'یمن': '🇾🇪', 'عراق': '🇮🇶', 'ترکیه': '🇹🇷',
  'مصر': '🇪🇬', 'سوریه': '🇸🇾', 'پاکستان': '🇵🇰', 'روسیه': '🇷🇺', 'چین': '🇨🇳',
};

const COUNTRY_COLORS = {
  'ایران': '#00A76F', 'آمریکا': '#2065D1', 'بریتانیا': '#8E33FF', 'فلسطین': '#FF5630',
  'قطر': '#FFAB00', 'لبنان': '#00B8D9', 'استرالیا': '#FF6C40', 'یمن': '#36B37E',
};

export function GeoBarChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="توزیع جغرافیایی" icon="solar:globe-bold-duotone" info="پراکندگی جغرافیایی پیج‌ها بر اساس کشور">
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ country: item.country || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);
  const maxCount = items.length > 0 ? items[0].count : 1;

  return (
    <ChartCard
      title="توزیع جغرافیایی"
      icon="solar:globe-bold-duotone"
      info="پراکندگی جغرافیایی پیج‌ها — حس وسعت امپراتوری رسانه‌ای"
    >
      {/* Map-like visual */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3, justifyContent: 'center' }}>
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const ratio = item.count / maxCount;
          const size = 60 + ratio * 60;
          const color = COUNTRY_COLORS[item.country] || theme.palette.primary.main;
          const flag = COUNTRY_FLAGS[item.country] || '🌍';

          return (
            <Tooltip key={item.country} title={`${item.country}: ${item.count} پیج (${percent}%)`} arrow>
              <Box
                sx={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  bgcolor: alpha(color, 0.12),
                  border: `2px solid ${alpha(color, 0.3)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: alpha(color, 0.2),
                    border: `2px solid ${alpha(color, 0.6)}`,
                    boxShadow: `0 0 20px ${alpha(color, 0.3)}`,
                  },
                }}
              >
                <Typography sx={{ fontSize: size > 80 ? 24 : 18, lineHeight: 1 }}>{flag}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: size > 80 ? 12 : 10, mt: 0.25 }}>
                  {item.count}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Detail list */}
      <Stack spacing={1}>
        {items.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const barPercent = Math.round((item.count / maxCount) * 100);
          const color = COUNTRY_COLORS[item.country] || theme.palette.grey[500];

          return (
            <Stack key={item.country} direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontSize: 16, width: 24, textAlign: 'center' }}>
                {COUNTRY_FLAGS[item.country] || '🌍'}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 60 }}>{item.country}</Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: alpha(color, 0.1), overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${barPercent}%`, borderRadius: 1, bgcolor: color, transition: 'width 0.5s ease' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 50, textAlign: 'left', color }}>
                {item.count} ({percent}%)
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
