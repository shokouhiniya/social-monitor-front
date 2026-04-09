'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { IdentityDistribution } from './components/identity-distribution';
import { TrendingKeywords } from './components/trending-keywords';
import { TopInfluencers } from './components/top-influencers';
import { AlignmentIndex } from './components/alignment-index';
import { TopicGravity } from './components/topic-gravity';
import { GeoDistribution } from './components/geo-distribution';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment, isLoading: alignmentLoading } = useAlignmentIndex();

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        داشبورد کلان — مرکز هوش رسانه‌ای
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <AlignmentIndex data={alignment} loading={alignmentLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TopicGravity data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <IdentityDistribution data={macro?.identity_distribution} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GeoDistribution data={macro?.geo_distribution} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TrendingKeywords data={macro?.trending_keywords} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TopInfluencers data={macro?.top_influencers} loading={macroLoading} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
