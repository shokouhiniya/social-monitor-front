'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useMicroMediaList } from 'src/api/micro-media';
import { useClusters } from 'src/api/clusters';
import { useGenerateAlerts } from 'src/api/analytics';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCreateActionPlanFromAlert } from 'src/api/action-plans';
import { useAlertStats, useGroupedAlerts, useUpdateAlertStatus, useCreateStrategicAlert } from 'src/api/strategic-alerts';

import { Iconify } from 'src/components/iconify';
import { ActionStateView } from 'src/components/action-state';

import { StatCard } from '../dashboard/components/stat-card';
import { PageInfoBox } from '../dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const PRIORITY_LABELS = { critical: 'بحرانی', high: 'بالا', medium: 'متوسط', low: 'پایین' };
const STATUS_LABELS = { active: 'فعال', investigating: 'در حال پیگیری', needs_response: 'نیاز به پاسخ', acknowledged: 'تایید شده', archived: 'بایگانی' };
const STATUS_COLORS = { active: 'error', investigating: 'warning', needs_response: 'info', acknowledged: 'success', archived: 'default' };
const CATEGORY_LABELS = { silence_gap: 'شکاف سکوت', trend_shift: 'تغییر ترند', crisis: 'بحران', opportunity: 'فرصت', other: 'سایر' };
const CATEGORY_ICONS = { silence_gap: 'solar:eye-bold-duotone', trend_shift: 'solar:graph-bold-duotone', crisis: 'solar:danger-triangle-bold-duotone', opportunity: 'solar:star-bold-duotone', other: 'solar:info-circle-bold-duotone' };

const PAGE_INFO = {
  title: 'مرکز عملیات',
  icon: 'solar:command-bold-duotone',
  color: 'error',
  shortDescription: 'مدیریت یکپارچه هشدارهای استراتژیک و عملیات‌ها — تعریف عملیات برای میکرورسانه/خوشه، تعیین مسئول، ثبت اطلاعات ارتباطی و توصیه میکرورسانه‌های همراه',
  modules: [
    { name: 'هشدارهای استراتژیک', icon: 'solar:bell-bold-duotone', color: 'error', description: 'لیست هشدارها (تولیدی AI یا دستی) — هر هشدار با اولویت، دسته‌بندی، Playbook و امکان تبدیل به عملیات.' },
    { name: 'تعریف عملیات (Action Plan)', icon: 'solar:clipboard-add-bold-duotone', color: 'primary', description: 'هر هشدار را می‌توانید به یک یا چند عملیات تبدیل کنید — برای یک میکرورسانه خاص، چند میکرورسانه، یا کل یک خوشه.' },
    { name: 'مسئولیت', icon: 'solar:user-id-bold-duotone', color: 'info', description: 'برای هر عملیات می‌توانید یک مسئول مشخص کنید (نام، دپارتمان، یا شناسه کاربر) و وضعیت پیشرفت را پیگیری کنید.' },
    { name: 'اطلاعات ارتباطی', icon: 'solar:phone-bold-duotone', color: 'success', description: 'اطلاعات تماس ادمین (تلفن، ایمیل، تلگرام، یادداشت) ذخیره می‌شود تا تیم ارتباط بگیرد.' },
    { name: 'توصیه میکرورسانه‌های همراه', icon: 'solar:users-group-rounded-bold-duotone', color: 'warning', description: 'برای هر عملیات، می‌توانید لیستی از میکرورسانه‌های پیشنهادی برای همراه‌سازی یا بازنشر معرفی کنید.' },
    { name: 'ثبت تعامل (Interaction)', icon: 'solar:chat-round-dots-bold-duotone', color: 'secondary', description: 'هر تماس واقعی (کامنت، پیام، DM، تماس تلفنی) را در عملیات ثبت کنید — تا تاریخچه ارتباطات شفاف باشد.' },
  ],
  tips: [
    'هشدارهای «بحرانی» با حاشیه قرمز از سایرین متمایز می‌شوند',
    'عملیات‌ها در پروفایل هر میکرورسانه هم نمایش داده می‌شوند',
    'برای دیدن عملیات‌های یک خوشه، به صفحه آن خوشه بروید',
    'با تب «عملیات‌ها» می‌توانید همه‌ی عملیات‌های فعال شبکه را در یک نگاه ببینید',
  ],
};

export function AlertsView() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium', category: '', assigned_to: '', evidence_url: '' });

  const { data: stats, isLoading: statsLoading } = useAlertStats();
  const { data: grouped, isLoading: groupedLoading, error: groupedError, refetch: refetchGrouped } = useGroupedAlerts(showArchived ? 'archived' : undefined);
  const createMutation = useCreateStrategicAlert();
  const updateStatusMutation = useUpdateAlertStatus();
  const generateMutation = useGenerateAlerts();

  const groups = grouped || [];
  const filteredGroups = filter === 'all' ? groups : groups.filter((g) => g.group_key === filter);

  const handleCreate = () => {
    createMutation.mutate({ ...form, created_by: 1 }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', message: '', priority: 'medium', category: '', assigned_to: '', evidence_url: '' }); },
    });
  };

  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox {...PAGE_INFO} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>مرکز عملیات</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت هشدارها، تعریف عملیات و پیگیری اقدامات روی پیج‌ها و خوشه‌ها</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={showArchived ? 'contained' : 'outlined'}
            color={showArchived ? 'default' : 'inherit'}
            startIcon={<Iconify icon="solar:archive-bold-duotone" />}
            onClick={() => setShowArchived(!showArchived)}
            sx={showArchived ? {} : { borderColor: 'divider', color: 'text.secondary' }}
          >
            {showArchived ? 'بازگشت به فعال‌ها' : 'آرشیو'}
          </Button>
          <Button variant="outlined" color="warning"
            startIcon={generateMutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'در حال تولید...' : 'تولید هشدار با AI'}
          </Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
            هشدار جدید
          </Button>
        </Stack>
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
      ) : groupedError ? (
        <ActionStateView loading={false} error={groupedError} onRetry={refetchGrouped}>{null}</ActionStateView>
      ) : filteredGroups.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon={showArchived ? 'solar:archive-bold-duotone' : 'solar:check-circle-bold-duotone'} width={48} sx={{ color: showArchived ? 'text.disabled' : 'success.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">{showArchived ? 'هشدار آرشیو شده‌ای وجود ندارد' : 'هشدار فعالی وجود ندارد'}</Typography>
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
  const [operationOpen, setOperationOpen] = useState(false);

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
            <Chip label={`${alert.target_pages.length} میکرورسانه هدف`} size="small" variant="outlined" color="info" sx={{ mt: 1 }}
              icon={<Iconify icon="solar:users-group-rounded-bold" width={14} />}
            />
          )}

          {/* Create Operation Button */}
          <Box sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="solar:clipboard-add-bold" width={16} />}
              onClick={() => setOperationOpen(true)}
              sx={{ fontSize: 12 }}
            >
              تعریف عملیات از این هشدار
            </Button>
          </Box>
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

      {/* Create Operation Dialog */}
      <CreateOperationFromAlertDialog
        open={operationOpen}
        onClose={() => setOperationOpen(false)}
        alert={alert}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function CreateOperationFromAlertDialog({ open, onClose, alert }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 2, category: '', assigned_to: '' });
  const [target, setTarget] = useState('pages'); // 'pages' or 'cluster'
  const [selectedPages, setSelectedPages] = useState(alert.target_pages || []);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [recommendedPages, setRecommendedPages] = useState([]);
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', telegram: '', notes: '' });
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: mmData } = useMicroMediaList({ limit: 100 });
  const { data: clustersData } = useClusters();
  const createFromAlert = useCreateActionPlanFromAlert();

  const pages = mmData?.items ?? [];

  // Filter pages by search and filters
  const filteredPages = pages.filter((page) => {
    const matchesSearch = !search ||
      page.name?.toLowerCase().includes(search.toLowerCase()) ||
      page.identity_title?.toLowerCase().includes(search.toLowerCase()) ||
      page.activity_domain?.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'all';  // micro-media ندارند platform مستقیم
    const matchesCategory = categoryFilter === 'all' || page.identity_title === categoryFilter;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  // Get unique platforms and categories from pages
  const platforms = [...new Set(pages.map((p) => p.platform).filter(Boolean))];
  const categories = [...new Set(pages.map((p) => p.category).filter(Boolean))];

  const handleTogglePage = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const handleToggleRecommended = (pageId) => {
    setRecommendedPages((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredPages.map((p) => p.id);
    const allSelected = filteredIds.every((id) => selectedPages.includes(id));
    if (allSelected) {
      setSelectedPages((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedPages((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const isContactInfoFilled = contactInfo.phone || contactInfo.email || contactInfo.telegram || contactInfo.notes;

  const handleCreate = () => {
    const payload = {
      alert_id: alert.id,
      title: form.title || alert.title,
      description: form.description || alert.message,
      priority: form.priority,
      category: form.category,
      assigned_to: form.assigned_to || undefined,
    };

    if (target === 'cluster' && selectedCluster) {
      payload.cluster_id = Number(selectedCluster);
    }
    if (target === 'pages') {
      payload.page_ids = selectedPages;
    }

    // Build the per-plan extras (will go through createFromAlert; the backend already
    // creates one plan per page, but we inject contact_info and recommended_pages
    // as a single update later if cluster). For now, attach them to first plan only.
    if (recommendedPages.length > 0) {
      payload.recommended_pages = recommendedPages;
    }
    if (isContactInfoFilled) {
      payload.contact_info = contactInfo;
    }

    createFromAlert.mutate(payload, {
      onSuccess: () => {
        onClose();
        setForm({ title: '', description: '', priority: 2, category: '', assigned_to: '' });
        setSelectedPages([]);
        setRecommendedPages([]);
        setContactInfo({ phone: '', email: '', telegram: '', notes: '' });
      },
    });
  };

  const PLATFORM_LABELS = { instagram: 'اینستاگرام', telegram: 'تلگرام', twitter: 'توییتر' };
  const PLATFORM_ICONS = { instagram: 'skill-icons:instagram', telegram: 'logos:telegram', twitter: 'pajamas:twitter' };

  const isValid = target === 'cluster' ? !!selectedCluster : selectedPages.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:clipboard-add-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          <span>تعریف عملیات از هشدار</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Alert info */}
          <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` })}>
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>هشدار مبدا:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{alert.title}</Typography>
          </Box>

          {/* Target selector */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>هدف عملیات</Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="یک یا چند میکرورسانه"
                size="medium"
                variant={target === 'pages' ? 'filled' : 'outlined'}
                color={target === 'pages' ? 'primary' : 'default'}
                icon={<Iconify icon="solar:user-id-bold" width={16} />}
                onClick={() => setTarget('pages')}
              />
              <Chip
                label="یک خوشه"
                size="medium"
                variant={target === 'cluster' ? 'filled' : 'outlined'}
                color={target === 'cluster' ? 'secondary' : 'default'}
                icon={<Iconify icon="solar:atom-bold" width={16} />}
                onClick={() => setTarget('cluster')}
              />
            </Stack>
          </Box>

          {target === 'cluster' && (
            <TextField
              select
              fullWidth
              size="small"
              label="انتخاب خوشه هدف"
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
            >
              <MenuItem value="">— انتخاب —</MenuItem>
              {(clustersData || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name} ({c.pages_count || 0} میکرورسانه)</MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            size="small"
            label="عنوان عملیات"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={alert.title}
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="توضیحات"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={alert.message}
          />
          <Stack direction="row" spacing={2}>
            <TextField select fullWidth size="small" label="اولویت" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}>
              <MenuItem value={0}>پایین</MenuItem>
              <MenuItem value={1}>متوسط</MenuItem>
              <MenuItem value={2}>بالا</MenuItem>
              <MenuItem value={3}>فوری</MenuItem>
            </TextField>
            <TextField select fullWidth size="small" label="دسته‌بندی" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <MenuItem value="">— بدون انتخاب —</MenuItem>
              <MenuItem value="reply_comments">پاسخ به کامنت‌ها</MenuItem>
              <MenuItem value="change_bio">تغییر بیو</MenuItem>
              <MenuItem value="publish_post">انتشار پست</MenuItem>
              <MenuItem value="publish_story">انتشار استوری</MenuItem>
              <MenuItem value="engage_audience">تعامل با مخاطب</MenuItem>
              <MenuItem value="content_strategy">استراتژی محتوا</MenuItem>
              <MenuItem value="other">سایر</MenuItem>
            </TextField>
          </Stack>

          <TextField
            fullWidth
            size="small"
            label="مسئول عملیات (اختیاری)"
            value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
            placeholder="نام، دپارتمان یا شناسه کاربر"
            InputProps={{ startAdornment: <Iconify icon="solar:user-id-bold" width={16} sx={{ color: 'text.disabled', mr: 1 }} /> }}
          />

          {/* Contact Info (collapsible info) */}
          <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Iconify icon="solar:phone-bold-duotone" width={18} sx={{ color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>اطلاعات ارتباطی (اختیاری)</Typography>
            </Stack>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25}>
                <TextField
                  fullWidth size="small" label="شماره تلفن"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
                <TextField
                  fullWidth size="small" label="ایمیل"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
              </Stack>
              <TextField
                fullWidth size="small" label="آیدی تلگرام"
                value={contactInfo.telegram}
                onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                placeholder="@username"
              />
              <TextField
                fullWidth size="small" multiline rows={2} label="یادداشت ارتباطی"
                value={contactInfo.notes}
                onChange={(e) => setContactInfo({ ...contactInfo, notes: e.target.value })}
                placeholder="مثلاً: بهترین زمان تماس، نام واسطه، …"
              />
            </Stack>
          </Box>

          {/* Recommended pages for engagement */}
          <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={18} sx={{ color: 'warning.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main' }}>میکرورسانه‌های پیشنهادی همراه</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              میکرورسانه‌هایی که برای همراه‌سازی، بازنشر یا تعامل در این عملیات پیشنهاد می‌شوند
            </Typography>
            <Box sx={{ maxHeight: 120, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.75, bgcolor: 'background.paper' }}>
              {pages.slice(0, 30).map((page) => (
                <FormControlLabel
                  key={page.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={recommendedPages.includes(page.id)}
                      onChange={() => handleToggleRecommended(page.id)}
                    />
                  }
                  label={<Typography variant="caption">{page.name} {page.activity_domain && `— ${page.activity_domain}`}</Typography>}
                  sx={{ display: 'flex', m: 0, py: 0.25 }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              {recommendedPages.length} میکرورسانه پیشنهادی
            </Typography>
          </Box>

          {/* Page Selection (only when target=pages) */}
          {target === 'pages' && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2">انتخاب میکرورسانه‌های هدف</Typography>
              <Button size="small" onClick={handleSelectAllFiltered} sx={{ fontSize: 11 }}>
                {filteredPages.length > 0 && filteredPages.every((p) => selectedPages.includes(p.id)) ? 'لغو انتخاب' : 'انتخاب همه'}
              </Button>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="جستجوی نام میکرورسانه..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} sx={{ color: 'text.disabled', mr: 1 }} />,
              }}
              sx={{ mb: 1.5 }}
            />

            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
              <Chip
                label="همه پلتفرم‌ها"
                size="small"
                variant={platformFilter === 'all' ? 'filled' : 'outlined'}
                color={platformFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setPlatformFilter('all')}
              />
              {platforms.map((p) => (
                <Chip
                  key={p}
                  label={PLATFORM_LABELS[p] || p}
                  size="small"
                  variant={platformFilter === p ? 'filled' : 'outlined'}
                  color={platformFilter === p ? 'primary' : 'default'}
                  icon={PLATFORM_ICONS[p] ? <Iconify icon={PLATFORM_ICONS[p]} width={14} /> : undefined}
                  onClick={() => setPlatformFilter(p)}
                />
              ))}

              {categories.length > 0 && (
                <>
                  <Box sx={{ width: '100%', height: 0 }} />
                  <Chip
                    label="همه دسته‌ها"
                    size="small"
                    variant={categoryFilter === 'all' ? 'filled' : 'outlined'}
                    color={categoryFilter === 'all' ? 'secondary' : 'default'}
                    onClick={() => setCategoryFilter('all')}
                  />
                  {categories.slice(0, 8).map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      variant={categoryFilter === c ? 'filled' : 'outlined'}
                      color={categoryFilter === c ? 'secondary' : 'default'}
                      onClick={() => setCategoryFilter(c)}
                    />
                  ))}
                </>
              )}
            </Stack>

            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {filteredPages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  میکرورسانه‌ای یافت نشد
                </Typography>
              ) : (
                filteredPages.map((page) => (
                  <FormControlLabel
                    key={page.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedPages.includes(page.id)}
                        onChange={() => handleTogglePage(page.id)}
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography variant="body2">{page.name}</Typography>
                        {page.identity_title && <Typography variant="caption" color="text.disabled">{page.identity_title}</Typography>}
                        {page.activity_domain && (
                          <Chip label={page.activity_domain} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                        )}
                      </Stack>
                    }
                    sx={{ display: 'flex', m: 0, py: 0.5, '&:hover': { bgcolor: 'action.hover', borderRadius: 0.5 } }}
                  />
                ))
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {selectedPages.length} میکرورسانه انتخاب شده — برای هر کدام یک عملیات جداگانه ایجاد می‌شود
            </Typography>
          </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!isValid || createFromAlert.isPending}
          startIcon={createFromAlert.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:clipboard-check-bold" />}
        >
          {target === 'cluster' ? 'ایجاد عملیات خوشه' : `ایجاد عملیات (${selectedPages.length} میکرورسانه)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

