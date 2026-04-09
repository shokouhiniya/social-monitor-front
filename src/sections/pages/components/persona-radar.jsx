'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

const DIMENSIONS = [
  { key: 'aggressive_defensive', label: 'تهاجمی / تدافعی', leftLabel: 'تدافعی', rightLabel: 'تهاجمی' },
  { key: 'producer_resharer', label: 'تولیدی / بازنشرکننده', leftLabel: 'بازنشر', rightLabel: 'تولیدی' },
  { key: 'visual_textual', label: 'بصری / متنی', leftLabel: 'متنی', rightLabel: 'بصری' },
  { key: 'formal_informal', label: 'رسمی / صمیمی', leftLabel: 'صمیمی', rightLabel: 'رسمی' },
  { key: 'local_global', label: 'محلی / جهانی', leftLabel: 'محلی', rightLabel: 'جهانی' },
  { key: 'interactive_oneway', label: 'تعاملی / یک‌طرفه', leftLabel: 'یک‌طرفه', rightLabel: 'تعاملی' },
];

export function PersonaRadar({ data }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        رادار شخصیت رسانه‌ای
      </Typography>

      {DIMENSIONS.map((dim) => {
        const value = data?.[dim.key] ?? 50;
        return (
          <Box key={dim.key} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {dim.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: 50, textAlign: 'right' }}>
                {dim.leftLabel}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                color={value > 70 ? 'error' : value > 40 ? 'primary' : 'info'}
              />
              <Typography variant="caption" sx={{ minWidth: 50 }}>
                {dim.rightLabel}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Card>
  );
}
