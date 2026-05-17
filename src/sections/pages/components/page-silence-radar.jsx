'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Radar, Tooltip, PolarGrid, RadarChart, PolarAngleAxis, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DEFAULT_TOPICS =
  'غزه,اقتصاد غزه,انتخابات آمریکا,تغییرات اقلیمی,هوش مصنوعی,بحران انسانی یمن,حقوق بشر,تحریم‌ها,جنگ لبنان,مهاجرت';

const TIME_WINDOWS = [
  { value: 7, label: '۱ هفته اخیر' },
  { value: 14, label: '۲ هفته اخیر' },
  { value: 30, label: '۱ ماه اخیر' },
  { value: 90, label: '۳ ماه اخیر' },
  { value: 365, label: 'یک سال' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.topic}</Box>
      <Box sx={{ fontSize: 11, color: d.covered ? 'success.main' : 'error.main' }}>
        {d.covered ? '✓ این پیج پوشش داده' : '✗ سکوت این پیج'}
      </Box>
    </Box>
  );
}

export function PageSilenceRadar({ pageId }) {
  const theme = useTheme();
  const [topicsInput, setTopicsInput] = useState(DEFAULT_TOPICS);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: async ({ globalTopics, windowDays }) => {
      const res = await axiosInstance.post(endpoints.analytics.pageSilenceRadar(pageId), {
        global_topics: globalTopics,
        days: windowDays,
      });
      return res.data?.data;
    },
    onSuccess: (data) => setResult(data),
  });

  // Initial load when component mounts
  useEffect(() => {
    if (!pageId) return;
    const topics = DEFAULT_TOPICS.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
    mutation.mutate({ globalTopics: topics, windowDays: 30 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const handleAnalyze = () => {
    const topics = topicsInput.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
    if (topics.length > 0) mutation.mutate({ globalTopics: topics, windowDays: days });
  };

  const handleWindowChange = (newDays) => {
    setDays(newDays);
    const topics = topicsInput.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
    if (topics.length > 0) mutation.mutate({ globalTopics: topics, windowDays: newDays });
  };

  const coverageRate = result?.coverage_rate ?? 0;

  const radarData =
    result?.global_topics?.map((topic) => ({
      topic,
      covered: result.covered_topics?.includes(topic),
      value: result.covered_topics?.includes(topic) ? 100 : 20,
      fullMark: 100,
    })) || [];

  const allSilent =
    result &&
    result.covered_topics?.length === 0 &&
    result.silence_gaps?.length === result.global_topics?.length;

  return (
    <Card sx={{ p: 0, height: '100%' }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2.5, pt: 2.5, pb: 1, flexWrap: 'wrap', gap: 1 }}
      >
        <Iconify icon="solar:eye-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          رادار سکوت پیج
        </Typography>
        <IconButton size="small" sx={{ opacity: 0.4 }}>
          <Iconify icon="solar:info-circle-line-duotone" width={16} />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        <TextField
          select
          size="small"
          value={days}
          onChange={(e) => handleWindowChange(Number(e.target.value))}
          disabled={mutation.isPending}
          sx={{ minWidth: 140, '& .MuiInputBase-root': { fontSize: 12 } }}
        >
          {TIME_WINDOWS.map((w) => (
            <MenuItem key={w.value} value={w.value} sx={{ fontSize: 12 }}>
              {w.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: 11 }}>
          چه موضوعات داغی را این پیج پوشش داده و چه‌چیزی را به سکوت برگزار کرده؟
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="موضوعات داغ جهانی (با کاما جدا کنید)..."
            value={topicsInput}
            onChange={(e) => setTopicsInput(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <Iconify icon="solar:magnifer-bold" />
              )
            }
            sx={{ minWidth: 110, whiteSpace: 'nowrap' }}
          >
            تحلیل
          </Button>
        </Stack>

        {mutation.isError && (
          <Box
            sx={(t) => ({
              p: 1.25,
              borderRadius: 1,
              bgcolor: alpha(t.palette.error.main, 0.06),
              border: `1px solid ${alpha(t.palette.error.main, 0.2)}`,
              mb: 2,
            })}
          >
            <Typography variant="caption" color="error.main">
              {mutation.error?.message || 'خطا در محاسبه رادار سکوت'}
            </Typography>
          </Box>
        )}

        {result && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="center">
            {/* Circular Radar */}
            <Box sx={{ width: { xs: '100%', md: 320 }, height: 280, direction: 'ltr', flexShrink: 0 }}>
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
            <Box sx={{ flex: 1, width: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                      نرخ پوشش
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        color:
                          coverageRate > 70
                            ? 'success.main'
                            : coverageRate > 40
                              ? 'warning.main'
                              : 'error.main',
                      }}
                    >
                      {coverageRate}٪
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={coverageRate}
                    color={coverageRate > 70 ? 'success' : coverageRate > 40 ? 'warning' : 'error'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Stack>

              {result.silence_gaps?.length > 0 && (
                <Box
                  sx={(t) => ({
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: alpha(t.palette.error.main, 0.04),
                    border: `1px solid ${alpha(t.palette.error.main, 0.12)}`,
                    mb: 1.25,
                  })}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                    <Iconify
                      icon="solar:shield-warning-bold-duotone"
                      width={16}
                      sx={{ color: 'error.main' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main', fontSize: 11 }}>
                      سکوت ({result.silence_gaps.length})
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {result.silence_gaps.map((gap) => (
                      <Chip
                        key={gap}
                        label={gap}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {result.covered_topics?.length > 0 && (
                <Box
                  sx={(t) => ({
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: alpha(t.palette.success.main, 0.04),
                    border: `1px solid ${alpha(t.palette.success.main, 0.12)}`,
                  })}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      width={16}
                      sx={{ color: 'success.main' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', fontSize: 11 }}>
                      پوشش ({result.covered_topics.length})
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {result.covered_topics.map((topic) => (
                      <Chip
                        key={topic}
                        label={topic}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        )}

        {allSilent && (
          <Box
            sx={(t) => ({
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(t.palette.warning.main, 0.06),
              border: `1px dashed ${alpha(t.palette.warning.main, 0.3)}`,
              mt: 1.5,
            })}
          >
            <Typography variant="caption" color="warning.main" sx={{ fontSize: 11 }}>
              ⚠ این پیج درباره هیچ‌کدام از موضوعات داغ بالا فعالیت قابل‌توجهی نداشته. اگر پست‌ها هنوز
              توسط LLM تحلیل نشده‌اند، ابتدا «پردازش هوشمند» را اجرا کنید یا بازه زمانی را گسترده‌تر کنید.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
