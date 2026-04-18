'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useGhostPages } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function GhostPagesCard() {
  const { data, isLoading } = useGhostPages();

  if (isLoading) {
    return (
      <ChartCard title="پیج‌های Ghost" icon="solar:ghost-bold-duotone" info="پیج‌هایی با فعالیت بسیار کم یا در حال حذف محتوا">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = data || [];

  return (
    <ChartCard
      title="پیج‌های Ghost"
      icon="solar:ghost-bold-duotone"
      info="پیج‌هایی که ریسک ریزش یا غیرفعال شدن دارند. نیاز به بررسی فوری"
    >
      {items.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">پیج مشکوکی شناسایی نشد</Typography>
        </Box>
      ) : (
        <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
          {items.slice(0, 10).map((page) => (
            <Stack
              key={page.id}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={(theme) => ({
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.04),
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
              })}
            >
              <Avatar
                src={page.profile_image_url}
                sx={{ width: 30, height: 30, filter: 'grayscale(80%)', opacity: 0.6 }}
              >
                <Iconify icon="solar:ghost-bold" width={16} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>
                  {page.name}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  پایداری: {page.consistency_rate?.toFixed(1)}
                </Typography>
              </Box>
              <Chip
                label={page.is_active ? 'کم‌فعال' : 'غیرفعال'}
                size="small"
                color={page.is_active ? 'warning' : 'error'}
                variant="outlined"
                sx={{ height: 22, fontSize: 10 }}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
