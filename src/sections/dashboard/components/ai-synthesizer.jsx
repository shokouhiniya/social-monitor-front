'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAiSynthesizer } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const MOOD_CONFIG = {
  'امیدوار': { color: 'success', icon: 'solar:sun-bold-duotone' },
  'ملتهب': { color: 'error', icon: 'solar:fire-bold-duotone' },
  'در وضعیت انتظار': { color: 'warning', icon: 'solar:clock-circle-bold-duotone' },
};

export function AiSynthesizer() {
  const { data, isLoading } = useAiSynthesizer();

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>
    );
  }

  if (!data) return null;

  const mood = MOOD_CONFIG[data.mood] || MOOD_CONFIG['در وضعیت انتظار'];

  return (
    <Box
      sx={(theme) => ({
        p: 3,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette[mood.color].main, 0.08)} 0%, ${alpha(theme.palette[mood.color].main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette[mood.color].main, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[mood.color].main, 0.06),
        })}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative' }}>
        <Iconify icon={mood.icon} width={28} sx={{ color: `${mood.color}.main`, mt: 0.5, flexShrink: 0 }} />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Iconify icon="solar:cpu-bolt-bold-duotone" width={14} />
            سنتزکننده هوشمند — تیتر یک شبکه
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.6,
              fontStyle: 'italic',
              color: `${mood.color}.main`,
              '&::before': { content: '"«"' },
              '&::after': { content: '"»"' },
            }}
          >
            {data.headline}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
