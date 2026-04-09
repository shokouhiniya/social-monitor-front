'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const FORMAT_LABELS = { image: 'تصویر', video: 'ویدیو', reel: 'ریلز', story: 'استوری', carousel: 'کاروسل' };
const FORMAT_ICONS = { image: 'solar:gallery-bold-duotone', video: 'solar:videocamera-bold-duotone', reel: 'solar:clapperboard-play-bold-duotone', story: 'solar:stories-bold-duotone', carousel: 'solar:slider-horizontal-bold-duotone' };
const COLORS = ['#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.label}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.post_count} پست • میانگین تعامل: {Number(d.avg_engagement).toFixed(0)}</Box>
    </Box>
  );
}

export function ContentHookAnalyzer({ data }) {
  const theme = useTheme();
  const items = data || [];

  if (items.length === 0) {
    return (
      <ChartCard title="قلاب محتوایی" icon="solar:magnet-bold-duotone" info="فرمت‌هایی که بیشترین تعامل را از مخاطبان دریافت کرده‌اند">
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
          داده‌ای موجود نیست
        </Box>
      </ChartCard>
    );
  }

  const chartData = items.map((item) => ({
    name: item.format,
    label: FORMAT_LABELS[item.format] || item.format || 'نامشخص',
    value: Number(item.avg_engagement) || 0,
    post_count: item.post_count,
    avg_engagement: item.avg_engagement,
  }));

  return (
    <ChartCard
      title="قلاب محتوایی"
      icon="solar:magnet-bold-duotone"
      info="مخاطبان این پیج به چه فرمت‌هایی بیشتر واکنش نشان داده‌اند"
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Stack spacing={1} sx={{ flex: 1 }}>
          {chartData.map((item, idx) => (
            <Stack key={item.name} direction="row" alignItems="center" spacing={1}>
              <Iconify icon={FORMAT_ICONS[item.name] || 'solar:document-bold'} width={18} sx={{ color: COLORS[idx % COLORS.length] }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                  {item.post_count} پست • تعامل: {Number(item.avg_engagement).toFixed(0)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </ChartCard>
  );
}
