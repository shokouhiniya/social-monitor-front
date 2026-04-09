'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

import { useMutation } from '@tanstack/react-query';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const DEFAULT_TOPICS = 'غزه,اقتصاد غزه,انتخابات آمریکا,تغییرات اقلیمی,هوش مصنوعی,بحران انسانی یمن,حقوق بشر,تحریم‌ها,جنگ لبنان,مهاجرت';

export function SilenceRadar() {
  const [topicsInput, setTopicsInput] = useState(DEFAULT_TOPICS);
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: async (globalTopics) => {
      const res = await axiosInstance.post(endpoints.analytics.silenceRadar, { global_topics: globalTopics });
      return res.data?.data;
    },
    onSuccess: (data) => setResult(data),
  });

  // Auto-analyze on mount with default topics
  useEffect(() => {
    const topics = DEFAULT_TOPICS.split(',').map((t) => t.trim()).filter(Boolean);
    mutation.mutate(topics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = () => {
    const topics = topicsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (topics.length > 0) mutation.mutate(topics);
  };

  const coverageRate = result?.coverage_rate ?? 0;
  const coverageColor = coverageRate > 70 ? 'success' : coverageRate > 40 ? 'warning' : 'error';

  return (
    <ChartCard
      title="رادار سکوت"
      icon="solar:eye-bold-duotone"
      info="مقایسه موضوعات داغ جهانی با پوشش شبکه ما. شکاف‌ها = موضوعاتی که شبکه نسبت به آن‌ها سکوت کرده"
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField
          fullWidth size="small"
          placeholder="موضوعات داغ جهانی (با کاما جدا کنید)..."
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
        />
        <Button
          variant="contained" onClick={handleAnalyze} disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:magnifer-bold" />}
          sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
        >
          تحلیل شکاف
        </Button>
      </Stack>

      {result && (
        <Box>
          {/* Coverage meter */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>نرخ پوشش شبکه</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: `${coverageColor}.main` }}>{coverageRate}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate" value={coverageRate}
                color={coverageColor}
                sx={{ height: 10, borderRadius: 1 }}
              />
            </Box>
            <Tooltip title="تعداد شکاف‌های شناسایی‌شده" arrow>
              <Chip
                label={`${result.silence_gaps?.length || 0} شکاف`}
                color={result.silence_gaps?.length > 3 ? 'error' : 'warning'}
                size="small"
                icon={<Iconify icon="solar:danger-triangle-bold" width={14} />}
              />
            </Tooltip>
          </Stack>

          {/* Gaps */}
          {result.silence_gaps?.length > 0 && (
            <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`, mb: 2 })}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Iconify icon="solar:shield-warning-bold-duotone" width={18} sx={{ color: 'error.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                  موضوعات بدون پوشش — نیاز به اقدام فوری
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {result.silence_gaps.map((gap) => (
                  <Chip key={gap} label={gap} size="small" color="error" variant="outlined" icon={<Iconify icon="solar:close-circle-bold" width={14} />} />
                ))}
              </Box>
            </Box>
          )}

          {/* Covered */}
          {result.covered_topics?.length > 0 && (
            <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` })}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Iconify icon="solar:check-circle-bold-duotone" width={18} sx={{ color: 'success.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                  موضوعات پوشش داده شده
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {result.covered_topics.map((topic) => (
                  <Chip key={topic} label={topic} size="small" color="success" variant="outlined" icon={<Iconify icon="solar:check-circle-bold" width={14} />} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </ChartCard>
  );
}
