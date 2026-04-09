'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

const SENTIMENT_COLORS = {
  angry: '#FF5630',
  hopeful: '#00AB55',
  neutral: '#919EAB',
  sad: '#2065D1',
};

export function TopicGravity({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];
  const maxCount = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 1;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        گراف ثقل موضوعی
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        {items.slice(0, 20).map((item) => {
          const ratio = item.count / maxCount;
          const size = 40 + ratio * 80;
          const dominantSentiment = item.sentiments
            ? Object.entries(item.sentiments).sort((a, b) => b[1] - a[1])[0]?.[0]
            : 'neutral';
          const color = SENTIMENT_COLORS[dominantSentiment] || SENTIMENT_COLORS.neutral;

          return (
            <Tooltip key={item.topic} title={`${item.topic}: ${item.count} پست`}>
              <Box
                sx={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  bgcolor: color,
                  opacity: 0.3 + ratio * 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: Math.max(9, ratio * 14),
                    textAlign: 'center',
                    px: 0.5,
                  }}
                >
                  {item.topic}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Card>
  );
}
