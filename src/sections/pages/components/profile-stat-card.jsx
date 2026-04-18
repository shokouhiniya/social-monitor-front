'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileStatCard({ title, value, prevValue, icon, color = 'primary', info, maxValue = 10, onRefine }) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const numPrev = typeof prevValue === 'number' ? prevValue : parseFloat(prevValue) || 0;
  const diff = numPrev > 0 ? Math.round(((numValue - numPrev) / numPrev) * 100) : 0;
  const progress = maxValue > 0 ? Math.min((numValue / maxValue) * 100, 100) : 0;
  const prevProgress = maxValue > 0 ? Math.min((numPrev / maxValue) * 100, 100) : 0;

  return (
    <Card
      sx={(theme) => ({
        p: 2.5,
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.14)}`,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 44, height: 44, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(theme.palette[color].main, 0.14),
            })}
          >
            <Iconify icon={icon} width={22} sx={{ color: `${color}.main` }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: `${color}.main`, lineHeight: 1 }}>
                {typeof value === 'number' ? value.toFixed(1) : value}
              </Typography>
              {diff !== 0 && (
                <Stack direction="row" alignItems="center" spacing={0.25}>
                  <Iconify icon={diff > 0 ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'} width={12} sx={{ color: diff > 0 ? 'success.main' : 'error.main' }} />
                  <Typography variant="caption" sx={{ color: diff > 0 ? 'success.main' : 'error.main', fontWeight: 700, fontSize: 10 }}>
                    {diff > 0 ? '+' : ''}{diff}%
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{title}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0}>
          {onRefine && (
            <Tooltip title="بهبود شاخص" arrow>
              <IconButton size="small" onClick={onRefine} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                <Iconify icon="solar:pen-new-square-bold-duotone" width={14} />
              </IconButton>
            </Tooltip>
          )}
          {info && (
            <Tooltip title={info} arrow>
              <IconButton size="small" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                <Iconify icon="solar:info-circle-line-duotone" width={16} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Pulse Graph */}
      <Box sx={{ mt: 1.5, position: 'relative' }}>
        <LinearProgress
          variant="determinate" value={progress}
          sx={(theme) => ({
            height: 6, borderRadius: 1,
            bgcolor: alpha(theme.palette[color].main, 0.08),
            '& .MuiLinearProgress-bar': { borderRadius: 1 },
          })}
          color={color}
        />
        {/* Previous period marker */}
        {numPrev > 0 && (
          <Tooltip title={`دوره قبل: ${numPrev.toFixed(1)}`} arrow>
            <Box
              sx={(theme) => ({
                position: 'absolute', top: 0,
                left: `${prevProgress}%`,
                width: 2, height: 6, borderRadius: 0.5,
                bgcolor: alpha(theme.palette.text.primary, 0.4),
              })}
            />
          </Tooltip>
        )}
      </Box>
    </Card>
  );
}
