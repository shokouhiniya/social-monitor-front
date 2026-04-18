'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function ReshareTreeChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="درخت بازنشر" icon="solar:share-bold-duotone" info="نمایش گرافیکی سرایت محتوا از منابع مرجع">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).slice(0, 8);
  const maxCount = items.length > 0 ? Number(items[0].reshare_count) : 1;
  const totalReshares = items.reduce((s, i) => s + Number(i.reshare_count), 0);

  return (
    <ChartCard
      title="درخت بازنشر"
      icon="solar:share-bold-duotone"
      info="مرکز = منبع اصلی. شاخه‌ها = بازنشرکنندگان. ضخامت = میزان تعامل. آیا شبکه تولیدکننده است یا پژواک‌دهنده؟"
    >
      {/* Radial visualization */}
      <Box sx={{ position: 'relative', width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Center node */}
        <Box
          sx={{
            position: 'absolute',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.warning.main, 0.15),
            border: `3px solid ${theme.palette.warning.main}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Iconify icon="solar:share-bold" width={20} sx={{ color: 'warning.main' }} />
          <Typography variant="caption" sx={{ fontSize: 8, fontWeight: 700, color: 'warning.main' }}>{totalReshares}</Typography>
        </Box>

        {/* Branches */}
        {items.map((item, idx) => {
          const angle = (idx / items.length) * 360;
          const ratio = Number(item.reshare_count) / maxCount;
          const distance = 70 + ratio * 50;
          const size = 28 + ratio * 20;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * distance;
          const y = Math.sin(rad) * distance;
          const lineWidth = 1 + ratio * 3;

          return (
            <Box key={item.source || idx}>
              {/* Connection line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: distance,
                  height: lineWidth,
                  bgcolor: alpha(theme.palette.warning.main, 0.2 + ratio * 0.3),
                  borderRadius: 1,
                  transformOrigin: '0 50%',
                  transform: `rotate(${angle}deg)`,
                  zIndex: 0,
                }}
              />
              {/* Node */}
              <Tooltip title={`${item.source || 'نامشخص'}: ${item.reshare_count} بازنشر`} arrow>
                <Box
                  sx={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1 + ratio * 0.2),
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3 + ratio * 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translate(-50%, -50%) scale(1.2)', boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}` },
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: size > 38 ? 9 : 7, fontWeight: 700, textAlign: 'center', lineHeight: 1, px: 0.25 }} noWrap>
                    {item.reshare_count}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {items.slice(0, 5).map((item, idx) => (
          <Stack key={item.source || idx} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
            <Typography variant="caption" noWrap sx={{ flex: 1 }}>{item.source || 'نامشخص'}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.reshare_count}</Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
