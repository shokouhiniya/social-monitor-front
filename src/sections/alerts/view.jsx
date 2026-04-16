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
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { StatCard } from '../dashboard/components/stat-card';
import { useAlertStats, useGroupedAlerts, useCreateStrategicAlert, useUpdateAlertStatus } from 'src/api/strategic-alerts';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const PRIORITY_LABELS = { critical: 'بحرانی', high: 'بالا', medium: 'متوسط', low: 'پایین' };
const STATUS_LABELS = { active: 'فعال', investigating: 'در حال پیگیری', needs_response: 'نیاز به پاسخ', acknowledged: 'تایید شده', archived: 'بایگانی' };
const STATUS_COLORS = { active: 'error', investigating: 'warning', needs_response: 'info', acknowledged: 'success', archived: 'default' };
const CATEGORY_LABELS = { silence_gap: 'شکاف سکوت', trend_shift: 'تغییر ترند', crisis: 'بحران', opportunity: 'فرصت', other: 'سایر' };
const CATEGORY_ICONS = { silence_gap: 'solar:eye-bold-duotone', trend_shift: 'solar:graph-bold-duotone', crisis: 'solar:danger-triangle-bold-duotone', opportunity: 'solar:star-bold-duotone', other: 'solar:info-circle-bold-duotone' };

export function AlertsView() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', category: '', assigned_to: '', evidence_url: '' });

  const { data: stats, isLoading: statsLoading } = useAlertStats();
  const { data: grouped, isLoading: groupedLoading } = useGroupedAlerts();
  const createMutation = useCreateStrategicAlert();
  const updateStatusMutation = useUpdateAlertStatus();

  const groups = grouped || [];
  const filteredGroups = filter === 'all' ? groups : groups.filter((g) => g.group_key === filter);

  const handleCreate = () => {
    createMutation.mutate({ ...form, created_by: 1 }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', message: '', priority: 'medium', category: '', assigned_to: '', evidence_url: '' }); },
    });
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>اتاق فرمان عملیاتی</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت هشدارها، تخصیص مسئولیت و پیگیری اقدامات</Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          هشدار جدید
        </Button>
      </Stack>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="کل فعال" value={stats?.total ?? 0} icon="solar:bell-bold-duotone" color="primary" info="هشدارهای فعال" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="بحرانی" value={stats?.critical ?? 0} icon="solar:danger-triangle-bold-duotone" color="error" info="نیاز به اقدام فوری" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="در حال پیگیری" value={stats?.investigating ?? 0} icon="solar:magnifer-bold-duotone" color="warning" info="هشدارهای در دست بررسی" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="سرعت رشد" value={`${stats?.velocity ?? 0}/ساعت`} icon="solar:bolt-circle-bold-duotone" color="info" info="تعداد هشدارهای جدید در ساعت اخیر" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="میانگین شعاع اثر" value={`${stats?.avg_impact ?? 0}%`} icon="solar:target-bold-duotone" color="secondary" info="میانگین درصد شبکه تحت تاثیر" />
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
        <Chip label="همه" variant={filter === 'all' ? 'filled' : 'outlined'} color="primary" onClick={() => setFilter('all')} />
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Chip key={key} label={label} variant={filter === key ? 'filled' : 'outlined'} onClick={() => setFilter(key)}
            icon={<Iconify icon={CATEGORY_ICONS[key]} width={16} />}
          />
        ))}
      </Stack>

      {/* Grouped Alert Feed */}
      {groupedLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : filteredGroups.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon="solar:check-circle-bold-duotone" width={48} sx={{ color: 'success.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">هشدار فعالی وجود ندارد</Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredGroups.map((group) => (
            <Accordion
              key={group.group_key}
              defaultExpanded={group.max_priority === 'critical'}
              sx={(theme) => ({
                border: `1px solid ${alpha(theme.palette[PRIORITY_COLORS[group.max_priority] || 'primary'].main, 0.2)}`,
                '&::before': { display: 'none' },
                borderRadius: '12px !important',
                overflow: 'hidden',
              })}
            >
              <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                  <Box
                    sx={(theme) => ({
                      width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(theme.palette[PRIORITY_COLORS[group.max_priority] || 'primary'].main, 0.12),
                    })}
                  >
                    <Iconify icon={CATEGORY_ICONS[group.group_key] || 'solar:info-circle-bold-duotone'} width={22}
                      sx={{ color: `${PRIORITY_COLORS[group.max_priority] || 'primary'}.main` }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {CATEGORY_LABELS[group.group_key] || group.group_key}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.count} هشدار • شعاع اثر: {group.total_impact}%
                    </Typography>
                  </Box>
                  <Chip label={PRIORITY_LABELS[group.max_priority]} size="small" color={PRIORITY_COLORS[group.max_priority] || 'default'} />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1.5}>
                  {group.alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onStatusChange={updateStatusMutation} />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت هشدار جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label="عنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField fullWidth multiline rows={3} label="پیام" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth size="small" label="اولویت" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">پایین</MenuItem><MenuItem value="medium">متوسط</MenuItem><MenuItem value="high">بالا</MenuItem><MenuItem value="critical">بحرانی</MenuItem>
              </TextField>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth size="small" label="مسئول پیگیری" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
              <TextField fullWidth size="small" label="لینک شواهد" value={form.evidence_url} onChange={(e) => setForm({ ...form, evidence_url: e.target.value })} placeholder="https://..." />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || !form.message || createMutation.isPending}>ثبت</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function AlertCard({ alert, onStatusChange }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showPlaybook, setShowPlaybook] = useState(false);

  const pColor = PRIORITY_COLORS[alert.priority] || 'default';

  return (
    <Card
      sx={(theme) => ({
        p: 2.5,
        borderRight: `4px solid ${theme.palette[pColor]?.main || theme.palette.grey[400]}`,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: theme.shadows[3] },
      })}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap' }} useFlexGap>
            <Chip label={PRIORITY_LABELS[alert.priority]} size="small" color={pColor} />
            <Chip label={STATUS_LABELS[alert.status] || alert.status} size="small" color={STATUS_COLORS[alert.status] || 'default'} variant="outlined" />
            {alert.assigned_to && (
              <Chip label={`مسئول: ${alert.assigned_to}`} size="small" variant="outlined" icon={<Iconify icon="solar:user-bold" width={14} />} />
            )}
            <Typography variant="caption" color="text.disabled">
              {new Date(alert.created_at).toLocaleDateString('fa-IR')} — {new Date(alert.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{alert.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1 }}>{alert.message}</Typography>

          {/* Impact Radius */}
          {alert.impact_radius > 0 && (
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography variant="caption" color="text.secondary">شعاع اثر</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: alert.impact_radius > 30 ? 'error.main' : 'text.primary' }}>
                  {alert.impact_radius.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(alert.impact_radius, 100)}
                color={alert.impact_radius > 30 ? 'error' : alert.impact_radius > 15 ? 'warning' : 'info'}
                sx={{ height: 5, borderRadius: 1 }}
              />
            </Box>
          )}

          {/* Evidence */}
          {alert.evidence_url && (
            <Chip label="مشاهده شواهد" size="small" variant="outlined" color="info" component="a" href={alert.evidence_url} target="_blank"
              icon={<Iconify icon="solar:link-bold" width={14} />} sx={{ mb: 1, cursor: 'pointer' }}
            />
          )}

          {/* Playbook */}
          {alert.playbook?.length > 0 && (
            <Box>
              <Button size="small" startIcon={<Iconify icon="solar:clipboard-check-bold" />} onClick={() => setShowPlaybook(!showPlaybook)}
                sx={{ fontSize: 12, mb: showPlaybook ? 1 : 0 }}
              >
                {showPlaybook ? 'بستن سناریو' : 'مشاهده سناریو'}
              </Button>
              {showPlaybook && (
                <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` })}>
                  {alert.playbook.map((action, idx) => (
                    <Stack key={idx} direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main', minWidth: 16 }}>{idx + 1}.</Typography>
                      <Typography variant="caption">{action}</Typography>
                    </Stack>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {alert.target_pages?.length > 0 && (
            <Chip label={`${alert.target_pages.length} پیج هدف`} size="small" variant="outlined" color="info" sx={{ mt: 1 }}
              icon={<Iconify icon="solar:users-group-rounded-bold" width={14} />}
            />
          )}
        </Box>

        {/* Status Actions */}
        <Box>
          <Tooltip title="تغییر وضعیت" arrow>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <Iconify icon="solar:menu-dots-bold" width={20} />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {['investigating', 'needs_response', 'acknowledged', 'archived'].map((s) => (
              <MenuItem key={s} onClick={() => { onStatusChange.mutate({ id: alert.id, status: s }); setMenuAnchor(null); }}
                sx={{ fontSize: 13 }}
              >
                <Iconify icon={s === 'acknowledged' ? 'solar:check-circle-bold' : s === 'archived' ? 'solar:archive-bold' : 'solar:clock-circle-bold'} width={16} sx={{ mr: 1 }} />
                {STATUS_LABELS[s]}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Stack>
    </Card>
  );
}
