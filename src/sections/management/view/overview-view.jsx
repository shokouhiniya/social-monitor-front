'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useManagementDashboard } from 'src/api/management-dashboards';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------
// داشبورد کلان مدیریت (micromedia-transformation فاز ۳) — endpoint تجمیعی
// /dashboards/management. به سؤالات مدیریتی PRD پاسخ می‌دهد.
// ----------------------------------------------------------------------

export function ManagementOverviewView() {
  const router = useRouter();
  const { data, isLoading } = useManagementDashboard();

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }

  const d = data ?? {};

  const cards = [
    { label: 'کل میکرورسانه‌ها', value: d.totalMicroMedia ?? 0, icon: 'solar:users-group-rounded-bold-duotone', color: 'primary.main', path: paths.dashboard.microMedia.root },
    { label: 'دارای تعامل اخیر', value: d.microMediaWithRecentInteraction ?? 0, icon: 'solar:chat-round-dots-bold-duotone', color: 'success.main', path: paths.dashboard.interactions },
    { label: 'بدون تعامل ۶ ماه', value: d.microMediaWithoutInteractionInLast6Months ?? 0, icon: 'solar:bell-off-bold-duotone', color: 'warning.main', path: paths.dashboard.microMedia.root },
    { label: 'بدون امتیاز', value: d.microMediaWithoutScore ?? 0, icon: 'solar:star-shine-bold-duotone', color: 'info.main', path: paths.dashboard.mediaScore },
    { label: 'بدون هاب', value: d.microMediaWithoutHub ?? 0, icon: 'solar:folder-error-bold-duotone', color: 'error.main', path: paths.dashboard.hubs.root },
    { label: 'عملیات فعال', value: d.activeOperations ?? 0, icon: 'solar:posts-carousel-vertical-bold-duotone', color: 'secondary.main', path: paths.dashboard.operations.root },
    { label: 'تسک‌های باز', value: d.openTasks ?? 0, icon: 'solar:checklist-minimalistic-bold-duotone', color: 'primary.main', path: paths.dashboard.tasks.root },
    { label: 'تسک‌های عقب‌افتاده', value: d.overdueTasks ?? 0, icon: 'solar:alarm-bold-duotone', color: 'error.main', path: paths.dashboard.tasks.root },
  ];

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">داشبورد کلان</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => router.push(paths.dashboard.microMedia.new)}>
          میکرورسانه جدید
        </Button>
      </Stack>

      <PageInfoBox
        title="داشبورد کلان"
        icon="solar:chart-2-bold-duotone"
        color="primary"
        shortDescription="نمای مدیریتی کل زیست‌بوم میکرورسانه‌ها: تعداد، تعامل، امتیاز، پوشش هاب‌ها و وضعیت عملیات و تسک‌ها."
        tips={[
          'روی هر کارت کلیک کنید تا به صفحهٔ مربوطه بروید.',
          '«بدون تعامل ۶ ماه» و «بدون امتیاز» نقاط نیازمند پیگیری را نشان می‌دهند.',
          '«حوزه‌های با پوشش ضعیف» به شناسایی شکاف‌های پوشش کمک می‌کند.',
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid key={c.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 3, cursor: 'pointer', height: '100%' }} onClick={() => router.push(c.path)}>
              <Stack spacing={1} alignItems="flex-start">
                <Iconify icon={c.icon} width={32} sx={{ color: c.color }} />
                <Typography variant="h3">{c.value}</Typography>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>پوشش هاب‌ها</Typography>
            {(d.hubCoverageSummary ?? []).length === 0 ? (
              <Typography color="text.secondary">هابی ثبت نشده</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>هاب</TableCell>
                    <TableCell align="center">کل رسانه</TableCell>
                    <TableCell align="center">فعال</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(d.hubCoverageSummary ?? []).map((h) => (
                    <TableRow key={h.hub_id} hover>
                      <TableCell>{h.hub_name}</TableCell>
                      <TableCell align="center">{h.total}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={h.active} color={h.active > 0 ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>حوزه‌های با پوشش ضعیف</Typography>
            {(d.weakDomains ?? []).length === 0 ? (
              <Typography color="text.secondary">داده‌ای نیست</Typography>
            ) : (
              <Stack spacing={1}>
                {(d.weakDomains ?? []).map((w) => (
                  <Stack key={w.domain} direction="row" justifyContent="space-between" sx={{ p: 1, bgcolor: 'background.neutral', borderRadius: 1 }}>
                    <Typography>{w.domain}</Typography>
                    <Chip size="small" color="warning" label={`${w.inactiveCount} بدون تعامل`} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">آخرین تعاملات</Typography>
              <Button size="small" onClick={() => router.push(paths.dashboard.interactions)}>
                مشاهدهٔ همه
              </Button>
            </Stack>
            {(d.recentInteractions ?? []).length === 0 ? (
              <Typography color="text.secondary">تعاملی ثبت نشده</Typography>
            ) : (
              <Stack spacing={1}>
                {(d.recentInteractions ?? []).slice(0, 8).map((it) => (
                  <Stack
                    key={it.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Iconify icon="solar:chat-round-dots-bold-duotone" width={20} sx={{ color: 'success.main', flexShrink: 0 }} />
                    <Chip size="small" label={it.type || 'تعامل'} />
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                      {it.summary || it.note || (it.micro_media_id ? `میکرورسانه #${it.micro_media_id}` : '—')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {it.interaction_date || it.created_at
                        ? new Date(it.interaction_date || it.created_at).toLocaleDateString('fa-IR')
                        : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
