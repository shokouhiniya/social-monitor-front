'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useScoreIndicators, useCreateIndicator, useUpdateIndicator, useDeleteIndicator } from 'src/api/media-score';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const EMPTY = { key: '', title: '', description: '', min_value: 0, max_value: 100, weight: 1 };

export function IndicatorsPageView() {
  const { data: indicators, isLoading } = useScoreIndicators(true);
  const createIndicator = useCreateIndicator();
  const updateIndicator = useUpdateIndicator();
  const deleteIndicator = useDeleteIndicator();

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      key: item.key || '',
      title: item.title || '',
      description: item.description || '',
      min_value: item.min_value ?? 0,
      max_value: item.max_value ?? 100,
      weight: item.weight ?? 1,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      key: form.key,
      title: form.title,
      description: form.description || undefined,
      min_value: Number(form.min_value),
      max_value: Number(form.max_value),
      weight: Number(form.weight),
    };
    if (editItem) {
      await updateIndicator.mutateAsync({ id: editItem.id, data: payload });
    } else {
      await createIndicator.mutateAsync(payload);
    }
    setOpen(false);
    setEditItem(null);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`شاخص «${item.title}» حذف شود؟`)) return;
    await deleteIndicator.mutateAsync(item.id);
  };

  const handleToggleActive = (item, checked) => {
    updateIndicator.mutate({ id: item.id, data: { is_active: checked } });
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">شاخص‌های امتیاز</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          شاخص جدید
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        شاخص‌های ارزیابی انسانی میکرورسانه‌ها. هر شاخص دارای بازه و وزن مخصوص است.
        امتیاز کلی = میانگین وزنی شاخص‌های فعال.
      </Typography>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (indicators ?? []).length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:star-shine-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography>شاخصی ثبت نشده — اولین شاخص را بسازید</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>عنوان</TableCell>
                  <TableCell>کلید</TableCell>
                  <TableCell>توضیح</TableCell>
                  <TableCell align="center">بازه</TableCell>
                  <TableCell align="center">وزن</TableCell>
                  <TableCell align="center">فعال</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(indicators ?? []).map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{i.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {i.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {i.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{i.min_value} – {i.max_value}</TableCell>
                    <TableCell align="center">{i.weight}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={i.is_active}
                        onChange={(e) => handleToggleActive(i, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="ویرایش">
                          <IconButton size="small" onClick={() => openEdit(i)}>
                            <Iconify icon="solar:pen-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton size="small" color="error" onClick={() => handleDelete(i)}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editItem ? 'ویرایش شاخص' : 'شاخص جدید'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="عنوان (فارسی)" value={form.title} onChange={setF('title')} fullWidth />
            <TextField
              label="کلید (انگلیسی، یکتا)"
              value={form.key}
              onChange={setF('key')}
              fullWidth
              placeholder="e.g. reach_quality"
              inputProps={{ dir: 'ltr', style: { fontFamily: 'monospace' } }}
              disabled={!!editItem}
              helperText={editItem ? 'کلید قابل تغییر نیست' : ''}
            />
            <TextField label="توضیح (اختیاری)" value={form.description} onChange={setF('description')} fullWidth multiline rows={2} />
            <Stack direction="row" spacing={2}>
              <TextField label="حداقل" type="number" value={form.min_value} onChange={setF('min_value')} fullWidth />
              <TextField label="حداکثر" type="number" value={form.max_value} onChange={setF('max_value')} fullWidth />
              <TextField label="وزن" type="number" value={form.weight} onChange={setF('weight')} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.key || !form.title || createIndicator.isPending || updateIndicator.isPending}
          >
            {editItem ? 'ذخیره' : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
