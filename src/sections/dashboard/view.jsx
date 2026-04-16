'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { AiSynthesizer } from './components/ai-synthesizer';
import { PeriodicReport } from './components/periodic-report';
import { PulseStrip } from './components/pulse-strip';
import { StatCard } from './components/stat-card';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';
import { IdentityRadialChart } from './components/identity-radial-chart';
import { TopicGravityChart } from './components/topic-gravity-chart';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { GeoWorldMap } from './components/geo-world-map';
import { SilenceRadar } from './components/silence-radar';
import { NarrativeHealthGauge } from './components/narrative-health-gauge';
import { HighImpactFeed } from './components/high-impact-feed';
import { CrisisCorridor } from './components/crisis-corridor';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const totalClusters = macro?.cluster_distribution?.length || 0;
  const topInfluencer = macro?.top_influencers?.[0];

  return (
    <DashboardContent maxWidth="xl">
      {/* Crisis Corridor - floating sidebar */}
      <CrisisCorridor />

      {/* Header: AI Synthesizer */}
      <AiSynthesizer />

      <Box sx={{ mt: 3, mb: 1 }}>
        <PeriodicReport />
      </Box>

      {/* Row 1: Pulse Strip */}
      <Box sx={{ mt: 3 }}>
        <PulseStrip />
      </Box>

      {/* Row 2: Stat Cards */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="پیج‌های تحت پایش" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info="تعداد کل پیج‌هایی که در شبکه پایش قرار دارند" trend={12} />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="شاخص هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه" subtitle={alignment?.description} />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="خوشه‌های فعال" value={totalClusters} icon="solar:atom-bold-duotone" color="info" info="تعداد خوشه‌های معنایی شناسایی‌شده" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="بیشترین نفوذ" value={topInfluencer?.name || '—'} icon="solar:crown-bold-duotone" color="secondary" info={`امتیاز: ${topInfluencer?.influence_score?.toFixed(1) || '—'}`} subtitle={topInfluencer?.platform} />
        </Box></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* Row 3: Identity + Topic Gravity + Alerts */}
        <Grid size={{ xs: 12, md: 4 }}><IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><StrategicAlertsWidget /></Grid>

        {/* Row 4: Silence Radar (circular) */}
        <Grid size={{ xs: 12 }}><SilenceRadar /></Grid>

        {/* Row 5: Geo + Influencers + Narrative + High Impact */}
        <Grid size={{ xs: 12, lg: 6 }}><GeoWorldMap data={macro?.geo_distribution} loading={macroLoading} /></Grid>
        <Grid size={{ xs: 12, lg: 3 }}><Box sx={{ height: '100%' }}><TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} /></Box></Grid>
        <Grid size={{ xs: 12, lg: 3 }}><Box sx={{ height: '100%' }}><NarrativeHealthGauge /></Box></Grid>

        {/* Row 6: High Impact Feed */}
        <Grid size={{ xs: 12 }}><HighImpactFeed /></Grid>
      </Grid>
    </DashboardContent>
  );
}
