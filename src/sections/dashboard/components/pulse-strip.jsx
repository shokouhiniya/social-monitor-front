'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useNetworkPulseWeekly } from 'src/api/analytics';

// ----------------------------------------------------------------------

const PERIOD_LABELS = ['۰۰-۰۶', '۰۶-۱۲', '۱۲-۱۸', '۱۸-۲۴'];

function formatDay(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fa-IR', { weekday: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function PulseStrip() {
  const { data, isLoading } = useNetworkPulseWeekly();

  if (isLoading) {
    return <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={16} /></Box>;
  }

  const items = data || [];
  if (items.length === 0) {
    return <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="caption" color="text.disabled">داده‌ای موجود نیست</Typography></Box>;
  }

  // Group by date
  const dayMap = {};
  for (const item of items) {
    const date = item.date?.split('T')[0] || item.date;
    if (!dayMap[date]) dayMap[date] = [0, 0, 0, 0];
    const period = Number(item.period);
    dayMap[date][period] = Number(item.count);
  }

  const days = Object.keys(dayMap).sort();
  const allCounts = days.flatMap((d) => dayMap[d]);
  const maxCount = Math.max(...allCounts, 1);

  return (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1.5, px: 2, py: 1.5, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>ضربان شبکه</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>۷ روز اخیر • هر ستون = ۶ ساعت</Typography>
      </Stack>

      <Stack direction="row" alignItems="flex-end" spacing={0}>
        {days.map((date, dayIdx) => (
          <Box key={date} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {/* Bars */}
            <Stack direction="row" alignItems="flex-end" spacing="3px" sx={{ height: 36, mb: 0.5 }}>
              {dayMap[date].map((count, periodIdx) => {
                const h = (count / maxCount) * 32;
                return (
                  <Tooltip key={periodIdx} title={`${PERIOD_LABELS[periodIdx]}: ${count} پست`} arrow>
                    <Box sx={{
                      width: 8, minHeight: 2, height: Math.max(h, 2), borderRadius: 0.5,
                      bgcolor: h > 24 ? 'error.main' : h > 12 ? 'warning.main' : 'success.main',
                      transition: 'height 0.3s',
                      opacity: count === 0 ? 0.2 : 1,
                    }} />
                  </Tooltip>
                );
              })}
            </Stack>
            {/* Day label */}
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 8, lineHeight: 1 }}>{formatDay(date)}</Typography>
            {/* Day divider */}
            {dayIdx < days.length - 1 && (
              <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', bgcolor: 'divider' }} />
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
