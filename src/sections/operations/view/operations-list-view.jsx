'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toJalaliDate } from 'src/utils/format-jalali';

import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';
import { useOperations, useCreateOperation, useAddOperationMedia } from 'src/api/operations';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const STATUS = {
  draft: { label: 'پیش‌نویس', color: 'default' },
  active: { label: 'فعال', color: 'success' },
  completed: { label: 'تمام‌شده', color: 'info' },
  cancelled: { label: 'لغوشده', color: 'error' },
};

const STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'active', label: 'فعال' },
  { value: 'completed', label: 'تمام‌شده' },
  { value: 'cancelled', label: 'لغوشده' },
];

const fmtNum = (n) => new Intl.NumberFormat('fa-IR').format(n ?? 0);

const dateRange = (s, e) => {
  if (!s && !e) return '—';
  return `${s ? toJalaliDate(s) : '…'} تا ${e ? toJalaliDate(e) : '…'}`;
};

export function OperationsListView() {
  const router = useRouter();
  const { data, isLoading } = useOperations();
  const { data: allMedia } = useMicroMediaList({ pageSize: 200 });
  const createOp = useCreateOperation();
  const addMedia = useAddOperationMedia();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    goal: '',
    description: '',
    status: 'draft',
    starts_at: '',
    ends_at: '',
  });
  const [selectedMedia, setSelectedMedia] = useState([]);

  const items = data?.items ?? [];
  const mediaOptions = allMedia?.items ?? [];

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const resetForm = () => {
    setForm({ title: '', goal: '', description: '', status: 'draft', starts_at: '', ends_at: '' });
    setSelectedMedia([]);
  };

  const handleCreate = async () => {
    try {
      const created = await createOp.mutateAsync({
        title: form.title,
        goal: form.goal || undefined,
        description: form.description || undefined,
        status: form.status,
        starts_at: form.starts_at || undefined,
        ends_at: form.ends_at || undefined,
      });
      if (selectedMedia.length > 0) {
        await addMedia.mutateAsync({
          id: created.id,
          micro_media_ids: selectedMedia.map((m) => m.id),
        });
      }
      toast.success('عملیات ایجاد شد');
      setOpen(false);
      resetForm();
      router.push(paths.dashboard.operations.detail(created.id));
    } catch (err) {
      toast.error(err?.message || 'ایجاد عملیات با خطا مواجه شد');
    }
  };

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">عملیات‌ها</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpen(true)}>
          عملیات جدید
        </Button>
      </Stack>

      <PageInfoBox
        title="عملیات‌ها (کمپین)"
        icon="solar:posts-carousel-vertical-bold-duotone"
        color="secondary"
        shortDescription="عملیات یک فعالیت هدفمند و زمان‌دار است که چند میکرورسانه را برای رسیدن به یک هدف مشخص هماهنگ می‌کند؛ برای رسانه‌ها تسک تعریف می‌شود، خروجی ثبت می‌گردد و اثر آن سنجیده می‌شود."
        tips={[
          'هنگام ساخت عملیات می‌توانید بازهٔ زمانی و میکرورسانه‌های هدف را انتخاب کنید.',
          'در صفحهٔ جزئیات: رسانه‌ها، تسک‌ها، خروجی‌ها و اثرسنجی را مدیریت کنید.',
          'تب «اثرسنجی» مجموع بازدید/تعامل، عملکرد هر رسانه و رسانه‌های بدون خروجی را نشان می‌دهد.',
        ]}
      />

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:posts-carousel-vertical-bold-duotone" width={48} />
            <Typography sx={{ mt: 1 }}>عملیاتی ثبت نشده است</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>عنوان / هدف</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>بازهٔ زمانی</TableCell>
                  <TableCell align="center">میکرورسانه</TableCell>
                  <TableCell align="center">تسک‌ها</TableCell>
                  <TableCell align="center">خروجی</TableCell>
                  <TableCell align="center">بازدید</TableCell>
                  <TableCell align="center">تعامل</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((o) => (
                  <TableRow
                    key={o.id}
                    hover
                    onClick={() => router.push(paths.dashboard.operations.detail(o.id))}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2">{o.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 240, display: 'block' }}>
                        {o.goal || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={STATUS[o.status]?.label ?? o.status} color={STATUS[o.status]?.color ?? 'default'} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{dateRange(o.starts_at, o.ends_at)}</Typography>
                    </TableCell>
                    <TableCell align="center">{fmtNum(o.mediaCount)}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {fmtNum(o.doneTaskCount)}/{fmtNum(o.taskCount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{fmtNum(o.outputCount)}</TableCell>
                    <TableCell align="center">{fmtNum(o.totalViews)}</TableCell>
                    <TableCell align="center">{fmtNum(o.totalEngagement)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(paths.dashboard.operations.detail(o.id));
                        }}
                      >
                        مشاهده
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>تعریف عملیات جدید</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField label="عنوان عملیات *" value={form.title} onChange={setField('title')} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="وضعیت" value={form.status} onChange={setField('status')} fullWidth>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="هدف" value={form.goal} onChange={setField('goal')} fullWidth multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="توضیحات" value={form.description} onChange={setField('description')} fullWidth multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="تاریخ شروع"
                type="date"
                value={form.starts_at}
                onChange={setField('starts_at')}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="تاریخ پایان"
                type="date"
                value={form.ends_at}
                onChange={setField('ends_at')}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={mediaOptions}
                value={selectedMedia}
                onChange={(_, v) => setSelectedMedia(v)}
                getOptionLabel={(o) => o?.name ?? ''}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                filterSelectedOptions
                renderInput={(p) => (
                  <TextField {...p} label="میکرورسانه‌های هدف" placeholder="جستجو و انتخاب..." />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || createOp.isPending}>
            ایجاد عملیات
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
