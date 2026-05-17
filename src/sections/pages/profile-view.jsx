'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance from 'src/lib/axios';
import { twitterApi } from 'src/api/twitter';
import { useProfileDeepDive } from 'src/api/analytics';
import { DashboardContent } from 'src/layouts/dashboard';
import { useUpdatePage, useRelatedPages } from 'src/api/pages';

import { Iconify } from 'src/components/iconify';

import { ActionCards } from './components/action-cards';
import { PersonaRadar } from './components/persona-radar';
import { ProfileHeader } from './components/profile-header';
import { NetworkCircle } from './components/network-circle';
import { DailyPostChart } from './components/daily-post-chart';
import { Insight360Panel } from './components/insight-360-panel';
import { ProfileStatCard } from './components/profile-stat-card';
import { CriticalRedlines } from './components/critical-redlines';
import { ContentHooksCard } from './components/content-hooks-card';
import { PageIdentityCard } from './components/page-identity-card';
import { PageSilenceRadar } from './components/page-silence-radar';
import { SentimentTimeline } from './components/sentiment-timeline';
import { NarrativeTimeline } from './components/narrative-timeline';
import {
  GENDERS,
  RELIGIONS,
  AGE_RANGES,
  TOPICAL_CLUSTERS,
  IDENTITY_CATEGORIES,
} from './constants';

// ----------------------------------------------------------------------

const TIME_RANGES = [
  { value: '24h', label: '۲۴ ساعت گذشته', hours: 24 },
  { value: '3d', label: '۳ روز گذشته', hours: 72 },
  { value: '1w', label: '۱ هفته گذشته', hours: 168 },
  { value: '2w', label: '۲ هفته گذشته', hours: 336 },
  { value: '1m', label: '۱ ماه گذشته', hours: 720 },
  { value: 'all', label: 'همه', hours: null },
];

export function PageProfileView({ id }) {
  const [timeRange, setTimeRange] = useState('1w');
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
      setTimeRange(data.page.last_processed_timeframe);
      setHasSetInitialTimeRange(true);
    }
  }, [data?.page?.last_processed_timeframe, hasSetInitialTimeRange]);

  if (isLoading) return <DashboardContent maxWidth="xl"><Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box></DashboardContent>;
  if (!data) return <DashboardContent maxWidth="xl"><Typography>پیج یافت نشد</Typography></DashboardContent>;

  const pg = data.page;

  const handleEditOpen = () => {
    setEditForm({
      name: pg.name || '',
      username: pg.username || '',
      platform: pg.platform || 'instagram',
      category: pg.category || '',
      identity_category: pg.identity_category || '',
      country: pg.country || '',
      nationality: pg.nationality || '',
      language: pg.language || '',
      content_language: pg.content_language || '',
      religion: pg.religion || '',
      gender: pg.gender || '',
      age_range: pg.age_range || '',
      bio: pg.bio || '',
    });
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
        const response = await axiosInstance.post(`/telegram/fetch-more/${id}`, { messageLimit: 100 });
        const payload = response.data?.data || response.data;
        setFetchResult({ success: true, message: payload.message, count: payload.messages_fetched });
      } else {
        setFetchResult({ success: false, message: 'این پلتفرم پشتیبانی نمی‌شود' });
        return;
      }
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

        {/* === ۵ شاخص اصلی === */}
        {[
          {
            title: 'اعتبار',
            value: data.credibility_score,
            icon: 'solar:shield-check-bold-duotone',
            color: data.credibility_score > 7 ? 'success' : data.credibility_score > 4 ? 'warning' : 'error',
            info: 'هویت، کیفیت مخاطب، اعتبار اجتماعی، ثبات محتوایی',
            field: 'credibility_score',
          },
          {
            title: 'نفوذ',
            value: data.influence_score,
            icon: 'solar:crown-bold-duotone',
            color: 'primary',
            info: 'تعامل واقعی، Reach، توان تحریک اقدام، نفوذ شبکه‌ای، عمق اثر',
            field: 'influence_score',
          },
          {
            title: 'پایداری',
            value: data.consistency_rate,
            icon: 'solar:clock-circle-bold-duotone',
            color: data.consistency_rate > 7 ? 'success' : 'warning',
            info: 'استمرار انتشار، ثبات تعامل، تنوع محتوایی، رشد ارگانیک، تاب‌آوری',
            field: 'consistency_rate',
          },
          {
            title: 'همراهی',
            value: pg?.affinity_score ?? 0,
            icon: 'solar:hearts-bold-duotone',
            color: (pg?.affinity_score ?? 0) > 7 ? 'success' : (pg?.affinity_score ?? 0) > 4 ? 'info' : 'warning',
            info: 'وفاداری مخاطب، احساس تعلق، کیفیت تعامل، نرخ مشارکت فعال، ارتباط انسانی',
            field: 'affinity_score',
          },
          {
            title: 'همسویی',
            value: pg?.alignment_score ?? 0,
            icon: 'solar:flag-bold-duotone',
            color:
              (pg?.alignment_score ?? 0) > 7
                ? 'success'
                : (pg?.alignment_score ?? 0) > 4
                  ? 'info'
                  : (pg?.alignment_score ?? 0) > 0
                    ? 'warning'
                    : 'error',
            info: 'مخالفت با آمریکا/اسرائیل/امارات/عربستان و حمایت از فلسطین/لبنان/جمهوری اسلامی/یمن/مقاومت عراق',
            field: 'alignment_score',
          },
        ].map((kpi) => (
          <Grid key={kpi.field} size={{ xs: 6, sm: 4, md: 'auto' }} sx={{ flex: { md: 1 } }}>
            <ProfileStatCard {...kpi} maxValue={10} onRefine={() => handleRefine(kpi.field)} />
          </Grid>
        ))}

        {/* === هویت و تعامل پیج === */}
        <Grid size={{ xs: 12 }}>
          <PageIdentityCard page={pg} />
        </Grid>

        {/* === مرکز عملیات === */}
        <Grid size={{ xs: 12 }}>
          <Card sx={(theme) => ({ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)` })}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:command-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>مرکز عملیات</Typography>
            </Stack>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Insight360Panel
                  page={pg}
                  painPoints={data.pain_points}
                  keywords={data.keywords}
                  fieldReports={pg?.field_reports}
                />
              </Grid>
              <Grid size={{ xs: 12 }}><ActionCards pageId={id} /></Grid>
            </Grid>
          </Card>
        </Grid>

        {/* === تحلیل شخصیت و شبکه === */}
        <Grid size={{ xs: 12, md: 6 }}><PersonaRadar data={data.persona_radar} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><NetworkCircle page={pg} relatedPages={relatedPages} /></Grid>

        {/* === رادار سکوت پیج === */}
        <Grid size={{ xs: 12 }}>
          <PageSilenceRadar pageId={id} />
        </Grid>

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
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>ویرایش پروفایل</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="نام" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="یوزرنیم" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="پلتفرم" value={editForm.platform || ''} onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}>
                <MenuItem value="instagram">اینستاگرام</MenuItem>
                <MenuItem value="twitter">توییتر</MenuItem>
                <MenuItem value="telegram">تلگرام</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="خوشه موضوعی" value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                <MenuItem value="">— بدون انتخاب —</MenuItem>
                {Object.entries(TOPICAL_CLUSTERS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="کیستی صفحه (دسته هویتی)" value={editForm.identity_category || ''} onChange={(e) => setEditForm({ ...editForm, identity_category: e.target.value })}>
                <MenuItem value="">— بدون انتخاب —</MenuItem>
                {Object.entries(IDENTITY_CATEGORIES).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="دین و مذهب" value={editForm.religion || ''} onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}>
                <MenuItem value="">— بدون انتخاب —</MenuItem>
                {Object.entries(RELIGIONS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="جنسیت" value={editForm.gender || ''} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                <MenuItem value="">— بدون انتخاب —</MenuItem>
                {Object.entries(GENDERS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="رده سنی" value={editForm.age_range || ''} onChange={(e) => setEditForm({ ...editForm, age_range: e.target.value })}>
                <MenuItem value="">— بدون انتخاب —</MenuItem>
                {Object.entries(AGE_RANGES).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="ملیت" value={editForm.nationality || ''} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="کشور" value={editForm.country || ''} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="زبان اصلی" value={editForm.language || ''} onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="زبان تولیدی (۸۰٪)" value={editForm.content_language || ''} onChange={(e) => setEditForm({ ...editForm, content_language: e.target.value })} placeholder="فارسی، عربی، چندزبانه..." />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="بیو" multiline rows={2} value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
            </Grid>
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
