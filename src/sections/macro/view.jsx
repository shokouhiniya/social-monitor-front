'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import { useTrendingKeywords, useTopicGravity, useReshareTree } from 'src/api/posts';
import { useMacroDashboard, useAlignmentIndex, useReactionVelocity, useGhostPages } from 'src/api/analytics';

import { StatCard } from '../dashboard/components/stat-card';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { TrendingKeywordsCloud } from '../dashboard/components/trending-keywords-cloud';
import { ReactionVelocityChart } from './components/reaction-velocity-chart';
import { GhostPagesCard } from './components/ghost-pages-card';
import { ReshareTreeChart } from './components/reshare-tree-chart';
import { ClusterRadarChart } from './components/cluster-radar-chart';
import { NetworkActivityChart } from './components/network-activity-chart';

// ----------------------------------------------------------------------

export function MacroView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: keywords, isLoading: kwLoading } = useTrendingKeywords(30);
  const { data: topics, isLoading: topicLoading } = useTopicGravity(30);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(30);

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const ghostCount = macro?.identity_distribution?.find((i) => i.category === 'unknown')?.count || 0;

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          نمای ماکرو
        </Typography>
        <Typography variant="body2" color="text.secondary">
          تحلیل عمیق اکوسیستم شبکه — خوشه‌بندی، نفوذ، سرعت واکنش و پیج‌های در معرض ریزش
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Row */}
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="کل پیج‌ها"
              value={totalPages}
              icon="solar:users-group-rounded-bold-duotone"
              color="primary"
              info="مجموع پیج‌های تحت پایش"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="خوشه‌ها"
              value={macro?.cluster_distribution?.length || 0}
              icon="solar:atom-bold-duotone"
              color="info"
              info="تعداد خوشه‌های معنایی فعال"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="هم‌گرایی"
              value={`${alignment?.alignment_index ?? 0}%`}
              icon="solar:graph-new-bold-duotone"
              color={alignment?.alignment_index > 50 ? 'success' : 'warning'}
              info="شاخص هم‌صدایی شبکه"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="پیج‌های Ghost"
              value={ghostCount}
              icon="solar:ghost-bold-duotone"
              color="error"
              info="پیج‌هایی با فعالیت بسیار کم یا در حال حذف محتوا"
            />
          </Box>
        </Grid>

        {/* Topic Gravity + Cluster Radar */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TopicGravityChart data={topics} loading={topicLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ClusterRadarChart data={macro?.cluster_distribution} loading={macroLoading} />
        </Grid>

        {/* Reaction Velocity + Network Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ReactionVelocityChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NetworkActivityChart />
        </Grid>

        {/* Trending + Reshare + Ghost */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TrendingKeywordsCloud data={keywords} loading={kwLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReshareTreeChart data={reshares} loading={reshareLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <GhostPagesCard />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
