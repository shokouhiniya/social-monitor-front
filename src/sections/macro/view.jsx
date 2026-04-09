'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import { useTopicGravity, useReshareTree, useSentimentTimeline } from 'src/api/posts';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { StatCard } from '../dashboard/components/stat-card';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { TrendingKeywordsCloud } from '../dashboard/components/trending-keywords-cloud';
import { ReactionVelocityChart } from './components/reaction-velocity-chart';
import { GhostPagesCard } from './components/ghost-pages-card';
import { ReshareTreeChart } from './components/reshare-tree-chart';
import { ClusterRadarChart } from './components/cluster-radar-chart';
import { NetworkActivityChart } from './components/network-activity-chart';
import { SentimentOverviewChart } from './components/sentiment-overview-chart';

// ----------------------------------------------------------------------

export function MacroView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: topics, isLoading: topicLoading } = useTopicGravity(30);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(30);

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const newsCount = macro?.identity_distribution?.filter((i) => ['news', 'local_news'].includes(i.category)).reduce((s, i) => s + Number(i.count), 0) || 0;
  const activistCount = macro?.identity_distribution?.filter((i) => ['activist', 'politician'].includes(i.category)).reduce((s, i) => s + Number(i.count), 0) || 0;

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>نمای ماکرو</Typography>
        <Typography variant="body2" color="text.secondary">تحلیل عمیق — خوشه‌بندی، نفوذ، سرعت واکنش، احساسات و پیج‌های در معرض ریزش</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Row — unique to macro */}
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="پیج‌های خبری" value={newsCount} icon="solar:document-text-bold-duotone" color="primary" info="پیج‌های خبری و محلی" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="فعالان و سیاسی" value={activistCount} icon="solar:flag-bold-duotone" color="warning" info="پیج‌های فعال حقوقی و سیاستمداران" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="موضوعات داغ" value={topics?.length || 0} icon="solar:fire-bold-duotone" color="error" info="تعداد موضوعات فعال در شبکه" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="منابع بازنشر" value={reshares?.length || 0} icon="solar:share-bold-duotone" color="info" info="تعداد منابع اصلی بازنشر محتوا" />
        </Box></Grid>

        {/* Topic Gravity + Cluster — macro exclusive */}
        <Grid size={{ xs: 12, lg: 8 }}><TopicGravityChart data={topics} loading={topicLoading} /></Grid>
        <Grid size={{ xs: 12, lg: 4 }}><ClusterRadarChart data={macro?.cluster_distribution} loading={macroLoading} /></Grid>

        {/* Sentiment Overview — macro exclusive */}
        <Grid size={{ xs: 12 }}><SentimentOverviewChart /></Grid>

        {/* Reaction Velocity + Network Activity — macro exclusive */}
        <Grid size={{ xs: 12, md: 6 }}><ReactionVelocityChart /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><NetworkActivityChart /></Grid>

        {/* Reshare + Ghost — macro exclusive */}
        <Grid size={{ xs: 12, md: 6 }}><ReshareTreeChart data={reshares} loading={reshareLoading} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><GhostPagesCard /></Grid>
      </Grid>
    </DashboardContent>
  );
}
