'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
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
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { StatCard } from '../dashboard/components/stat-card';
import { useStrategicAlerts, useCreateStrategicAlert, useAcknowledgeAlert } from 'src/api/strategic-alerts';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const PRIORITY_LABELS = { critical: 'بحرانی', high: 'بالا', medium: 'متوسط', low: 'پایین' };
const CATEGORY_LABELS = { silence_gap: 'شکاف سکوت', trend_shift: 'تغییر ترند', crisis: 'بحران', opportunity: 'فرصت' };
const CATEGORY_ICONS = { silence_gap: 'solar:eye-bold-duotone', trend_shift: 'solar:graph-bold-duotone', crisis: 'solar:danger-triangle-bold-duotone', opportunity: 'solar:star-bold-duotone' };

export function AlertsView() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', category: '' });

  const { data: alerts, isLoading } = useStrategicAlerts();
  const createMutation = useCreateStrategicAlert();
  const acknowledgeMutation = useAcknowledgeAlert();

  const items = alerts || [];
  const criticalCount = items.filter((a) => a.priority === 'critical').length;
  const highCount = items.filter((a) => a.priority === 'high').length;
  const crisisCount = items.filter((a) => a.category === 'crisis').length;
  const opportunityCount = items.filter((a) => a.category === 'opportunity').length;

  const handleCreate = () => {
    createMutation.mutate({ ...form, created_by: 1 }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', message: '', priority: 'medium', category: '' }); },
    });
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>هشدارهای استراتژیک</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت و پیگیری هشدارهای فعال شبکه</Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          هشدار جدید
        </Button>
      </Stack>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="کل هشدارهای فعال" value={items.length} icon="solar:bell-bold-duotone" color="primary" info="تعداد هشدارهای فعال که هنوز تایید نشده‌اند" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="بحرانی" value={criticalCount} icon="solar:danger-triangle-bold-duotone" color="error" info="هشدارهایی که نیاز به اقدام فوری دارند" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="بحران‌ها" value={crisisCount} icon="solar:shield-warning-bold-duotone" color="warning" info="هشدارهای مربوط به بحران‌های فعال" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="فرصت‌ها" value={opportunityCount} icon="solar:star-bold-duotone" color="success" info="فرصت‌های شناسایی‌شده برای اقدام" />
        </Grid>
      </Grid>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : items.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon="solar:check-circle-bold-duotone" width={48} sx={{ color: 'success.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">هشدار فعالی وجود ندارد — وضعیت شبکه پایدار است</Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {items.map((alert) => {
            const pColor = PRIORITY_COLORS[alert.priority] || 'default';
            const catIcon = CATEGORY_ICONS[alert.category] || 'solar:info-circle-bold-duotone';
            return (
              <Card
                key={alert.id}
                sx={(theme) => ({
                  p: 3,
                  borderRight: `4px solid ${theme.palette[pColor]?.main || theme.palette.grey[400]}`,
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: theme.shadows[4] },
                })}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                    <Box
                      sx={(theme) => ({
                        width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(theme.palette[pColor]?.main || theme.palette.grey[400], 0.12),
                      })}
                    >
                      <Iconify icon={catIcon} width={24} sx={{ color: `${pColor}.main` }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip label={PRIORITY_LABELS[alert.priority] || alert.priority} size="small" color={pColor} />
                        {alert.category && <Chip label={CATEGORY_LABELS[alert.category] || alert.category} size="small" variant="outlined" />}
                        <Typography variant="caption" color="text.disabled">
                          {new Date(alert.created_at).toLocaleDateString('fa-IR')} — {new Date(alert.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{alert.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{alert.message}</Typography>
                      {alert.target_pages?.length > 0 && (
                        <Chip label={`${alert.target_pages.length} پیج هدف`} size="small" variant="outlined" color="info" sx={{ mt: 1 }} icon={<Iconify icon="solar:users-group-rounded-bold" width={14} />} />
                      )}
                    </Box>
                  </Stack>
                  <IconButton onClick={() => acknowledgeMutation.mutate(alert.id)} title="تایید و بستن" color="success">
                    <Iconify icon="solar:check-circle-bold-duotone" width={28} />
                  </IconButton>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ارسال هشدار استراتژیک</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="عنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} sx={{ mt: 2, mb: 2 }} size="small" />
          <TextField fullWidth multiline rows={3} label="پیام" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2}>
            <TextField select fullWidth label="اولویت" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} size="small">
              <MenuItem value="low">پایین</MenuItem><MenuItem value="medium">متوسط</MenuItem><MenuItem value="high">بالا</MenuItem><MenuItem value="critical">بحرانی</MenuItem>
            </TextField>
            <TextField select fullWidth label="دسته‌بندی" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} size="small">
              <MenuItem value="silence_gap">شکاف سکوت</MenuItem><MenuItem value="trend_shift">تغییر ترند</MenuItem><MenuItem value="crisis">بحران</MenuItem><MenuItem value="opportunity">فرصت</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.message || createMutation.isPending}>ارسال</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
