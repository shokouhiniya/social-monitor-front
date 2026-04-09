'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export function ReshareTree({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];
  const maxCount = items.length > 0 ? Number(items[0].reshare_count) : 1;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        سنجش نفوذ — منابع بازنشر
      </Typography>

      {items.slice(0, 15).map((item, index) => {
        const percent = Math.round((Number(item.reshare_count) / maxCount) * 100);
        return (
          <Box key={item.source || index} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                {item.source || 'نامشخص'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.reshare_count} بازنشر
              </Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
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
    </Card>
  );
}
