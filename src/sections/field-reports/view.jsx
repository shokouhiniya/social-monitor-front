'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { StatCard } from '../dashboard/components/stat-card';
import { ChartCard } from '../dashboard/components/chart-card';
import { useFieldReports, useCreateFieldReport, useFieldReportStats } from 'src/api/field-reports';

// ----------------------------------------------------------------------

const SOURCE_CONFIG = {
  voice: { label: 'ویس', icon: 'solar:microphone-bold-duotone', color: 'warning' },
  file: { label: 'فایل', icon: 'solar:file-bold-duotone', color: 'info' },
  manual: { label: 'متن دستی', icon: 'solar:pen-bold-duotone', color: 'primary' },
};

const SENTIMENT_TAGS = [
  { value: 'angry', label: 'عصبی', color: 'error' },
  { value: 'cooperative', label: 'متمایل به همکاری', color: 'success' },
  { value: 'evasive', label: 'فراری', color: 'warning' },
  { value: 'neutral', label: 'خنثی', color: 'default' },
];

const RELIABILITY = [
  { value: 'confirmed', label: 'موثق' },
  { value: 'heard', label: 'در حد شنیده' },
  { value: 'analysis', label: 'تحلیل شخصی' },
];

export function FieldReportsView() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ page_id: '', content: '', source_type: 'manual', sentiment: '', reporter_id: 1 });

  const { data: reportsData, isLoading } = useFieldReports({ status: statusFilter || undefined });
  const { data: stats } = useFieldReportStats();
  const createMutation = useCreateFieldReport();

  const reports = reportsData?.data || [];

  const handleCreate = () => {
    createMutation.mutate(
      { ...form, page_id: form.page_id ? Number(form.page_id) : undefined },
      { onSuccess: () => { setOpen(false); setForm({ page_id: '', content: '', source_type: 'manual', sentiment: '', reporter_id: 1 }); } }
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>مرکز اطلاعات میدانی</Typography>
          <Typography variant="body2" color="text.secondary">ترکیب هوش انسانی با دیتای ماشین — لایه‌های پنهان شبکه</Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          ثبت گزارش
        </Button>
      </Stack>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="کل گزارش‌ها" value={stats?.total ?? 0} icon="solar:document-text-bold-duotone" color="primary" info="مجموع گزارش‌های ثبت‌شده" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="امروز" value={stats?.today ?? 0} icon="solar:calendar-bold-duotone" color="info" info="گزارش‌های ثبت‌شده امروز" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="در انتظار" value={stats?.pending ?? 0} icon="solar:clock-circle-bold-duotone" color="warning" info="گزارش‌هایی که هنوز پردازش نشده‌اند" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="ویس" value={stats?.by_source?.voice ?? 0} icon="solar:microphone-bold-duotone" color="secondary" info="گزارش‌های صوتی" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard title="پردازش‌شده" value={stats?.processed ?? 0} icon="solar:check-circle-bold-duotone" color="success" info="گزارش‌های تحلیل‌شده" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Feed */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Filter */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label="همه" variant={!statusFilter ? 'filled' : 'outlined'} color="primary" onClick={() => setStatusFilter('')} />
            <Chip label="در انتظار" variant={statusFilter === 'pending' ? 'filled' : 'outlined'} color="warning" onClick={() => setStatusFilter('pending')} icon={<Iconify icon="solar:clock-circle-bold" width={14} />} />
            <Chip label="پردازش‌شده" variant={statusFilter === 'processed' ? 'filled' : 'outlined'} color="success" onClick={() => setStatusFilter('processed')} icon={<Iconify icon="solar:check-circle-bold" width={14} />} />
          </Stack>

          {isLoading ? (
            <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
            <Stack spacing={2}>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
              {reports.length === 0 && (
                <Card sx={{ p: 5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">گزارشی یافت نشد</Typography>
                </Card>
              )}
            </Stack>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Knowledge Gap Radar */}
          <ChartCard title="پیج‌های کور" icon="solar:eye-closed-bold-duotone" info="پیج‌هایی با نفوذ بالا که هیچ گزارش میدانی ندارند — اولویت تحقیق" sx={{ mb: 3 }}>
            <Stack spacing={1}>
              {[
                { name: 'Al Jazeera English', influence: 9.5 },
                { name: 'Middle East Eye', influence: 8.8 },
                { name: 'Roger Waters', influence: 8.5 },
                { name: 'Quds News Network', influence: 8.3 },
              ].map((item) => (
                <Stack key={item.name} direction="row" alignItems="center" spacing={1.5}
                  sx={(theme) => ({ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` })}
                >
                  <Iconify icon="solar:eye-closed-bold" width={16} sx={{ color: 'error.main', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 10 }}>نفوذ: {item.influence}</Typography>
                  </Box>
                  <Chip label="نیاز به تحقیق" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: 9 }} />
                </Stack>
              ))}
            </Stack>
          </ChartCard>

          {/* Source Distribution */}
          <ChartCard title="توزیع منابع" icon="solar:chart-bold-duotone" info="تفکیک گزارش‌ها بر اساس نوع منبع">
            <Stack spacing={1}>
              {Object.entries(stats?.by_source || {}).map(([src, count]) => {
                const conf = SOURCE_CONFIG[src] || SOURCE_CONFIG.manual;
                const total = stats?.total || 1;
                const percent = Math.round((Number(count) / total) * 100);
                return (
                  <Box key={src}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon={conf.icon} width={14} sx={{ color: `${conf.color}.main` }} />
                        <Typography variant="caption">{conf.label}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{count} ({percent}%)</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={percent} color={conf.color} sx={{ height: 5, borderRadius: 1 }} />
                  </Box>
                );
              })}
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت گزارش میدانی</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label="شناسه یا نام پیج" value={form.page_id} onChange={(e) => setForm({ ...form, page_id: e.target.value })} placeholder="شماره ID پیج" />
            <TextField select fullWidth size="small" label="نوع منبع" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
              <MenuItem value="manual">متن دستی</MenuItem>
              <MenuItem value="voice">ویس</MenuItem>
              <MenuItem value="file">فایل</MenuItem>
            </TextField>
            <TextField select fullWidth size="small" label="درجه اعتبار" value={form.reliability || ''} onChange={(e) => setForm({ ...form, reliability: e.target.value })}>
              {RELIABILITY.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="وضعیت روحی صاحب پیج" value={form.sentiment} onChange={(e) => setForm({ ...form, sentiment: e.target.value })}>
              {SENTIMENT_TAGS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
            <TextField fullWidth multiline rows={4} label="متن گزارش" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.content || createMutation.isPending}>ثبت</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// --- Report Card ---

function ReportCard({ report }) {
  const srcConf = SOURCE_CONFIG[report.source_type] || SOURCE_CONFIG.manual;

  // AI Summary: first 100 chars
  const summary = report.content?.length > 100 ? `${report.content.slice(0, 100)}...` : report.content;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={(theme) => ({
        p: 2.5,
        borderRight: report.is_override ? `4px solid ${theme.palette.warning.main}` : 'none',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: theme.shadows[3] },
      })}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        {/* Source icon */}
        <Box
          sx={(theme) => ({
            width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(theme.palette[srcConf.color].main, 0.12),
          })}
        >
          <Iconify icon={srcConf.icon} width={22} sx={{ color: `${srcConf.color}.main` }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75, flexWrap: 'wrap' }} useFlexGap>
            <Chip label={srcConf.label} size="small" color={srcConf.color} variant="outlined" sx={{ height: 22, fontSize: 10 }} />
            <Chip label={report.status === 'processed' ? 'پردازش‌شده' : 'در انتظار'} size="small" color={report.status === 'processed' ? 'success' : 'warning'} sx={{ height: 22, fontSize: 10 }} />
            {report.sentiment && (
              <Chip label={SENTIMENT_TAGS.find((s) => s.value === report.sentiment)?.label || report.sentiment} size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
            )}
            {report.page && (
              <Chip label={report.page.name} size="small" color="info" variant="outlined" sx={{ height: 22, fontSize: 10 }} icon={<Iconify icon="solar:user-bold" width={12} />} />
            )}
            {report.is_override && (
              <Chip label="تحلیل انسانی" size="small" color="warning" sx={{ height: 22, fontSize: 10 }} />
            )}
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
              {new Date(report.created_at).toLocaleDateString('fa-IR')} — {new Date(report.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Stack>

          {/* Content */}
          <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 1 }}>
            {expanded ? report.content : summary}
          </Typography>
          {report.content?.length > 100 && (
            <Button size="small" onClick={() => setExpanded(!expanded)} sx={{ fontSize: 11, p: 0 }}>
              {expanded ? 'بستن' : 'ادامه متن'}
            </Button>
          )}

          {/* Keywords */}
          {report.extracted_keywords?.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
              {report.extracted_keywords.map((kw) => (
                <Chip key={kw} label={kw} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
              ))}
            </Stack>
          )}

          {/* Override note */}
          {report.is_override && report.override_note && (
            <Box sx={(theme) => ({ mt: 1, p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` })}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                تحلیل انسانی: {report.override_note}
              </Typography>
            </Box>
          )}

          {/* Quick Actions */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Tooltip title="تبدیل به هشدار استراتژیک" arrow>
              <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:bell-bold" width={14} />} sx={{ fontSize: 11 }}>
                تبدیل به هشدار
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
