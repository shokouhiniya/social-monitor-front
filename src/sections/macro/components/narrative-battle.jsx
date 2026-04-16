'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';
import { useNarrativeBattle } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function NarrativeBattle() {
  const theme = useTheme();
  const { data, isLoading } = useNarrativeBattle();

  if (isLoading) {
    return (
      <ChartCard title="نبرد روایت‌ها" icon="solar:shield-bold-duotone" info="مقایسه موضوعات اصلی — موافق vs مخالف">
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = data || [];

  return (
    <ChartCard
      title="نبرد روایت‌ها"
      icon="solar:shield-bold-duotone"
      info="نمودار دوطرفه — سمت راست: درصد محتوای امیدوار، سمت چپ: درصد محتوای خشمگین"
    >
      <Stack spacing={3}>
        {items.map((item) => (
          <Box key={item.topic}>
            {/* Topic label */}
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.topic}</Typography>
              <Typography variant="caption" color="text.disabled">({item.total_posts} پست)</Typography>
            </Stack>

            {/* Bipolar bar */}
            <Stack direction="row" alignItems="center" sx={{ height: 32 }}>
              {/* Negative side */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', pr: 0.5 }}>
                <Box
                  sx={{
                    height: 28,
                    width: `${item.negative}%`,
                    bgcolor: alpha(theme.palette.error.main, 0.7),
                    borderRadius: '6px 0 0 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    px: 1,
                    minWidth: item.negative > 5 ? 40 : 0,
                    transition: 'width 0.5s ease',
                  }}
                >
                  {item.negative > 10 && (
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>
                      {item.negative}%
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Center divider */}
              <Box sx={{ width: 2, height: 36, bgcolor: 'divider', flexShrink: 0 }} />

              {/* Positive side */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', pl: 0.5 }}>
                <Box
                  sx={{
                    height: 28,
                    width: `${item.positive}%`,
                    bgcolor: alpha(theme.palette.success.main, 0.7),
                    borderRadius: '0 6px 6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: 1,
                    minWidth: item.positive > 5 ? 40 : 0,
                    transition: 'width 0.5s ease',
                  }}
                >
                  {item.positive > 10 && (
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>
                      {item.positive}%
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>

            {/* Labels */}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:fire-bold" width={12} sx={{ color: 'error.main' }} />
                <Typography variant="caption" color="error.main" sx={{ fontSize: 10 }}>خشم {item.negative}%</Typography>
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>خنثی {item.neutral}%</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="success.main" sx={{ fontSize: 10 }}>امید {item.positive}%</Typography>
                <Iconify icon="solar:sun-bold" width={12} sx={{ color: 'success.main' }} />
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </ChartCard>
  );
}
