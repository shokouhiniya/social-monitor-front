'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function ClusterDistribution({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        خوشه‌بندی معنایی
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => (
          <Box key={item.cluster} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{item.cluster || 'بدون خوشه'}</Typography>
            <Chip label={item.count} size="small" color="primary" variant="outlined" />
          </Box>
        ))}
      </Box>
    </Card>
  );
}
