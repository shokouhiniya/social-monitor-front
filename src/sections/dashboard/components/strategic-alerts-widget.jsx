'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
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
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useStrategicAlerts, useCreateStrategicAlert, useAcknowledgeAlert } from 'src/api/strategic-alerts';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

export function StrategicAlertsWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', category: '' });

  const { data: alerts, isLoading } = useStrategicAlerts();
  const createMutation = useCreateStrategicAlert();
  const acknowledgeMutation = useAcknowledgeAlert();

  const items = alerts || [];

  const handleCreate = () => {
    createMutation.mutate(
      { ...form, created_by: 1 },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: '', message: '', priority: 'medium', category: '' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={20} />
      </Card>
    );
  }

  if (items.length === 0 && !open) {
    return (
      <Card sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          هشدار استراتژیک فعالی وجود ندارد
        </Typography>
        <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>
          هشدار جدید
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            هشدارهای استراتژیک ({items.length})
          </Typography>
          <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>
            جدید
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alert.priority === 'critical' ? 'error.lighter' : 'action.hover',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                  <Chip label={alert.priority} size="small" color={PRIORITY_COLORS[alert.priority] || 'default'} />
                  {alert.category && <Chip label={alert.category} size="small" variant="outlined" />}
                  <Typography variant="body2" fontWeight="bold">{alert.title}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{alert.message}</Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => acknowledgeMutation.mutate(alert.id)}
                title="تایید و بستن"
              >
                <Iconify icon="eva:checkmark-circle-2-fill" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ارسال هشدار استراتژیک</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="عنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            size="small"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="پیام"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              fullWidth
              label="اولویت"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              size="small"
            >
              <MenuItem value="low">پایین</MenuItem>
              <MenuItem value="medium">متوسط</MenuItem>
              <MenuItem value="high">بالا</MenuItem>
              <MenuItem value="critical">بحرانی</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="دسته‌بندی"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              size="small"
            >
              <MenuItem value="silence_gap">شکاف سکوت</MenuItem>
              <MenuItem value="trend_shift">تغییر ترند</MenuItem>
              <MenuItem value="crisis">بحران</MenuItem>
              <MenuItem value="opportunity">فرصت</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.message || createMutation.isPending}>
            ارسال
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
