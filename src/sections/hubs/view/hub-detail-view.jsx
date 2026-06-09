'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useHub } from 'src/api/hubs';
import { useTasks } from 'src/api/tasks';
import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';
import { useHubDashboard } from 'src/api/management-dashboards';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

export function HubDetailView({ id }) {
  const { data: hub } = useHub(id);
  const { data: dash, isLoading } = useHubDashboard(id);
  const { data: mediaPage } = useMicroMediaList({ hubId: id, pageSize: 100 });
  const { data: tasksPage } = useTasks({ hubId: id, pageSize: 100 });

  const media = mediaPage?.items ?? [];
  const tasks = tasksPage?.items ?? [];

  const cards = [
    ['کل میکرورسانه‌ها', dash?.totalMicroMedia ?? 0],
    ['فعال', dash?.activeMicroMedia ?? 0],
    ['غیرفعال', dash?.inactiveMicroMedia ?? 0],
    ['تسک‌های باز', dash?.openTasks ?? 0],
    ['تسک‌های انجام‌شده', dash?.completedTasks ?? 0],
  ];

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 2 }}>{hub?.name ?? `هاب #${id}`}</Typography>

      <PageInfoBox
        title="جزئیات هاب"
        icon="solar:folder-bold-duotone"
        color="primary"
        shortDescription="نمای کامل یک هاب: وضعیت کلی، میکرورسانه‌های زیرمجموعه و تسک‌های مرتبط. هاب واحد سازمانی مدیریت میکرورسانه‌هاست."
        tips={[
          'کارت‌های بالا خلاصهٔ وضعیت هاب را نشان می‌دهند (تعداد و فعال/غیرفعال).',
          'رسانهٔ «فعال» یعنی حداقل یک تعامل در ۶ ماه اخیر ثبت شده است.',
          'برای افزودن میکرورسانه به این هاب، از صفحهٔ میکرورسانه‌ها هنگام ساخت/ویرایش، هاب را انتخاب کنید.',
        ]}
      />

      {isLoading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map(([label, val]) => (
            <Grid key={label} size={{ xs: 6, md: 2.4 }}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3">{val}</Typography>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>میکرورسانه‌های این هاب</Typography>
            {media.length === 0 ? (
              <Typography color="text.secondary">میکرورسانه‌ای در این هاب نیست</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>نام</TableCell>
                    <TableCell>حوزه</TableCell>
                    <TableCell align="center">وضعیت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {media.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.activity_domain || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={m.status === 'active' ? 'فعال' : m.status} color={m.status === 'active' ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>تسک‌های هاب</Typography>
            {tasks.length === 0 ? (
              <Typography color="text.secondary">تسکی برای این هاب نیست</Typography>
            ) : (
              <Stack spacing={1}>
                {tasks.map((t) => (
                  <Stack key={t.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: 'background.neutral', borderRadius: 1 }}>
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>{t.title}</Typography>
                    <Chip size="small" label={t.status} />
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
