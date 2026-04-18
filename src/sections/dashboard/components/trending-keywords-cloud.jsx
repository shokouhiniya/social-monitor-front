'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

export function TrendingKeywordsCloud({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="ابر کلمات" icon="solar:hashtag-bold-duotone" info="کلمات کلیدی پرتکرار در محتوای شبکه">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = data || [];
  const maxCount = items.length > 0 ? items[0].count : 1;

  return (
    <ChartCard
      title="ابر کلمات"
      icon="solar:hashtag-bold-duotone"
      info="کلمات کلیدی پرتکرار — اندازه و رنگ نشان‌دهنده فراوانی"
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 300, overflow: 'auto' }}>
        {items.slice(0, 25).map((item) => {
          const ratio = item.count / maxCount;
          const fontSize = 11 + ratio * 5;
          const colorIntensity = 0.3 + ratio * 0.7;

          return (
            <Chip
              key={item.keyword}
              label={`${item.keyword} ${item.count}`}
              size="small"
              sx={{
                fontSize,
                fontWeight: ratio > 0.6 ? 700 : 500,
                bgcolor: alpha(theme.palette.primary.main, colorIntensity * 0.2),
                color: ratio > 0.5 ? 'primary.main' : 'text.primary',
                border: ratio > 0.7 ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.25) },
              }}
            />
          );
        })}
      </Box>
    </ChartCard>
  );
}
