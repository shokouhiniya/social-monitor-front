'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function TrendingKeywords({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];
  const maxCount = items.length > 0 ? items[0].count : 1;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        رادار ترند — کلمات کلیدی پرتکرار
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.slice(0, 30).map((item) => {
          const ratio = item.count / maxCount;
          const size = ratio > 0.7 ? 'medium' : 'small';
          return (
            <Chip
              key={item.keyword}
              label={`${item.keyword} (${item.count})`}
              size={size}
              variant={ratio > 0.5 ? 'filled' : 'outlined'}
              color={ratio > 0.7 ? 'primary' : ratio > 0.4 ? 'info' : 'default'}
            />
          );
        })}
      </Box>
    </Card>
  );
}
