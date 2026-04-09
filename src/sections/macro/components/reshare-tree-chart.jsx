'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function ReshareTreeChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="سنجش نفوذ" icon="solar:share-bold-duotone" info="منابع اصلی بازنشر — پیج‌هایی که بقیه از آن‌ها کپی می‌کنند">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = data || [];
  const maxCount = items.length > 0 ? Number(items[0].reshare_count) : 1;

  return (
    <ChartCard
      title="سنجش نفوذ"
      icon="solar:share-bold-duotone"
      info="پیج‌هایی که بیشترین بازنشر از آن‌ها صورت گرفته — نشان‌دهنده نفوذ واقعی"
    >
      <Stack spacing={1.5} sx={{ maxHeight: 300, overflow: 'auto' }}>
        {items.slice(0, 12).map((item, index) => {
          const percent = Math.round((Number(item.reshare_count) / maxCount) * 100);
          return (
            <Box key={item.source || index}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:share-bold" width={14} sx={{ color: 'warning.main' }} />
                  <Typography variant="caption" noWrap sx={{ maxWidth: 140 }}>
                    {item.source || 'نامشخص'}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {item.reshare_count}
                </Typography>
              </Stack>
              <Box sx={{ height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.08), overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${percent}%`,
                    borderRadius: 1,
                    bgcolor: 'warning.main',
                    transition: 'width 0.4s ease',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
