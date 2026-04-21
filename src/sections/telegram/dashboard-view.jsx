'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { StatCard } from '../dashboard/components/stat-card';
import { PulseStrip } from '../dashboard/components/pulse-strip';
import { GeoWorldMap } from '../dashboard/components/geo-world-map';
import { SilenceRadar } from '../dashboard/components/silence-radar';
import { AiSynthesizer } from '../dashboard/components/ai-synthesizer';
import { PeriodicReport } from '../dashboard/components/periodic-report';
import { CrisisCorridor } from '../dashboard/components/crisis-corridor';
import { HighImpactFeed } from '../dashboard/components/high-impact-feed';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { TopInfluencersRank } from '../dashboard/components/top-influencers-rank';
import { IdentityRadialChart } from '../dashboard/components/identity-radial-chart';
import { NarrativeHealthGauge } from '../dashboard/components/narrative-health-gauge';
import { StrategicAlertsWidget } from '../dashboard/components/strategic-alerts-widget';

// ----------------------------------------------------------------------

export function TelegramDashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const totalClusters = macro?.cluster_distribution?.length || 0;
  const topInfluencer = macro?.top_influencers?.[0];

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="mdi:telegram" width={28} sx={{ color: '#0088cc' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>داشبورد تلگرام</Typography>
      </Stack>

      {/* AI Synthesizer */}
      <AiSynthesizer />

      {/* Periodic Report */}
      <Box sx={{ mt: 3 }}>
        <PeriodicReport />
      </Box>

      {/* Pulse Strip */}
      <Box sx={{ mt: 3 }}>
        <PulseStrip />
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="کانال‌های تحت پایش" value={totalPages} icon="mdi:telegram" color="info" info="تعداد کل کانال‌هایی که در شبکه پایش قرار دارند" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="شاخص هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه" subtitle={alignment?.description} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="خوشه‌های فعال" value={totalClusters} icon="solar:atom-bold-duotone" color="primary" info="تعداد خوشه‌های معنایی شناسایی‌شده" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="بیشترین نفوذ" value={topInfluencer?.name || '—'} icon="solar:crown-bold-duotone" color="secondary" info={`امتیاز: ${topInfluencer?.influence_score?.toFixed(1) || '—'}`} subtitle={topInfluencer?.platform} />
        </Grid>

        {/* Alerts + Crisis Corridor */}
        <Grid size={{ xs: 12, md: 8 }}>
          <StrategicAlertsWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CrisisCorridor />
        </Grid>

        {/* Identity + Topic Gravity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>

        {/* Silence Radar */}
        <Grid size={{ xs: 12 }}>
          <SilenceRadar />
        </Grid>

        {/* Geo Map */}
        <Grid size={{ xs: 12 }}>
          <GeoWorldMap data={macro?.geo_distribution} loading={macroLoading} />
        </Grid>

        {/* Influencers + Narrative Health + High Impact */}
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
