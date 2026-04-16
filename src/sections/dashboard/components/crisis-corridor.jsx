'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';
import { useCrisisCorridor } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function CrisisCorridor() {
  const router = useRouter();
  const { data, isLoading } = useCrisisCorridor();

  const items = data || [];

  return (
    <ChartCard
      title="کریدور بحران"
      icon="solar:danger-triangle-bold-duotone"
      info="پیج‌هایی در وضعیت قرمز — بحران شهرت یا ریزش شدید. کلیک کنید برای مشاهده پروفایل."
      sx={{ height: '100%' }}
    >
      {isLoading ? (
        <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
      ) : items.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Iconify icon="solar:check-circle-bold-duotone" width={32} sx={{ color: 'success.main', mb: 1 }} />
          <Typography variant="caption" color="text.secondary">بحرانی شناسایی نشد</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {items.slice(0, 6).map((page) => (
            <Stack
              key={page.id}
              direction="row"
              alignItems="center"
              spacing={1.5}
              onClick={() => router.push(paths.dashboard.pages.profile(page.id))}
              sx={(theme) => ({
                p: 1, borderRadius: 1, cursor: 'pointer',
                bgcolor: alpha(theme.palette.error.main, 0.04),
                border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
              })}
            >
              <Avatar
                src={page.profile_image_url}
                sx={(theme) => ({
                  width: 36, height: 36,
                  border: `2px solid ${theme.palette.error.main}`,
                  animation: 'crisisPulse 2s infinite',
                  '@keyframes crisisPulse': {
                    '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                    '70%': { boxShadow: `0 0 0 5px ${alpha(theme.palette.error.main, 0)}` },
                    '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                  },
                })}
              >
                {page.name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }} noWrap>{page.name}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  پایداری: {page.consistency_rate?.toFixed(1)} • {page.is_active ? 'کم‌فعال' : 'غیرفعال'}
                </Typography>
              </Box>
              <Iconify icon="solar:arrow-left-bold" width={16} sx={{ color: 'text.disabled' }} />
            </Stack>
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
