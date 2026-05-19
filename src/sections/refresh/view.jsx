'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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
import Accordion from '@mui/material/Accordion';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { usePages } from 'src/api/pages';
import { useClusters } from 'src/api/clusters';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEPS = [
  {
    label: 'واکشی پیج‌ها',
    description: 'دانلود آخرین پست‌ها و اطلاعات پروفایل از اینستاگرام/تلگرام',
    icon: 'solar:download-minimalistic-bold-duotone',
  },
  {
    label: 'تحلیل پیج‌ها',
    description: 'پردازش هوشمند: تحلیل احساسات، استخراج کلمات کلیدی، OCR و رونوشت',
    icon: 'solar:cpu-bolt-bold-duotone',
  },
  {
    label: 'بروزرسانی داشبوردها',
    description: 'محاسبه شاخص‌ها، تولید گزارش AI و هشدارهای استراتژیک',
    icon: 'solar:chart-2-bold-duotone',
  },
];

// ----------------------------------------------------------------------

export function RefreshView() {
  const queryClient = useQueryClient();
  const { data: clusters } = useClusters();
  const { data: pages } = usePages({ limit: 1000 });

  // State
  const [scope, setScope] = useState('all'); // all | representatives | cluster
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepServices, setStepServices] = useState({
    fetch: true,
    process: true,
    dashboards: true,
  });

  // Normalize pages data (could be array or paginated object)
  const pageList = Array.isArray(pages) ? pages : pages?.data || [];

  const addLog = useCallback((msg, type = 'info') => {
    setLogs((prev) => [...prev, { msg, type, time: new Date().toLocaleTimeString('fa-IR') }]);
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

  // Step 1: Fetch pages
  const runFetch = useCallback(async (pageIds) => {
    setActiveStep(0);
    setProgress({ current: 0, total: pageIds.length, label: 'واکشی...' });
    addLog(`🚀 شروع واکشی ${pageIds.length} پیج...`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < pageIds.length; i += 1) {
      const id = pageIds[i];
      const page = pageList.find((p) => p.id === id);
      const name = page?.name || page?.username || `#${id}`;
      setProgress({ current: i + 1, total: pageIds.length, label: `واکشی ${name}...` });

      try {
        await axiosInstance.post(endpoints.pages.fetch(id));
        success += 1;
        addLog(`✅ ${name} واکشی شد`, 'success');
      } catch (err) {
        failed += 1;
        addLog(`❌ ${name}: ${err.message}`, 'error');
      }

      // Small delay to avoid rate limiting
      if (i < pageIds.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    addLog(`📊 واکشی تمام شد: ${success} موفق، ${failed} ناموفق`);
    setCompletedSteps((prev) => [...prev, 0]);
  }, [pageList, addLog]);

  // Step 2: Process pages
  const runProcess = useCallback(async (pageIds) => {
    setActiveStep(1);
    setProgress({ current: 0, total: pageIds.length, label: 'تحلیل...' });
    addLog(`🧠 شروع تحلیل هوشمند ${pageIds.length} پیج...`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < pageIds.length; i += 1) {
      const id = pageIds[i];
      const page = pageList.find((p) => p.id === id);
      const name = page?.name || page?.username || `#${id}`;
      setProgress({ current: i + 1, total: pageIds.length, label: `تحلیل ${name}...` });

      try {
        await axiosInstance.post(endpoints.pages.process(id), { timeRange: '1w' });
        success += 1;
        addLog(`✅ ${name} تحلیل شد`, 'success');
      } catch (err) {
        failed += 1;
        addLog(`❌ ${name}: ${err.message}`, 'error');
      }

      // Longer delay for LLM calls
      if (i < pageIds.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    addLog(`📊 تحلیل تمام شد: ${success} موفق، ${failed} ناموفق`);
    setCompletedSteps((prev) => [...prev, 1]);
  }, [pageList, addLog]);

  // Step 3: Refresh dashboards
  const runDashboards = useCallback(async () => {
    setActiveStep(2);
    setProgress({ current: 0, total: 4, label: 'بروزرسانی داشبوردها...' });
    addLog('📈 شروع بروزرسانی داشبوردها و شاخص‌ها...');

    try {
      setProgress({ current: 1, total: 4, label: 'بروزرسانی اتاق وضعیت...' });
      await axiosInstance.post(endpoints.analytics.refresh);
      addLog('✅ داشبورد اصلی بروز شد', 'success');

      setProgress({ current: 2, total: 4, label: 'تولید گزارش AI...' });
      await axiosInstance.post(endpoints.analytics.generateReport, { hours: 6 });
      addLog('✅ گزارش AI تولید شد', 'success');

      setProgress({ current: 3, total: 4, label: 'تولید هشدارهای استراتژیک...' });
      await axiosInstance.post(endpoints.analytics.generateAlerts);
      addLog('✅ هشدارهای استراتژیک تولید شد', 'success');

      setProgress({ current: 4, total: 4, label: 'تمام!' });
      addLog('✅ همه داشبوردها بروز شدند', 'success');
    } catch (err) {
      addLog(`❌ خطا در بروزرسانی داشبوردها: ${err.message}`, 'error');
    }

    setCompletedSteps((prev) => [...prev, 2]);
  }, [addLog]);

  // Run all selected steps
  const handleStart = useCallback(async () => {
    const pageIds = getTargetPageIds();
    if (pageIds.length === 0 && (stepServices.fetch || stepServices.process)) {
      addLog('⚠️ هیچ پیجی انتخاب نشده!', 'error');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setCompletedSteps([]);
    setActiveStep(-1);

    addLog(`🎯 دامنه: ${scope === 'all' ? 'کل شبکه' : scope === 'representatives' ? 'نمایندگان' : `خوشه ${clusters?.find((c) => c.id === Number(selectedClusterId))?.name || selectedClusterId}`} (${pageIds.length} پیج)`);

    try {
      if (stepServices.fetch) {
        await runFetch(pageIds);
      }
      if (stepServices.process) {
        await runProcess(pageIds);
      }
      if (stepServices.dashboards) {
        await runDashboards();
      }

      addLog('🎉 بروزرسانی کامل شد!', 'success');
      // Invalidate all queries
      queryClient.invalidateQueries();
    } catch (err) {
      addLog(`💥 خطای غیرمنتظره: ${err.message}`, 'error');
    }

    setIsRunning(false);
    setActiveStep(-1);
  }, [getTargetPageIds, stepServices, scope, selectedClusterId, clusters, runFetch, runProcess, runDashboards, addLog, queryClient]);

  const pageCount = getTargetPageIds().length;

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
                واکشی داده‌ها، تحلیل هوشمند و بروزرسانی داشبوردها — به ترتیب مراحل زیر
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Guide */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          <Typography variant="subtitle2" gutterBottom>ترتیب عادی بروزرسانی:</Typography>
          <Typography variant="body2">
            ۱. ابتدا <strong>واکشی</strong> کنید (دانلود پست‌های جدید) → ۲. سپس <strong>تحلیل</strong> کنید (AI روی پست‌ها اجرا شود) → ۳. در نهایت <strong>داشبوردها</strong> را بروز کنید.
            اگر فقط می‌خواهید داشبوردها را با داده‌های موجود بروز کنید، فقط مرحله ۳ را فعال بگذارید.
          </Typography>
        </Alert>

        {/* Stepper */}
        <Card sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((step, index) => (
              <Step key={step.label} completed={completedSteps.includes(index)}>
                <StepLabel
                  icon={
                    activeStep === index ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Iconify icon={step.icon} width={24} color={completedSteps.includes(index) ? 'success.main' : 'text.disabled'} />
                    )
                  }
                >
                  <Typography variant="caption" fontWeight="bold">{step.label}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">{step.description}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>

        {/* Configuration */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              <Iconify icon="solar:settings-minimalistic-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
              تنظیمات بروزرسانی
            </Typography>

            <Divider />

            {/* Scope selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>دامنه (کدام پیج‌ها؟)</Typography>
              <FormControl>
                <RadioGroup value={scope} onChange={(e) => setScope(e.target.value)}>
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>کل شبکه</span>
                        <Chip label={`${pageList.length} پیج`} size="small" color="default" />
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="representatives"
                    control={<Radio size="small" />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>فقط نمایندگان</span>
                        <Chip label={`${pageList.filter((p) => p.is_representative)?.length || 0} پیج`} size="small" color="primary" />
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="cluster"
                    control={<Radio size="small" />}
                    label="یک خوشه خاص"
                  />
                </RadioGroup>
              </FormControl>

              {scope === 'cluster' && (
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1, ml: 4 }}>
                  {(clusters || []).map((cluster) => (
                    <Chip
                      key={cluster.id}
                      label={`${cluster.name} (${cluster.pages_count || 0})`}
                      size="small"
                      variant={selectedClusterId === cluster.id ? 'filled' : 'outlined'}
                      color={selectedClusterId === cluster.id ? 'primary' : 'default'}
                      onClick={() => setSelectedClusterId(cluster.id)}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Steps selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>مراحل (چه کارهایی انجام شود؟)</Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={stepServices.fetch} onChange={(e) => setStepServices((s) => ({ ...s, fetch: e.target.checked }))} size="small" />}
                  label={
                    <Stack>
                      <Typography variant="body2" fontWeight="bold">۱. واکشی (Fetch)</Typography>
                      <Typography variant="caption" color="text.secondary">دانلود آخرین پست‌ها و اطلاعات پروفایل از شبکه اجتماعی</Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  control={<Checkbox checked={stepServices.process} onChange={(e) => setStepServices((s) => ({ ...s, process: e.target.checked }))} size="small" />}
                  label={
                    <Stack>
                      <Typography variant="body2" fontWeight="bold">۲. تحلیل هوشمند (Process)</Typography>
                      <Typography variant="caption" color="text.secondary">تحلیل احساسات، استخراج کلمات کلیدی، OCR، رونوشت صوتی و امتیازدهی</Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  control={<Checkbox checked={stepServices.dashboards} onChange={(e) => setStepServices((s) => ({ ...s, dashboards: e.target.checked }))} size="small" />}
                  label={
                    <Stack>
                      <Typography variant="body2" fontWeight="bold">۳. بروزرسانی داشبوردها</Typography>
                      <Typography variant="caption" color="text.secondary">محاسبه شاخص‌ها (هم‌گرایی، هم‌راستایی، فعالیت)، تولید گزارش AI و هشدارهای استراتژیک</Typography>
                    </Stack>
                  }
                />
              </FormGroup>
            </Box>

            <Divider />

            {/* Summary & Start */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<Iconify icon="solar:users-group-rounded-bold" width={16} />}
                  label={`${pageCount} پیج`}
                  size="small"
                  color="info"
                />
                <Chip
                  icon={<Iconify icon="solar:layers-bold" width={16} />}
                  label={`${Object.values(stepServices).filter(Boolean).length} مرحله`}
                  size="small"
                  color="warning"
                />
              </Stack>

              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={isRunning || pageCount === 0}
                startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:play-bold" />}
                onClick={handleStart}
              >
                {isRunning ? 'در حال اجرا...' : 'شروع بروزرسانی'}
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Progress */}
        {isRunning && progress.total > 0 && (
          <Card sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">{progress.label}</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {progress.current} / {progress.total}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(progress.current / progress.total) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          </Card>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <Card sx={{ p: 2 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:document-text-bold-duotone" />
                  <Typography variant="subtitle2">گزارش عملیات</Typography>
                  <Chip label={logs.length} size="small" />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    maxHeight: 400,
                    overflow: 'auto',
                    bgcolor: 'grey.900',
                    borderRadius: 1,
                    p: 2,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                >
                  {logs.map((log, i) => (
                    <Box
                      key={i}
                      sx={{
                        color: log.type === 'error' ? 'error.light' : log.type === 'success' ? 'success.light' : 'grey.300',
                        py: 0.25,
                      }}
                    >
                      <Typography component="span" sx={{ color: 'grey.500', mr: 1, fontSize: 11 }}>
                        [{log.time}]
                      </Typography>
                      {log.msg}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Card>
        )}

        {/* Tips */}
        <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle2" gutterBottom>
            <Iconify icon="solar:lightbulb-bolt-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
            نکات مهم
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              • <strong>اولین بار:</strong> همه ۳ مرحله را اجرا کنید تا سامانه کامل پر شود.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>بروزرسانی روزانه:</strong> فقط واکشی + تحلیل کافیست. داشبوردها خودکار بروز می‌شوند.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>فقط داشبورد:</strong> اگر پست‌ها قبلاً تحلیل شده‌اند و فقط شاخص‌ها نیاز به محاسبه مجدد دارند.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>نمایندگان:</strong> برای تست سریع، فقط نمایندگان خوشه‌ها را بروز کنید (سریع‌تر و ارزان‌تر).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>هزینه:</strong> هر تحلیل پیج حدود ۰.۰۲$ هزینه LLM دارد. ۱۰۰ پیج ≈ ۲$.
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
