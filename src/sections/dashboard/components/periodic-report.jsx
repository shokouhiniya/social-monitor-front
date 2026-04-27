'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { usePeriodicReport, useGenerateReport } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TIMEFRAME_OPTIONS = [
  { value: 24,  label: '۲۴ ساعت' },
  { value: 72,  label: '۳ روز' },
  { value: 168, label: '۱ هفته' },
  { value: 336, label: '۲ هفته' },
  { value: 720, label: '۱ ماه' },
];

function formatJalaliDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function PeriodicReport() {
  const [selectedHours, setSelectedHours] = useState(168);

  const { data, isLoading, refetch } = usePeriodicReport(selectedHours);
  const generateMutation = useGenerateReport();

  if (isLoading) {
    return <Card sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Card>;
  }

  if (!data) return null;

  const sentimentColor = data.avg_sentiment > 0.2 ? 'success' : data.avg_sentiment < -0.2 ? 'error' : 'warning';

  return (
    <Card
      sx={(theme) => ({
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
        position: 'relative', overflow: 'hidden',
      })}
    >
      <Box sx={(theme) => ({ position: 'absolute', top: -30, left: -30, width: 100, height: 100, borderRadius: '50%', bgcolor: alpha(theme.palette.info.main, 0.06) })} />

      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2, position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={(theme) => ({ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.16) })}>
            <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: 'info.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>گزارش دوره‌ای</Typography>
            <Typography variant="caption" color="text.secondary">
              {data.period_label ? `بازه: ${data.period_label}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack alignItems="flex-end" spacing={1}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Button size="small" variant="outlined" color="default" startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={() => refetch()} sx={{ fontSize: 11, height: 28 }}>بروزرسانی</Button>
            <Button size="small" variant="outlined" color="info"
              startIcon={generateMutation.isPending ? <CircularProgress size={14} /> : <Iconify icon="solar:cpu-bolt-bold" />}
              onClick={() => generateMutation.mutate(selectedHours)} disabled={generateMutation.isPending}
              sx={{ fontSize: 11, height: 28 }}>{generateMutation.isPending ? 'تولید...' : 'تولید با AI'}</Button>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip label={data.sentiment_label} size="small" color={sentimentColor} variant="outlined" icon={<Iconify icon="solar:graph-bold" width={14} />} />
            <Tooltip title="آخرین به‌روزرسانی" arrow>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{formatJalaliDate(data.generated_at)}</Typography>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {/* Timeframe selector — button style */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        {TIMEFRAME_OPTIONS.map((opt) => (
          <Button key={opt.value} size="small"
            variant={selectedHours === opt.value ? 'contained' : 'outlined'}
            color={selectedHours === opt.value ? 'info' : 'inherit'}
            onClick={() => setSelectedHours(opt.value)}
            sx={{ fontSize: 11, height: 28, minWidth: 0, px: 1.5 }}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>

      <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.6), backdropFilter: 'blur(8px)', mb: 2 })}>
        <Typography variant="body2" sx={{ lineHeight: 2, textAlign: 'justify' }}>{data.report}</Typography>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>کلمات کلیدی:</Typography>
        {(data.top_keywords || []).map((kw) => (
          <Chip key={kw} label={kw} size="small" variant="outlined" sx={{ fontSize: 11 }} />
        ))}
      </Stack>
    </Card>
  );
}
