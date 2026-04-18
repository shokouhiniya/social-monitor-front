'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CriticalRedlines({ page }) {
  if (!page) return null;

  const redlines = [];

  // Auto-generate redlines from page data
  if (page.persona_radar?.aggressive_defensive > 70) redlines.push('لحن تهاجمی — از بحث مستقیم خودداری شود');
  if (page.persona_radar?.formal_informal > 75) redlines.push('لحن رسمی — از شوخی و لحن صمیمی پرهیز شود');
  if (page.pain_points?.some((p) => p.includes('مذهبی'))) redlines.push('حساس به مسائل مذهبی');
  if (page.credibility_score < 3) redlines.push('اعتبار پایین — احتمال انتشار اطلاعات نادرست');
  if (!page.is_active) redlines.push('پیج غیرفعال — احتمال مسدود شدن یا تغییر کاربری');
  if (page.consistency_rate < 2) redlines.push('پایداری بسیار پایین — احتمال تغییر ادمین');

  if (redlines.length === 0) return null;

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.warning.main, 0.06),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Iconify icon="solar:shield-warning-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main' }}>
          خط قرمزها
        </Typography>
      </Stack>
      <Stack spacing={0.5}>
        {redlines.map((line, idx) => (
          <Stack key={idx} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: 12 }}>{line}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
