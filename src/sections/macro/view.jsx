'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { useTrendingKeywords, useTopicGravity, useReshareTree } from 'src/api/posts';
import { useMacroDashboard } from 'src/api/analytics';

import { TrendingKeywords } from '../dashboard/components/trending-keywords';
import { TopicGravity } from '../dashboard/components/topic-gravity';
import { ReactionVelocity } from '../dashboard/components/reaction-velocity';
import { GhostPages } from '../dashboard/components/ghost-pages';
import { ReshareTree } from './components/reshare-tree';
import { ClusterDistribution } from './components/cluster-distribution';

// ----------------------------------------------------------------------

export function MacroView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: keywords, isLoading: kwLoading } = useTrendingKeywords(7);
  const { data: topics, isLoading: topicLoading } = useTopicGravity(7);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(7);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        نمای ماکرو — اکوسیستم شبکه
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TopicGravity data={topics} loading={topicLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ClusterDistribution data={macro?.cluster_distribution} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReactionVelocity />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TrendingKeywords data={keywords} loading={kwLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ReshareTree data={reshares} loading={reshareLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GhostPages />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
