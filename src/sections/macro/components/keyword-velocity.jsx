'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useKeywordVelocity } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function KeywordVelocity() {
  const { data, isLoading } = useKeywordVelocity();

  if (isLoading) {
    return (
      <ChartCard title="شتاب واژگان" icon="solar:rocket-bold-duotone" info="کلماتی که در ۲۴ ساعت اخیر به طور ناگهانی وارد ادبیات شبکه شده‌اند">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = data || [];

  return (
    <ChartCard
      title="شتاب واژگان"
      icon="solar:rocket-bold-duotone"
      info="شبیه تابلوی بورس — کلماتی که بیشترین رشد را در ۲۴ ساعت اخیر داشته‌اند"
    >
      <Stack spacing={0.5} sx={{ maxHeight: 350, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" sx={{ px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, flex: 1 }}>واژه</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, width: 50, textAlign: 'center' }}>امروز</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, width: 50, textAlign: 'center' }}>دیروز</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, width: 70, textAlign: 'center' }}>تغییر</Typography>
        </Stack>

        {items.map((item, idx) => {
          const isUp = item.change > 0;
          const isNew = item.prev_count === 0;
          const changeColor = isUp ? 'success.main' : item.change < 0 ? 'error.main' : 'text.secondary';

          return (
            <Stack
              key={item.keyword}
              direction="row"
              alignItems="center"
              sx={(theme) => ({
                px: 1,
                py: 0.75,
                borderRadius: 1,
                bgcolor: idx < 3 ? alpha(theme.palette.warning.main, 0.04) : 'transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
              })}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                {idx < 3 && <Iconify icon="solar:fire-bold" width={14} sx={{ color: 'warning.main' }} />}
                <Typography variant="body2" sx={{ fontWeight: idx < 3 ? 700 : 500, fontSize: 13 }}>
                  {item.keyword}
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ width: 50, textAlign: 'center', fontWeight: 600 }}>
                {item.count}
              </Typography>

              <Typography variant="caption" sx={{ width: 50, textAlign: 'center', color: 'text.disabled' }}>
                {item.prev_count}
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} sx={{ width: 70 }}>
                <Iconify
                  icon={isUp ? 'solar:arrow-up-bold' : item.change < 0 ? 'solar:arrow-down-bold' : 'solar:minus-circle-bold'}
                  width={14}
                  sx={{ color: changeColor }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: changeColor }}>
                  {isNew ? 'جدید' : `${item.change > 0 ? '+' : ''}${item.change}%`}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
