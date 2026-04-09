'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

const COLORS = ['#2065D1', '#00AB55', '#FF5630', '#FFAB00', '#8E33FF', '#00B8D9', '#FF6C40'];

export function IdentityDistribution({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];
  const total = items.reduce((sum, item) => sum + Number(item.count), 0);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        دماسنج هویت — توزیع دسته‌بندی پیج‌ها
      </Typography>

      {items.map((item, index) => {
        const percent = total > 0 ? Math.round((Number(item.count) / total) * 100) : 0;
        return (
          <Box key={item.category || index} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{item.category || 'نامشخص'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.count} ({percent}%)
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: 1,
                  bgcolor: COLORS[index % COLORS.length],
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
