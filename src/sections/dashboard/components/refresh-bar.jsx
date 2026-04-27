'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalali } from 'src/utils/format-jalali';

import { useRefreshStatus, useRefreshDashboard } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RefreshBar() {
  const { data: status } = useRefreshStatus();
  const refreshMutation = useRefreshDashboard();

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  return (
    <Box
      sx={(theme) => ({
        p: 1.5, borderRadius: 1.5, mb: 2,
        bgcolor: alpha(theme.palette.info.main, 0.04),
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Iconify icon="solar:clock-circle-bold-duotone" width={18} sx={{ color: 'info.main' }} />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
            آخرین بروزرسانی: {status?.last_refreshed_at ? toJalali(status.last_refreshed_at) : 'هنوز انجام نشده'}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 9 }}>
            بروزرسانی خودکار: ۰۰:۰۰ • ۰۶:۰۰ • ۱۲:۰۰ • ۱۸:۰۰
          </Typography>
        </Box>
      </Stack>

      <Button
        size="small" variant="contained" color="info"
        startIcon={refreshMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:refresh-bold" />}
        onClick={handleRefresh}
        disabled={refreshMutation.isPending}
        sx={{ fontSize: 11, minWidth: 100 }}
      >
        {refreshMutation.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی'}
      </Button>
    </Box>
  );
}
