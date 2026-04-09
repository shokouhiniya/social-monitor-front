'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StatCard({ title, value, subtitle, icon, color = 'primary', info, trend, trendLabel }) {
  return (
    <Card
      sx={(theme) => ({
        p: 2.5,
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.12)} 0%, ${alpha(theme.palette[color].light || theme.palette[color].main, 0.06)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.16)}`,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: -20,
          right: -20,
          width: 70,
          height: 70,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[color].main, 0.08),
        })}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={(theme) => ({
              width: 52,
              height: 52,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette[color].main, 0.16),
            })}
          >
            <Iconify icon={icon} width={26} sx={{ color: `${color}.main` }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>

        <Stack alignItems="flex-end" spacing={0.5}>
          {info && (
            <Tooltip title={info} arrow placement="top">
              <IconButton size="small" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                <Iconify icon="solar:info-circle-line-duotone" width={18} />
              </IconButton>
            </Tooltip>
          )}
          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon={trend >= 0 ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
                width={16}
                sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}
              />
              <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {subtitle && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block', position: 'relative' }}>
          {subtitle}
        </Typography>
      )}
    </Card>
  );
}
