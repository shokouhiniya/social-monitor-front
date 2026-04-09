'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useStrategicAlerts, useCreateStrategicAlert, useAcknowledgeAlert } from 'src/api/strategic-alerts';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const CATEGORY_LABELS = {
  silence_gap: 'شکاف سکوت',
  trend_shift: 'تغییر ترند',
  crisis: 'بحران',
  opportunity: 'فرصت',
};

export function AlertsView() {
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

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">هشدارهای استراتژیک</Typography>
        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>
          هشدار جدید
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            هشدار فعالی وجود ندارد
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((alert) => (
            <Card
              key={alert.id}
              sx={{
                p: 3,
                borderRight: '4px solid',
                borderColor: `${PRIORITY_COLORS[alert.priority] || 'default'}.main`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={alert.priority} size="small" color={PRIORITY_COLORS[alert.priority] || 'default'} />
                    {alert.category && (
                      <Chip label={CATEGORY_LABELS[alert.category] || alert.category} size="small" variant="outlined" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(alert.created_at).toLocaleDateString('fa-IR')}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{alert.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{alert.message}</Typography>

                  {alert.target_pages?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        پیج‌های هدف: {alert.target_pages.length} پیج
                      </Typography>
                    </Box>
                  )}
                </Box>

                <IconButton onClick={() => acknowledgeMutation.mutate(alert.id)} title="تایید و بستن">
                  <Iconify icon="eva:checkmark-circle-2-fill" />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}

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
    </DashboardContent>
  );
}
