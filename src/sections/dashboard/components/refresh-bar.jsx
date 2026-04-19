'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalali } from 'src/utils/format-jalali';

import { useRefreshStatus, useRefreshDashboard } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const COOLDOWN_SECONDS = 15 * 60; // 15 minutes

export function RefreshBar() {
  const { data: status } = useRefreshStatus();
  const refreshMutation = useRefreshDashboard();
  const [cooldown, setCooldown] = useState(0);

  // Check if we're in cooldown from localStorage
  useEffect(() => {
    const lastRefresh = localStorage.getItem('lastDashboardRefresh');
    if (lastRefresh) {
      const elapsed = Math.floor((Date.now() - Number(lastRefresh)) / 1000);
      const remaining = COOLDOWN_SECONDS - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.setItem('lastDashboardRefresh', String(Date.now()));
        setCooldown(COOLDOWN_SECONDS);
      },
    });
  }, [refreshMutation]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isDisabled = cooldown > 0 || refreshMutation.isPending;

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

      <Stack direction="row" alignItems="center" spacing={1}>
        {cooldown > 0 && (
          <Chip label={`${formatCountdown(cooldown)} تا فعال‌سازی`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        )}
        <Button
          size="small" variant="contained" color="info"
          startIcon={refreshMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:refresh-bold" />}
          onClick={handleRefresh}
          disabled={isDisabled}
          sx={{ fontSize: 11, minWidth: 100 }}
        >
          {refreshMutation.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی'}
        </Button>
      </Stack>
    </Box>
  );
}
