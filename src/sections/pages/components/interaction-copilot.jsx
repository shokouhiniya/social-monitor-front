'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InteractionCopilot({ page, contentHooks }) {
  if (!page) return null;

  // Generate engagement suggestion based on page data
  const topFormat = contentHooks?.[0];
  const painPoints = page.pain_points || [];
  const topKeyword = page.keywords?.[0];

  return (
    <Card sx={{ p: 3, bgcolor: 'primary.lighter' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Iconify icon="eva:message-circle-fill" width={24} />
        <Typography variant="subtitle2">
          دستیار تعامل — چی بگیم؟
        </Typography>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {painPoints.length > 0
            ? `برای نزدیک شدن به این پیج، از درِ «${painPoints[0]}» وارد شوید.`
            : 'داده کافی برای پیشنهاد تعامل موجود نیست.'}
        </Typography>

        {topKeyword && (
          <Typography variant="body2" color="text.secondary">
            کلمه کلیدی پیشنهادی: <strong>{topKeyword}</strong>
          </Typography>
        )}
      </Box>

      {topFormat && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            فرمت محتوایی با بیشترین تعامل:
          </Typography>
          <Chip
            label={`${topFormat.format || 'نامشخص'} (میانگین: ${Number(topFormat.avg_engagement).toFixed(0)})`}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        </Box>
      )}

      {page.persona_radar && (
        <Typography variant="caption" color="text.secondary">
          لحن پیشنهادی:{' '}
          {(page.persona_radar.formal_informal ?? 50) > 50 ? 'رسمی' : 'صمیمی و غیررسمی'}
        </Typography>
      )}
    </Card>
  );
}
