'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalaliDate } from 'src/utils/format-jalali';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTasks, useTasksOverview, useChangeTaskStatus } from 'src/api/tasks';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { TaskFormDialog, STATUS_OPTIONS, PRIORITY_OPTIONS } from './task-form-dialog';

// ----------------------------------------------------------------------

const PRIORITY_MAP = Object.fromEntries(PRIORITY_OPTIONS.map((p) => [p.value, p]));

const isOverdue = (t) =>
  t.due_date &&
  new Date(t.due_date).getTime() < Date.now() &&
  t.status !== 'done' &&
  t.status !== 'cancelled';

function OverviewCards({ overview }) {
  const cards = [
    { label: 'کل تسک‌ها', value: overview?.total ?? 0, icon: 'solar:checklist-minimalistic-bold-duotone', color: 'text.primary' },
    { label: 'باز', value: overview?.open ?? 0, icon: 'solar:inbox-line-bold-duotone', color: 'info.main' },
    { label: 'در حال انجام', value: overview?.in_progress ?? 0, icon: 'solar:hourglass-line-bold-duotone', color: 'warning.main' },
    { label: 'انجام‌شده', value: overview?.done ?? 0, icon: 'solar:check-circle-bold-duotone', color: 'success.main' },
    { label: 'عقب‌افتاده', value: overview?.overdue ?? 0, icon: 'solar:danger-triangle-bold-duotone', color: 'error.main' },
  ];
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((c) => (
        <Grid key={c.label} size={{ xs: 6, md: 2.4 }}>
          <Card sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon={c.icon} width={32} sx={{ color: c.color }} />
              <Box>
                <Typography variant="h5">{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function TasksListView() {
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', overdue: false });
  const [dialog, setDialog] = useState({ open: false, task: null });

  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.search) params.search = filters.search;
  if (filters.overdue) params.overdue = 'true';

  const { data, isLoading } = useTasks(params);
  const { data: overview } = useTasksOverview();
  const changeStatus = useChangeTaskStatus();

  const items = data?.items ?? [];
  const setFilter = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => setDialog({ open: true, task: null });
  const openEdit = (task) => setDialog({ open: true, task });

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">تسک‌ها</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          تسک جدید
        </Button>
      </Stack>

      <PageInfoBox
        title="تسک‌ها"
        icon="solar:checklist-minimalistic-bold-duotone"
        color="info"
        shortDescription="وظایف اجرایی کارشناسان. هر تسک به یک context (هاب/میکرورسانه/عملیات) متصل است، مسئول و سررسید دارد و وضعیتش پیگیری می‌شود."
        tips={[
          'با کارت‌های بالای صفحه وضعیت کلی تسک‌ها و موارد عقب‌افتاده را ببینید.',
          'هر تسک باید حداقل به یک context (هاب/میکرورسانه/عملیات) متصل باشد.',
          'برای ویرایش جزئیات، روی ردیف تسک کلیک کنید؛ وضعیت را از همان جدول هم می‌توانید تغییر دهید.',
        ]}
      />

      <OverviewCards overview={overview} />

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="جستجو"
              value={filters.search}
              onChange={setFilter('search')}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField select fullWidth size="small" label="وضعیت" value={filters.status} onChange={setFilter('status')}>
              <MenuItem value="">همه</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField select fullWidth size="small" label="اولویت" value={filters.priority} onChange={setFilter('priority')}>
              <MenuItem value="">همه</MenuItem>
              {PRIORITY_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant={filters.overdue ? 'contained' : 'outlined'}
              color="error"
              sx={{ height: 40 }}
              onClick={() => setFilters((p) => ({ ...p, overdue: !p.overdue }))}
            >
              عقب‌افتاده
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:checklist-minimalistic-bold-duotone" width={48} />
            <Typography sx={{ mt: 1 }}>تسکی یافت نشد</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>عنوان</TableCell>
                  <TableCell>اولویت</TableCell>
                  <TableCell>متصل به</TableCell>
                  <TableCell>مسئول</TableCell>
                  <TableCell>سررسید</TableCell>
                  <TableCell>برچسب‌ها</TableCell>
                  <TableCell sx={{ width: 150 }}>وضعیت</TableCell>
                  <TableCell align="right">ویرایش</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((t) => {
                  const overdue = isOverdue(t);
                  const prio = PRIORITY_MAP[t.priority] ?? { label: t.priority, color: 'default' };
                  return (
                    <TableRow key={t.id} hover onClick={() => openEdit(t)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography variant="subtitle2">{t.title}</Typography>
                        {t.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                            {t.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="soft" color={prio.color} label={prio.label} />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {t.hub_name && (
                            <Chip size="small" variant="outlined" icon={<Iconify icon="solar:square-academic-cap-bold-duotone" width={14} />} label={t.hub_name} />
                          )}
                          {t.micro_media_name && (
                            <Chip size="small" variant="outlined" icon={<Iconify icon="solar:user-rounded-bold-duotone" width={14} />} label={t.micro_media_name} />
                          )}
                          {t.operation_title && (
                            <Chip size="small" variant="outlined" icon={<Iconify icon="solar:posts-carousel-vertical-bold-duotone" width={14} />} label={t.operation_title} />
                          )}
                          {!t.hub_name && !t.micro_media_name && !t.operation_title && '—'}
                        </Stack>
                      </TableCell>
                      <TableCell>{t.assignee_name || '—'}</TableCell>
                      <TableCell>
                        {t.due_date ? (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="body2" color={overdue ? 'error.main' : 'text.primary'}>
                              {toJalaliDate(t.due_date)}
                            </Typography>
                            {overdue && (
                              <Tooltip title="عقب‌افتاده">
                                <Iconify icon="solar:danger-triangle-bold" width={16} sx={{ color: 'error.main' }} />
                              </Tooltip>
                            )}
                          </Stack>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {(t.tags ?? []).slice(0, 3).map((tag) => (
                          <Chip key={tag} size="small" label={tag} sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TextField
                          select
                          size="small"
                          value={t.status}
                          onChange={(e) => changeStatus.mutate({ id: t.id, status: e.target.value })}
                          sx={{ minWidth: 140 }}
                        >
                          {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton onClick={() => openEdit(t)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <TaskFormDialog
        open={dialog.open}
        task={dialog.task}
        onClose={() => setDialog({ open: false, task: null })}
      />
    </DashboardContent>
  );
}
