'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import { useReactionVelocity } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function ReactionVelocity() {
  const { data, isLoading } = useReactionVelocity(7);

  if (isLoading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];
  const maxPages = Math.max(...items.map((i) => Number(i.unique_pages)), 1);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        سرعت واکنش شبکه
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120, overflow: 'auto' }}>
        {items.map((item, index) => {
          const height = (Number(item.unique_pages) / maxPages) * 100;
          return (
            <Tooltip
              key={index}
              title={`${item.date} — ${item.unique_pages} پیج فعال — ${item.total_posts} پست`}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: Math.max(height, 4),
                    borderRadius: 0.5,
                    bgcolor: height > 70 ? 'success.main' : height > 40 ? 'warning.main' : 'error.main',
                    cursor: 'pointer',
                    transition: 'height 0.3s',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: 9, writingMode: 'vertical-rl' }}>
                  {item.date?.slice(5)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Card>
  );
}
