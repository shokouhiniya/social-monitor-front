'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Radar, Tooltip, PolarGrid, RadarChart, PolarAngleAxis, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const DEFAULT_TOPICS = 'غزه,اقتصاد غزه,انتخابات آمریکا,تغییرات اقلیمی,هوش مصنوعی,بحران انسانی یمن,حقوق بشر,تحریم‌ها,جنگ لبنان,مهاجرت';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.topic}</Box>
      <Box sx={{ fontSize: 11, color: d.covered ? 'success.main' : 'error.main' }}>
        {d.covered ? '✓ پوشش داده شده' : '✗ سکوت'}
      </Box>
    </Box>
  );
}

export function SilenceRadar() {
  const theme = useTheme();
  const [topicsInput, setTopicsInput] = useState(DEFAULT_TOPICS);
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: async (globalTopics) => {
      const res = await axiosInstance.post(endpoints.analytics.silenceRadar, { global_topics: globalTopics });
      return res.data?.data;
    },
    onSuccess: (data) => setResult(data),
  });

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

  // Build radar data
  const radarData = result?.global_topics?.map((topic) => ({
    topic,
    covered: result.covered_topics?.includes(topic),
    value: result.covered_topics?.includes(topic) ? 100 : 20,
    fullMark: 100,
  })) || [];

  return (
    <ChartCard
      title="رادار سکوت"
      icon="solar:eye-bold-duotone"
      info="دایره بیرونی = موضوعات داغ جهانی. لکه رنگی = پوشش شبکه ما. هر چقدر لکه به لبه نزدیک‌تر باشد، شبکه به‌روزتر است."
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
          تحلیل
        </Button>
      </Stack>

      {result && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          {/* Circular Radar */}
          <Box sx={{ width: 320, height: 280, direction: 'ltr', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={alpha(theme.palette.text.primary, 0.1)} />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="پوشش"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          {/* Details */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>نرخ پوشش</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: coverageRate > 70 ? 'success.main' : coverageRate > 40 ? 'warning.main' : 'error.main' }}>
                    {coverageRate}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate" value={coverageRate}
                  color={coverageRate > 70 ? 'success' : coverageRate > 40 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Stack>

            {result.silence_gaps?.length > 0 && (
              <Box sx={(t) => ({ p: 1.5, borderRadius: 1.5, bgcolor: alpha(t.palette.error.main, 0.04), border: `1px solid ${alpha(t.palette.error.main, 0.12)}`, mb: 1.5 })}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                  <Iconify icon="solar:shield-warning-bold-duotone" width={16} sx={{ color: 'error.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>سکوت</Typography>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {result.silence_gaps.map((gap) => (
                    <Chip key={gap} label={gap} size="small" color="error" variant="outlined" sx={{ fontSize: 10 }} />
                  ))}
                </Box>
              </Box>
            )}

            {result.covered_topics?.length > 0 && (
              <Box sx={(t) => ({ p: 1.5, borderRadius: 1.5, bgcolor: alpha(t.palette.success.main, 0.04), border: `1px solid ${alpha(t.palette.success.main, 0.12)}` })}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={16} sx={{ color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>پوشش</Typography>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {result.covered_topics.map((topic) => (
                    <Chip key={topic} label={topic} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      )}

      {result && result.covered_topics?.length === 0 && result.silence_gaps?.length === result.global_topics?.length && (
        <Box sx={(t) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(t.palette.warning.main, 0.06), border: `1px dashed ${alpha(t.palette.warning.main, 0.3)}`, mt: 1.5 })}>
          <Typography variant="caption" color="warning.main">
            ⚠ همه موضوعات به عنوان «سکوت» شناسایی شدند. اگر پست‌ها هنوز توسط LLM تحلیل نشده‌اند، ابتدا از صفحه پیج‌ها دکمه «تحلیل هوشمند» را بزنید.
          </Typography>
        </Box>
      )}
    </ChartCard>
  );
}
