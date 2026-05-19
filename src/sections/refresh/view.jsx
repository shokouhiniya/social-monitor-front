'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Checkbox from '@mui/material/Checkbox';
import StepLabel from '@mui/material/StepLabel';
import FormGroup from '@mui/material/FormGroup';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { usePages } from 'src/api/pages';
import { useClusters } from 'src/api/clusters';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEPS = [
  { key: 'fetch', label: 'واکشی پیج‌ها', icon: 'solar:download-minimalistic-bold-duotone' },
  { key: 'process', label: 'تحلیل هوشمند', icon: 'solar:cpu-bolt-bold-duotone' },
  { key: 'dashboards', label: 'بروزرسانی داشبوردها', icon: 'solar:chart-2-bold-duotone' },
];

// ----------------------------------------------------------------------

export function RefreshView() {
  const queryClient = useQueryClient();
  const { data: clusters } = useClusters();
  const { data: pages } = usePages({ limit: 1000 });

  // Normalize pages
  const pageList = Array.isArray(pages) ? pages : pages?.data || [];

  // Config state
  const [scope, setScope] = useState('all');
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [stepServices, setStepServices] = useState({ fetch: true, process: true, dashboards: true });

  // Job state (from server polling)
  const [job, setJob] = useState(null);
  const [polling, setPolling] = useState(false);

  // Poll server for job status
  useEffect(() => {
    let interval;
    if (polling) {
      interval = setInterval(async () => {
        try {
          const res = await axiosInstance.get(endpoints.pages.batchRefreshStatus);
          const data = res.data?.data || res.data;
          setJob(data);
          if (data.status !== 'running') {
            setPolling(false);
            queryClient.invalidateQueries();
          }
        } catch (err) {
          // ignore
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [polling, queryClient]);

  // On mount, check if there's already a running job
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(endpoints.pages.batchRefreshStatus);
        const data = res.data?.data || res.data;
        setJob(data);
        if (data.status === 'running') {
          setPolling(true);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // Get page IDs based on scope
  const getTargetPageIds = useCallback(() => {
    if (!pageList.length) return [];
    if (scope === 'all') return pageList.map((p) => p.id);
    if (scope === 'representatives') return pageList.filter((p) => p.is_representative).map((p) => p.id);
    if (scope === 'cluster' && selectedClusterId) {
      return pageList.filter((p) => p.cluster_id === Number(selectedClusterId)).map((p) => p.id);
    }
    return [];
  }, [pageList, scope, selectedClusterId]);

  const handleStart = useCallback(async () => {
    const pageIds = getTargetPageIds();
    if (pageIds.length === 0 && (stepServices.fetch || stepServices.process)) return;

    try {
      const res = await axiosInstance.post(endpoints.pages.batchRefresh, {
        pageIds,
        steps: stepServices,
        scope: scope === 'cluster' ? `خوشه ${clusters?.find((c) => c.id === Number(selectedClusterId))?.name || selectedClusterId}` : scope === 'representatives' ? 'نمایندگان' : 'کل شبکه',
      });
      const data = res.data?.data || res.data;
      setJob(data.job || data);
      setPolling(true);
    } catch (err) {
      // If error has job info (already running)
      const errData = err?.response?.data?.data;
      if (errData?.job) setJob(errData.job);
    }
  }, [getTargetPageIds, stepServices, scope, selectedClusterId, clusters]);

  const isRunning = job?.status === 'running';
  const pageCount = getTargetPageIds().length;
  const activeStepIndex = job?.currentStep ? STEPS.findIndex((s) => s.key === job.currentStep) : -1;
  const totalDone = (job?.completed || 0) + (job?.failed || 0);
  const progressPercent = job?.totalPages > 0 ? Math.round((totalDone / job.totalPages) * 100) : 0;

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={3}>
        {/* Header */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.lighter' }}>
              <Iconify icon="solar:refresh-circle-bold-duotone" width={36} sx={{ color: 'primary.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">مرکز بروزرسانی</Typography>
              <Typography variant="body2" color="text.secondary">
                واکشی، تحلیل هوشمند و بروزرسانی داشبوردها — ۲۰ پیج موازی
              </Typography>
            </Box>
            {isRunning && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip icon={<CircularProgress size={14} />} label="در حال اجرا..." color="warning" variant="outlined" />
                <Button size="small" color="error" variant="outlined" startIcon={<Iconify icon="solar:stop-bold" />}
                  onClick={async () => {
                    try {
                      await axiosInstance.post(endpoints.pages.batchRefreshCancel);
                      setPolling(false);
                      const res = await axiosInstance.get(endpoints.pages.batchRefreshStatus);
                      setJob(res.data?.data || res.data);
                    } catch (e) { /* ignore */ }
                  }}>
                  لغو
                </Button>
              </Stack>
            )}
            {job?.status === 'completed' && (
              <Chip icon={<Iconify icon="solar:check-circle-bold" width={16} />} label="تکمیل شد" color="success" variant="outlined" />
            )}
          </Stack>
        </Card>

        {/* Guide */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          <Typography variant="subtitle2" gutterBottom>ترتیب عادی بروزرسانی:</Typography>
          <Typography variant="body2">
            ۱. <strong>واکشی</strong> (دانلود پست‌ها) → ۲. <strong>تحلیل</strong> (AI) → ۳. <strong>داشبوردها</strong> (شاخص‌ها و گزارش).
            پردازش سمت سرور اجرا میشه — میتونید صفحه رو ببندید و بعداً برگردید.
          </Typography>
        </Alert>

        {/* Stepper */}
        <Card sx={{ p: 3 }}>
          <Stepper activeStep={activeStepIndex} alternativeLabel>
            {STEPS.map((step, index) => (
              <Step key={step.key} completed={job?.status === 'completed' || (isRunning && activeStepIndex > index)}>
                <StepLabel
                  icon={
                    activeStepIndex === index && isRunning ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Iconify icon={step.icon} width={24} color={
                        (job?.status === 'completed' || (isRunning && activeStepIndex > index)) ? 'success.main' : 'text.disabled'
                      } />
                    )
                  }
                >
                  <Typography variant="caption" fontWeight="bold">{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Progress bar */}
          {isRunning && job?.currentStep !== 'dashboards' && (
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {job?.currentStep === 'fetch' ? 'واکشی' : 'تحلیل'}: {totalDone} / {job?.totalPages}
                </Typography>
                <Typography variant="caption" fontWeight="bold">{progressPercent}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
              <Stack direction="row" spacing={2}>
                <Chip label={`✅ ${job?.completed || 0}`} size="small" color="success" variant="outlined" />
                <Chip label={`❌ ${job?.failed || 0}`} size="small" color="error" variant="outlined" />
              </Stack>
            </Stack>
          )}
        </Card>

        {/* Configuration — only show when not running */}
        {!isRunning && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                <Iconify icon="solar:settings-minimalistic-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
                تنظیمات
              </Typography>

              <Divider />

              {/* Scope */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>دامنه</Typography>
                <FormControl>
                  <RadioGroup value={scope} onChange={(e) => setScope(e.target.value)}>
                    <FormControlLabel value="all" control={<Radio size="small" />} label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>کل شبکه</span>
                        <Chip label={`${pageList.length} پیج`} size="small" />
                      </Stack>
                    } />
                    <FormControlLabel value="representatives" control={<Radio size="small" />} label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>نمایندگان</span>
                        <Chip label={`${pageList.filter((p) => p.is_representative).length} پیج`} size="small" color="primary" />
                      </Stack>
                    } />
                    <FormControlLabel value="cluster" control={<Radio size="small" />} label="خوشه خاص" />
                  </RadioGroup>
                </FormControl>
                {scope === 'cluster' && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1, ml: 4 }}>
                    {(clusters || []).map((c) => (
                      <Chip key={c.id} label={`${c.name} (${c.pages_count || 0})`} size="small"
                        variant={selectedClusterId === c.id ? 'filled' : 'outlined'}
                        color={selectedClusterId === c.id ? 'primary' : 'default'}
                        onClick={() => setSelectedClusterId(c.id)} />
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Steps */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>مراحل</Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked={stepServices.fetch} onChange={(e) => setStepServices((s) => ({ ...s, fetch: e.target.checked }))} size="small" />}
                    label={<Stack><Typography variant="body2" fontWeight="bold">۱. واکشی (Fetch)</Typography><Typography variant="caption" color="text.secondary">دانلود پست‌ها از شبکه اجتماعی</Typography></Stack>} />
                  <FormControlLabel control={<Checkbox checked={stepServices.process} onChange={(e) => setStepServices((s) => ({ ...s, process: e.target.checked }))} size="small" />}
                    label={<Stack><Typography variant="body2" fontWeight="bold">۲. تحلیل هوشمند (Process)</Typography><Typography variant="caption" color="text.secondary">احساسات، کلمات کلیدی، OCR، رونوشت</Typography></Stack>} />
                  <FormControlLabel control={<Checkbox checked={stepServices.dashboards} onChange={(e) => setStepServices((s) => ({ ...s, dashboards: e.target.checked }))} size="small" />}
                    label={<Stack><Typography variant="body2" fontWeight="bold">۳. داشبوردها</Typography><Typography variant="caption" color="text.secondary">شاخص‌ها، گزارش AI، هشدارها</Typography></Stack>} />
                </FormGroup>
              </Box>

              <Divider />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1}>
                  <Chip icon={<Iconify icon="solar:users-group-rounded-bold" width={16} />} label={`${pageCount} پیج`} size="small" color="info" />
                  <Chip icon={<Iconify icon="solar:layers-bold" width={16} />} label={`${Object.values(stepServices).filter(Boolean).length} مرحله`} size="small" color="warning" />
                </Stack>
                <Button variant="contained" size="large" disabled={pageCount === 0}
                  startIcon={<Iconify icon="solar:play-bold" />} onClick={handleStart}>
                  شروع بروزرسانی
                </Button>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Logs */}
        {job?.logs?.length > 0 && (
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Iconify icon="solar:document-text-bold-duotone" />
              <Typography variant="subtitle2">گزارش عملیات</Typography>
              <Chip label={job.logs.length} size="small" />
              {job.startedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  شروع: {new Date(job.startedAt).toLocaleString('fa-IR')}
                </Typography>
              )}
            </Stack>
            <Box sx={{ maxHeight: 350, overflow: 'auto', bgcolor: 'grey.900', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 12, direction: 'ltr', textAlign: 'left' }}>
              {job.logs.map((log, i) => (
                <Box key={i} sx={{ color: log.type === 'error' ? 'error.light' : log.type === 'success' ? 'success.light' : 'grey.300', py: 0.2 }}>
                  <Typography component="span" sx={{ color: 'grey.500', mr: 1, fontSize: 11 }}>[{log.time}]</Typography>
                  {log.msg}
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* Tips */}
        <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2" gutterBottom>
            <Iconify icon="solar:lightbulb-bolt-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
            نکات
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">• پردازش سمت سرور اجرا میشه — صفحه رو ببندید هم ادامه داره.</Typography>
            <Typography variant="body2" color="text.secondary">• ۲۰ پیج همزمان پردازش میشن (pool موازی).</Typography>
            <Typography variant="body2" color="text.secondary">• اگه job در حال اجراست، درخواست جدید رد میشه.</Typography>
            <Typography variant="body2" color="text.secondary">• هر تحلیل پیج ≈ ۰.۰۲$ هزینه LLM. ۱۰۰ پیج ≈ ۲$.</Typography>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
