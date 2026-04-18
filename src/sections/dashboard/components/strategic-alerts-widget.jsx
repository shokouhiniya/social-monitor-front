'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useStrategicAlerts, useCreateStrategicAlert, useUpdateAlertStatus } from 'src/api/strategic-alerts';
import { toJalali } from 'src/utils/format-jalali';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };

function timeAgo(date) {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'لحظاتی پیش';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  return `${Math.floor(diff / 86400)} روز پیش`;
}

export function StrategicAlertsWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', category: '' });

  const { data: alerts, isLoading } = useStrategicAlerts();
  const createMutation = useCreateStrategicAlert();
  const updateMutation = useUpdateAlertStatus();

  const items = alerts || [];

  const handleCreate = () => {
    createMutation.mutate({ ...form, created_by: 1 }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', message: '', priority: 'medium', category: '' }); },
    });
  };

  if (isLoading) return <Card sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Card>;

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:bell-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2">هشدارهای استراتژیک ({items.length})</Typography>
          </Stack>
          <Button size="small" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>جدید</Button>
        </Stack>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>هشدار فعالی وجود ندارد</Typography>
        ) : (
          <Stack spacing={1} sx={{ maxHeight: 340, overflow: 'auto' }}>
            {items.map((alert) => (
              <Box key={alert.id}
                sx={(theme) => ({
                  p: 1.5, borderRadius: 1,
                  bgcolor: alert.priority === 'critical' ? alpha(theme.palette.error.main, 0.06) : alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette[PRIORITY_COLORS[alert.priority] || 'primary']?.main || theme.palette.grey[300], 0.15)}`,
                })}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                      <Chip label={alert.priority} size="small" color={PRIORITY_COLORS[alert.priority] || 'default'} sx={{ height: 20, fontSize: 9 }} />
                      {alert.category && <Chip label={alert.category} size="small" variant="outlined" sx={{ height: 20, fontSize: 9 }} />}
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{alert.title}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block', mb: 0.5 }}>{alert.message?.slice(0, 100)}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{toJalali(alert.created_at)}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>• {timeAgo(alert.created_at)}</Typography>
                    </Stack>
                  </Box>
                  <Stack spacing={0.25}>
                    <Tooltip title="تایید و بستن" arrow>
                      <IconButton size="small" onClick={() => updateMutation.mutate({ id: alert.id, status: 'acknowledged' })}>
                        <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="آرشیو" arrow>
                      <IconButton size="small" onClick={() => updateMutation.mutate({ id: alert.id, status: 'archived' })}>
                        <Iconify icon="solar:archive-bold" width={16} sx={{ color: 'text.disabled' }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>ارسال هشدار استراتژیک</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label="عنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="پیام" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth size="small" label="اولویت" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">پایین</MenuItem><MenuItem value="medium">متوسط</MenuItem><MenuItem value="high">بالا</MenuItem><MenuItem value="critical">بحرانی</MenuItem>
              </TextField>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <MenuItem value="silence_gap">شکاف سکوت</MenuItem><MenuItem value="trend_shift">تغییر ترند</MenuItem><MenuItem value="crisis">بحران</MenuItem><MenuItem value="opportunity">فرصت</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.message || createMutation.isPending}>ارسال</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
