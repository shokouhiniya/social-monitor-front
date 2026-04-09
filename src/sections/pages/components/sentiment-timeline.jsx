'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

export function SentimentTimeline({ data }) {
  const items = data || [];

  if (items.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          تایم‌لاین احساسات
        </Typography>
        <Typography variant="body2" color="text.secondary">
          داده‌ای موجود نیست
        </Typography>
      </Card>
    );
  }

  const maxPosts = Math.max(...items.map((i) => Number(i.post_count)));

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        تایم‌لاین تغییر فاز — نوسان احساسات
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 200, overflow: 'auto' }}>
        {items.map((item) => {
          const sentiment = Number(item.avg_sentiment) || 0;
          const height = (Number(item.post_count) / maxPosts) * 160;
          const color =
            sentiment > 0.3 ? '#00AB55' : sentiment < -0.3 ? '#FF5630' : '#919EAB';

          return (
            <Tooltip
              key={item.date}
              title={`${item.date} — ${item.post_count} پست — احساس: ${sentiment.toFixed(2)}`}
            >
              <Box
                sx={{
                  minWidth: 16,
                  height: Math.max(height, 8),
                  borderRadius: 0.5,
                  bgcolor: color,
                  opacity: 0.8,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {items[0]?.date}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {items[items.length - 1]?.date}
        </Typography>
      </Box>
    </Card>
  );
}
