'use client';

import React, { useState } from 'react';

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
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useProfileDeepDive } from 'src/api/analytics';
import { useRelatedPages, useUpdatePage } from 'src/api/pages';
import { twitterApi } from 'src/api/twitter';
import axios from 'axios';

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
import { ContentHooksCard } from './components/content-hooks-card';
import { DailyPostChart } from './components/daily-post-chart';

// ----------------------------------------------------------------------

const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر',
};

const TIME_RANGES = [
  { value: '24h', label: '۲۴ ساعت گذشته', hours: 24 },
  { value: '3d', label: '۳ روز گذشته', hours: 72 },
  { value: '1w', label: '۱ هفته گذشته', hours: 168 },
  { value: '2w', label: '۲ هفته گذشته', hours: 336 },
  { value: '1m', label: '۱ ماه گذشته', hours: 720 },
  { value: 'all', label: 'همه', hours: null },
];

export function PageProfileView({ id }) {
  const [timeRange, setTimeRange] = useState('1w'); // Start with default
  const { data, isLoading, refetch } = useProfileDeepDive(id, timeRange);
  const { data: relatedPages } = useRelatedPages(id);
  const updateMutation = useUpdatePage();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineField, setRefineField] = useState('');
  const [refineNote, setRefineNote] = useState('');
  const [fetchingMore, setFetchingMore] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  const [hasSetInitialTimeRange, setHasSetInitialTimeRange] = useState(false);

  // Set default timeRange from last processed timeframe (only once on initial load)
  React.useEffect(() => {
    if (!hasSetInitialTimeRange && data?.page?.last_processed_timeframe) {
      console.log('Setting initial timeRange to:', data.page.last_processed_timeframe);
      setTimeRange(data.page.last_processed_timeframe);
      setHasSetInitialTimeRange(true);
    }
  }, [data?.page?.last_processed_timeframe, hasSetInitialTimeRange]);

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

  const handleFetchMore = async () => {
    setFetchingMore(true);
    setFetchResult(null);
    try {
      let result;
      if (pg.platform === 'twitter') {
        result = await twitterApi.fetchMoreTweets(id, 100);
        setFetchResult({ success: true, message: result.message, count: result.tweets_fetched });
      } else if (pg.platform === 'telegram') {
        const response = await axios.post(`http://localhost:3000/telegram/fetch-more/${id}`, { messageLimit: 100 });
        setFetchResult({ success: true, message: response.data.message, count: response.data.messages_fetched });
      } else {
        setFetchResult({ success: false, message: 'این پلتفرم پشتیبانی نمی‌شود' });
        return;
      }
      // Refetch the profile data to show new posts
      refetch();
    } catch (error) {
      setFetchResult({ success: false, message: error.response?.data?.message || error.message });
    } finally {
      setFetchingMore(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* Redlines */}
        <Grid size={{ xs: 12 }}><CriticalRedlines page={pg} /></Grid>

        {/* Header */}
        <Grid size={{ xs: 12 }}><ProfileHeader page={pg} onEdit={handleEditOpen} timeRange={timeRange} /></Grid>

        {/* Time Range Selector */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon="solar:calendar-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>بازه زمانی تحلیل:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    size="small"
                    variant={timeRange === range.value ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange(range.value)}
                    sx={{ fontSize: 12 }}
                  >
                    {range.label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:timeline-bold-duotone" width={22} sx={{ color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>تایم‌لاین</Typography>
                <Typography variant="caption" color="text.secondary">({pg?.posts?.length || 0} پست)</Typography>
              </Stack>
              {(pg?.platform === 'twitter' || pg?.platform === 'telegram') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={fetchingMore ? <CircularProgress size={16} /> : <Iconify icon="solar:download-minimalistic-bold" />}
                  onClick={handleFetchMore}
                  disabled={fetchingMore}
                  sx={{ fontSize: 12 }}
                >
                  {fetchingMore ? 'در حال دریافت...' : 'دریافت پست‌های بیشتر'}
                </Button>
              )}
            </Stack>
            
            {fetchResult && (
              <Alert severity={fetchResult.success ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setFetchResult(null)}>
                {fetchResult.message}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Daily Post Distribution Chart */}
              <Grid size={{ xs: 12 }}>
                <DailyPostChart posts={pg?.posts || []} />
              </Grid>
              
              {/* Left: Sentiment + Content Hooks (stacked) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <SentimentTimeline data={data.sentiment_timeline} />
                  <ContentHooksCard data={data.content_hooks} />
                </Stack>
              </Grid>
              {/* Right: Narrative Timeline (full height) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <NarrativeTimeline posts={pg?.posts} fieldReports={pg?.field_reports} page={pg} />
              </Grid>
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
