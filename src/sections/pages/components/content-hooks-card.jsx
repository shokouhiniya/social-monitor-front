'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const FORMAT_CONFIG = {
  image: { label: 'تصویر', icon: 'solar:gallery-bold-duotone', color: '#00A76F' },
  video: { label: 'ویدیو', icon: 'solar:videocamera-bold-duotone', color: '#8E33FF' },
  reel: { label: 'ریلز', icon: 'solar:clapperboard-play-bold-duotone', color: '#00B8D9' },
  story: { label: 'استوری', icon: 'solar:stories-bold-duotone', color: '#FFAB00' },
  carousel: { label: 'کاروسل', icon: 'solar:slider-horizontal-bold-duotone', color: '#FF5630' },
};

export function ContentHooksCard({ data }) {
  const theme = useTheme();
  const items = data || [];

  if (items.length === 0) {
    return (
      <ChartCard title="قلاب محتوایی" icon="solar:magnet-bold-duotone" info="فرمت‌های پرتعامل" sx={{ height: '100%' }}>
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست</Typography>
        </Box>
      </ChartCard>
    );
  }

  const maxEng = Math.max(...items.map((i) => Number(i.avg_engagement) || 0), 1);

  return (
    <ChartCard title="قلاب محتوایی" icon="solar:magnet-bold-duotone"
      info="مخاطبان به چه فرمت‌هایی بیشتر واکنش نشان داده‌اند" sx={{ height: '100%' }}
    >
      <Stack spacing={1.5}>
        {items.map((item) => {
          const conf = FORMAT_CONFIG[item.format] || { label: item.format || '?', icon: 'solar:document-bold', color: theme.palette.grey[500] };
          const eng = Number(item.avg_engagement) || 0;
          const percent = Math.round((eng / maxEng) * 100);

          return (
            <Tooltip key={item.format} title={`${item.post_count} پست • میانگین تعامل: ${eng.toFixed(0)}`} arrow>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(conf.color, 0.12), flexShrink: 0 }}>
                  <Iconify icon={conf.icon} width={18} sx={{ color: conf.color }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{conf.label}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: conf.color }}>{eng.toFixed(0)}</Typography>
                  </Stack>
                  <Box sx={{ height: 8, borderRadius: 1, bgcolor: alpha(conf.color, 0.1), overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${percent}%`, borderRadius: 1, bgcolor: conf.color, transition: 'width 0.5s ease' }} />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, flexShrink: 0 }}>{item.post_count} پست</Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
