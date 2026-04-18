'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { StatCard } from './components/stat-card';
import { RefreshBar } from './components/refresh-bar';
import { PulseStrip } from './components/pulse-strip';
import { GeoWorldMap } from './components/geo-world-map';
import { SilenceRadar } from './components/silence-radar';
import { AiSynthesizer } from './components/ai-synthesizer';
import { PeriodicReport } from './components/periodic-report';
import { CrisisCorridor } from './components/crisis-corridor';
import { HighImpactFeed } from './components/high-impact-feed';
import { TopicGravityChart } from './components/topic-gravity-chart';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { IdentityRadialChart } from './components/identity-radial-chart';
import { NarrativeHealthGauge } from './components/narrative-health-gauge';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const totalClusters = macro?.cluster_distribution?.length || 0;
  const topInfluencer = macro?.top_influencers?.[0];

  return (
    <DashboardContent maxWidth="xl">
      {/* 1. Refresh Bar */}
      <RefreshBar />

      {/* 2. AI Synthesizer — headline */}
      <AiSynthesizer />

      {/* 2. Periodic Report */}
      <Box sx={{ mt: 3 }}>
        <PeriodicReport />
      </Box>

      {/* 3. Pulse Strip */}
      <Box sx={{ mt: 3 }}>
        <PulseStrip />
      </Box>

      {/* 4. Stat Cards — all in one grid */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="پیج‌های تحت پایش" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info="تعداد کل پیج‌هایی که در شبکه پایش قرار دارند" trend={12} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="شاخص هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه" subtitle={alignment?.description} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="خوشه‌های فعال" value={totalClusters} icon="solar:atom-bold-duotone" color="info" info="تعداد خوشه‌های معنایی شناسایی‌شده" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="بیشترین نفوذ" value={topInfluencer?.name || '—'} icon="solar:crown-bold-duotone" color="secondary" info={`امتیاز: ${topInfluencer?.influence_score?.toFixed(1) || '—'}`} subtitle={topInfluencer?.platform} />
        </Grid>

        {/* 5. Alerts + Crisis Corridor */}
        <Grid size={{ xs: 12, md: 8 }}>
          <StrategicAlertsWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CrisisCorridor />
        </Grid>

        {/* 6. Identity + Topic Gravity — side by side */}
        <Grid size={{ xs: 12, md: 6 }}>
          <IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>

        {/* 7. Silence Radar — full width */}
        <Grid size={{ xs: 12 }}>
          <SilenceRadar />
        </Grid>

        {/* 8. Geo Map — full width */}
        <Grid size={{ xs: 12 }}>
          <GeoWorldMap data={macro?.geo_distribution} loading={macroLoading} />
        </Grid>

        {/* 9. Influencers + Narrative Health + High Impact */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: '100%' }}>
            <TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: '100%' }}>
            <NarrativeHealthGauge />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: '100%' }}>
            <HighImpactFeed />
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
