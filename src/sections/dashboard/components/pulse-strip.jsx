'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useNetworkPulse } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function PulseStrip() {
  const { data, isLoading } = useNetworkPulse();

  if (isLoading) {
    return (
      <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  const items = data || [];
  const maxCount = Math.max(...items.map((i) => Number(i.post_count)), 1);

  return (
    <Box
      sx={{
        height: 40,
        bgcolor: 'background.neutral',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        px: 2,
        py: 0.5,
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
        ضربان شبکه
      </Typography>

      {items.map((item, index) => {
        const height = (Number(item.post_count) / maxCount) * 28;
        return (
          <Box
            key={index}
            sx={{
              width: 4,
              minHeight: 2,
              height: Math.max(height, 2),
              bgcolor: height > 20 ? 'error.main' : height > 10 ? 'warning.main' : 'success.main',
              borderRadius: 0.5,
              transition: 'height 0.3s ease',
            }}
          />
        );
      })}
    </Box>
  );
}
