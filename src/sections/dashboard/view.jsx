'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { PulseStrip } from './components/pulse-strip';
import { StatCard } from './components/stat-card';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';
import { IdentityRadialChart } from './components/identity-radial-chart';
import { GeoBarChart } from './components/geo-bar-chart';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { SilenceRadar } from './components/silence-radar';
import { PeriodicReport } from './components/periodic-report';
import { LatestPosts } from './components/latest-posts';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const totalKeywords = macro?.trending_keywords?.length || 0;
  const totalClusters = macro?.cluster_distribution?.length || 0;
  const topInfluencer = macro?.top_influencers?.[0];

  return (
    <DashboardContent maxWidth="xl">
      <PulseStrip />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>مرکز هوش رسانه‌ای</Typography>
        <Typography variant="body2" color="text.secondary">خلاصه وضعیت شبکه، هشدارها و گزارش‌های تحلیلی</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="پیج‌های تحت پایش" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info="تعداد کل پیج‌هایی که در شبکه پایش قرار دارند" trend={12} />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="شاخص هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه — چقدر پیج‌ها یک حرف واحد می‌زنند" subtitle={alignment?.description} />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="خوشه‌های فعال" value={totalClusters} icon="solar:atom-bold-duotone" color="info" info="تعداد خوشه‌های معنایی شناسایی‌شده در شبکه" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="بیشترین نفوذ" value={topInfluencer?.name || '—'} icon="solar:crown-bold-duotone" color="secondary" info={`امتیاز نفوذ: ${topInfluencer?.influence_score?.toFixed(1) || '—'}`} subtitle={topInfluencer?.platform} />
        </Box></Grid>

        {/* Strategic Alerts */}
        <Grid size={{ xs: 12 }}><StrategicAlertsWidget /></Grid>

        {/* Periodic Report + Latest Posts */}
        <Grid size={{ xs: 12, lg: 7 }}><PeriodicReport /></Grid>
        <Grid size={{ xs: 12, lg: 5 }}><LatestPosts /></Grid>

        {/* Identity + Geo + Influencers (dashboard-exclusive) */}
        <Grid size={{ xs: 12, md: 4 }}><IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} /></Grid>
        <Grid size={{ xs: 12, md: 5 }}><GeoBarChart data={macro?.geo_distribution} loading={macroLoading} /></Grid>
        <Grid size={{ xs: 12, md: 3 }}><TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} /></Grid>

        {/* Silence Radar */}
        <Grid size={{ xs: 12 }}><SilenceRadar /></Grid>
      </Grid>
    </DashboardContent>
  );
}
