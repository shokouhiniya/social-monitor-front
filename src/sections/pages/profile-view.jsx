'use client';

import { useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useProfileDeepDive } from 'src/api/analytics';
import { useRelatedPages, useUpdatePage } from 'src/api/pages';

import { ProfileStatCard } from './components/profile-stat-card';
import { CriticalRedlines } from './components/critical-redlines';
import { PersonaRadar } from './components/persona-radar';
import { SentimentTimeline } from './components/sentiment-timeline';
import { ProfileHeader } from './components/profile-header';
import { InteractionCopilot } from './components/interaction-copilot';
import { ActionCards } from './components/action-cards';
import { InsightPanel } from './components/insight-panel';
import { NarrativeTimeline } from './components/narrative-timeline';
import { NetworkCircle } from './components/network-circle';
import { InteractionLedger } from './components/interaction-ledger';

// ----------------------------------------------------------------------

const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر',
};

export function PageProfileView({ id }) {
  const { data, isLoading } = useProfileDeepDive(id);
  const { data: relatedPages } = useRelatedPages(id);
  const updateMutation = useUpdatePage();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineField, setRefineField] = useState('');
  const [refineNote, setRefineNote] = useState('');

  if (isLoading) return <DashboardContent maxWidth="xl"><Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box></DashboardContent>;
  if (!data) return <DashboardContent maxWidth="xl"><Typography>پیج یافت نشد</Typography></DashboardContent>;

  const pg = data.page;

  const handleEditOpen = () => {
    setEditForm({ name: pg.name || '', username: pg.username || '', platform: pg.platform || 'instagram', category: pg.category || '', country: pg.country || '', language: pg.language || '', bio: pg.bio || '' });
    setEditOpen(true);
  };
  const handleEditSave = () => { updateMutation.mutate({ id, data: editForm }, { onSuccess: () => setEditOpen(false) }); };
  const handleRefine = (field) => { setRefineField(field); setRefineNote(''); setRefineOpen(true); };
  const handleRefineSubmit = () => { setRefineOpen(false); };

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* Redlines */}
        <Grid size={{ xs: 12 }}><CriticalRedlines page={pg} /></Grid>

        {/* Header */}
        <Grid size={{ xs: 12 }}><ProfileHeader page={pg} onEdit={handleEditOpen} /></Grid>

        {/* KPIs */}
        {[
          { title: 'اعتبار', value: data.credibility_score, prev: data.credibility_score * 0.9, icon: 'solar:shield-check-bold-duotone', color: data.credibility_score > 7 ? 'success' : data.credibility_score > 4 ? 'warning' : 'error', info: 'میزان جدی گرفته شدن', field: 'credibility_score' },
          { title: 'نفوذ', value: data.influence_score, prev: data.influence_score * 0.85, icon: 'solar:crown-bold-duotone', color: 'primary', info: 'ضریب تاثیرگذاری', field: 'influence_score' },
          { title: 'پایداری', value: data.consistency_rate, prev: data.consistency_rate * 0.95, icon: 'solar:clock-circle-bold-duotone', color: data.consistency_rate > 7 ? 'success' : 'warning', info: 'مداومت در انتشار', field: 'consistency_rate' },
          { title: 'فالوور', value: pg?.followers_count || 0, prev: (pg?.followers_count || 0) * 0.92, icon: 'solar:users-group-rounded-bold-duotone', color: 'secondary', info: 'دنبال‌کنندگان', field: 'followers_count', maxValue: (pg?.followers_count || 0) * 1.2 || 100 },
        ].map((kpi) => (
          <Grid key={kpi.field} size={{ xs: 6, md: 3 }}>
            <ProfileStatCard {...kpi} prevValue={kpi.prev} maxValue={kpi.maxValue} onRefine={() => handleRefine(kpi.field)} />
          </Grid>
        ))}

        {/* === مرکز عملیات === */}
        <Grid size={{ xs: 12 }}>
          <Card sx={(theme) => ({ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:command-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>مرکز عملیات</Typography>
            </Stack>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}><InteractionCopilot page={pg} contentHooks={data.content_hooks} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><ActionCards pageId={id} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InsightPanel painPoints={data.pain_points} keywords={data.keywords} fieldReports={pg?.field_reports} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InteractionLedger pageId={id} /></Grid>
            </Grid>
          </Card>
        </Grid>

        {/* === تحلیل شخصیت و شبکه === */}
        <Grid size={{ xs: 12, md: 6 }}><PersonaRadar data={data.persona_radar} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><NetworkCircle page={pg} relatedPages={relatedPages} /></Grid>

        {/* === تایم‌لاین === */}
        <Grid size={{ xs: 12 }}>
          <Card sx={(theme) => ({ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`, background: `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.02)} 0%, transparent 100%)` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:timeline-bold-duotone" width={22} sx={{ color: 'info.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>تایم‌لاین</Typography>
            </Stack>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}><SentimentTimeline data={data.sentiment_timeline} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><NarrativeTimeline posts={pg?.posts} fieldReports={pg?.field_reports} contentHooks={data.content_hooks} /></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>ویرایش پروفایل</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="نام" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="یوزرنیم" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="پلتفرم" value={editForm.platform} onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}>
                <MenuItem value="instagram">اینستاگرام</MenuItem><MenuItem value="twitter">توییتر</MenuItem><MenuItem value="telegram">تلگرام</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="کشور" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="زبان" value={editForm.language} onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth size="small" label="بیو" multiline rows={2} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={updateMutation.isPending}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      {/* Refine Dialog */}
      <Dialog open={refineOpen} onClose={() => setRefineOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>بهبود شاخص</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>توضیحات خود را بنویسید تا AI شاخص را اصلاح کند.</Typography>
          <TextField fullWidth multiline rows={3} label="یادداشت اصلاحی" value={refineNote} onChange={(e) => setRefineNote(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefineOpen(false)}>انصراف</Button>
          <Button variant="contained" color="warning" onClick={handleRefineSubmit} disabled={!refineNote} startIcon={<Iconify icon="solar:cpu-bolt-bold" />}>ارسال به AI</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
