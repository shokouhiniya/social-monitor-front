'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';
import { useNarrativeHealth } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function NarrativeHealthGauge() {
  const theme = useTheme();
  const { data, isLoading } = useNarrativeHealth();

  if (isLoading) {
    return (
      <ChartCard title="سنجش سلامت روایت" icon="solar:health-bold-duotone" info="میزان همسویی محتوای شبکه با اهداف روایت مدنظر">
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  if (!data) return null;

  const score = data.score ?? 0;
  const rotation = -90 + (score / 100) * 180; // -90 to 90 degrees
  const color = score > 70 ? theme.palette.success.main : score > 40 ? theme.palette.warning.main : theme.palette.error.main;

  return (
    <ChartCard
      title="سنجش سلامت روایت"
      icon="solar:health-bold-duotone"
      info="چقدر محتوای تولیدشده با اهداف روایت مدنظر شما همسو است. عقربه به سمت راست = انطباق بالا"
    >
      {/* Gauge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Box sx={{ position: 'relative', width: 200, height: 110 }}>
          <svg viewBox="0 0 200 110" width="200" height="110">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={alpha(theme.palette.grey[500], 0.15)}
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Colored segments */}
            <path d="M 20 100 A 80 80 0 0 1 60 32" fill="none" stroke={alpha(theme.palette.error.main, 0.3)} strokeWidth="14" strokeLinecap="round" />
            <path d="M 60 32 A 80 80 0 0 1 140 32" fill="none" stroke={alpha(theme.palette.warning.main, 0.3)} strokeWidth="14" strokeLinecap="round" />
            <path d="M 140 32 A 80 80 0 0 1 180 100" fill="none" stroke={alpha(theme.palette.success.main, 0.3)} strokeWidth="14" strokeLinecap="round" />
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2={100 + 60 * Math.cos((rotation * Math.PI) / 180)}
              y2={100 + 60 * Math.sin((rotation * Math.PI) / 180)}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill={color} />
            <circle cx="100" cy="100" r="3" fill={theme.palette.background.paper} />
          </svg>

          {/* Score text */}
          <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color, textAlign: 'center', lineHeight: 1 }}>
              {score}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Labels */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2, mb: 2 }}>
        <Typography variant="caption" color="error.main" sx={{ fontSize: 10 }}>انحراف شدید</Typography>
        <Typography variant="caption" color="warning.main" sx={{ fontSize: 10 }}>خنثی</Typography>
        <Typography variant="caption" color="success.main" sx={{ fontSize: 10 }}>انطباق کامل</Typography>
      </Stack>

      <Chip label={data.label} size="small" color={score > 70 ? 'success' : score > 40 ? 'warning' : 'error'} sx={{ display: 'flex', mb: 1.5 }} />

      {/* Deviation keywords */}
      {data.deviation_keywords?.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            کلمات کلیدی منحرف‌کننده:
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {data.deviation_keywords.map((kw) => (
              <Chip key={kw} label={kw} size="small" color="error" variant="outlined" sx={{ fontSize: 11 }} />
            ))}
          </Stack>
        </Box>
      )}
    </ChartCard>
  );
}
