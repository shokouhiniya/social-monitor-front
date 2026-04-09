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

// Approximate lat/lng to SVG coordinates (simple mercator-like projection)
const COUNTRY_POSITIONS = {
  'ایران': { x: 370, y: 155, flag: '🇮🇷' },
  'آمریکا': { x: 120, y: 140, flag: '🇺🇸' },
  'بریتانیا': { x: 280, y: 105, flag: '🇬🇧' },
  'فلسطین': { x: 345, y: 155, flag: '🇵🇸' },
  'قطر': { x: 365, y: 170, flag: '🇶🇦' },
  'لبنان': { x: 348, y: 148, flag: '🇱🇧' },
  'استرالیا': { x: 490, y: 260, flag: '🇦🇺' },
  'یمن': { x: 360, y: 185, flag: '🇾🇪' },
  'عراق': { x: 355, y: 150, flag: '🇮🇶' },
  'ترکیه': { x: 340, y: 130, flag: '🇹🇷' },
  'مصر': { x: 330, y: 165, flag: '🇪🇬' },
  'پاکستان': { x: 395, y: 160, flag: '🇵🇰' },
  'روسیه': { x: 400, y: 85, flag: '🇷🇺' },
  'چین': { x: 440, y: 140, flag: '🇨🇳' },
};

const COUNTRY_COLORS = {
  'ایران': '#00A76F', 'آمریکا': '#2065D1', 'بریتانیا': '#8E33FF', 'فلسطین': '#FF5630',
  'قطر': '#FFAB00', 'لبنان': '#00B8D9', 'استرالیا': '#FF6C40', 'یمن': '#36B37E',
};

export function GeoWorldMap({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="توزیع جغرافیایی" icon="solar:globe-bold-duotone" info="پراکندگی جغرافیایی پیج‌ها روی نقشه جهان" sx={{ height: '100%' }}>
        <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
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
      info="نقشه پراکندگی جغرافیایی پیج‌ها — اندازه نقطه = تعداد پیج"
      sx={{ height: '100%' }}
    >
      {/* World Map SVG */}
      <Box sx={{ position: 'relative', width: '100%', height: 240, mb: 2 }}>
        <svg viewBox="0 0 600 320" width="100%" height="100%" style={{ opacity: 0.15 }}>
          {/* Simplified world continents outline */}
          <path d="M60,120 Q80,100 120,105 L160,95 Q180,90 200,100 L180,120 Q160,130 140,125 L100,130 Z" fill={theme.palette.text.primary} />
          <path d="M80,140 Q100,160 120,180 L110,220 Q90,240 80,260 L70,240 Q60,200 65,170 Z" fill={theme.palette.text.primary} />
          <path d="M100,140 Q130,135 150,140 L160,160 Q140,180 120,175 Z" fill={theme.palette.text.primary} />
          <path d="M260,90 Q300,80 340,85 L380,90 Q420,95 460,100 L480,110 Q500,120 510,140 L500,160 Q480,170 460,165 L420,155 Q380,145 340,140 L300,135 Q270,130 260,120 Z" fill={theme.palette.text.primary} />
          <path d="M300,150 Q320,160 340,170 L360,190 Q350,210 330,220 L310,210 Q290,190 285,170 Z" fill={theme.palette.text.primary} />
          <path d="M380,160 Q400,170 420,175 L430,190 Q420,200 400,195 L385,180 Z" fill={theme.palette.text.primary} />
          <path d="M440,130 Q470,125 500,135 L520,150 Q530,170 520,190 L500,180 Q480,160 460,150 Z" fill={theme.palette.text.primary} />
          <path d="M460,230 Q490,220 520,240 L530,270 Q510,290 480,280 L460,260 Z" fill={theme.palette.text.primary} />
        </svg>

        {/* Country dots */}
        {items.map((item) => {
          const pos = COUNTRY_POSITIONS[item.country];
          if (!pos) return null;
          const ratio = item.count / maxCount;
          const size = 16 + ratio * 28;
          const color = COUNTRY_COLORS[item.country] || theme.palette.primary.main;
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <Tooltip key={item.country} title={`${item.country}: ${item.count} پیج (${percent}%)`} arrow>
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(pos.x / 600) * 100}%`,
                  top: `${(pos.y / 320) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  bgcolor: alpha(color, 0.25),
                  border: `2px solid ${alpha(color, 0.6)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: Math.round(ratio * 10),
                  animation: ratio > 0.5 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: `0 0 0 0 ${alpha(color, 0.4)}` },
                    '70%': { boxShadow: `0 0 0 8px ${alpha(color, 0)}` },
                    '100%': { boxShadow: `0 0 0 0 ${alpha(color, 0)}` },
                  },
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.3)',
                    boxShadow: `0 0 20px ${alpha(color, 0.5)}`,
                    zIndex: 20,
                  },
                }}
              >
                {size > 28 && (
                  <Typography sx={{ fontSize: size > 36 ? 14 : 10, lineHeight: 1 }}>{pos.flag}</Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend list */}
      <Stack spacing={0.75} sx={{ maxHeight: 160, overflow: 'auto' }}>
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const barPercent = Math.round((item.count / maxCount) * 100);
          const color = COUNTRY_COLORS[item.country] || theme.palette.grey[500];
          const pos = COUNTRY_POSITIONS[item.country];

          return (
            <Stack key={item.country} direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, width: 22, textAlign: 'center' }}>
                {pos?.flag || '🌍'}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 55 }}>{item.country}</Typography>
              <Box sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: alpha(color, 0.1), overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${barPercent}%`, borderRadius: 1, bgcolor: color, transition: 'width 0.5s ease' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color, minWidth: 40, textAlign: 'left', fontSize: 11 }}>
                {item.count} ({percent}%)
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
