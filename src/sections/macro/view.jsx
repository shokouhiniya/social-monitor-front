'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTopicGravity, useReshareTree } from 'src/api/posts';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { StatCard } from '../dashboard/components/stat-card';
import { RefreshBar } from '../dashboard/components/refresh-bar';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { SentimentInfluenceMatrix } from './components/sentiment-influence-matrix';
import { ReactionVelocityChart } from './components/reaction-velocity-chart';
import { NarrativeBattle } from './components/narrative-battle';
import { ReshareTreeChart } from './components/reshare-tree-chart';
import { KeywordVelocity } from './components/keyword-velocity';
import { NetworkActivityChart } from './components/network-activity-chart';
import { SentimentOverviewChart } from './components/sentiment-overview-chart';

// ----------------------------------------------------------------------

export function MacroView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: topics, isLoading: topicLoading } = useTopicGravity(30);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(30);

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const topKeyword = macro?.trending_keywords?.[0]?.keyword || '—';
  const totalReshares = reshares?.reduce((s, i) => s + Number(i.reshare_count), 0) || 0;

  // Polarity index: how divided is the network
  const topTopics = macro?.topic_gravity?.slice(0, 3) || [];
  const polarityScore = topTopics.length > 0
    ? Math.round(topTopics.reduce((s, t) => {
        const sents = t.sentiments || {};
        const angry = sents.angry || 0;
        const hopeful = sents.hopeful || 0;
        const total = Object.values(sents).reduce((a, b) => a + b, 0) || 1;
        return s + Math.abs(angry - hopeful) / total;
      }, 0) / topTopics.length * 100)
    : 0;

  return (
    <DashboardContent maxWidth="xl">
      <RefreshBar />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>نمای ماکرو</Typography>
        <Typography variant="body2" color="text.secondary">تحلیل عمیق محتوا — نفوذ، احساسات، شتاب واژگان و نبرد روایت‌ها</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Row — unique to macro */}
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="پیج‌های فعال" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info="مجموع پیج‌های تحت پایش" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="شاخص دوقطبی‌گری" value={`${polarityScore}%`} icon="solar:bolt-circle-bold-duotone" color={polarityScore > 50 ? 'error' : 'info'} info="میزان دوقطبی بودن فضای شبکه — بالاتر = تنش بیشتر" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="واژه کلیدی روز" value={topKeyword} icon="solar:hashtag-bold-duotone" color="warning" info="پرتکرارترین کلمه کلیدی در شبکه" />
        </Box></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Box sx={{ height: '100%' }}>
          <StatCard title="نرخ بازنشر کل" value={totalReshares} icon="solar:share-bold-duotone" color="secondary" info="مجموع بازنشرها — نشان‌دهنده پژواک‌دهی شبکه" />
        </Box></Grid>

        {/* Main: Topic Gravity (enhanced, full width) */}
        <Grid size={{ xs: 12 }}>
          <TopicGravityChart data={topics} loading={topicLoading} />
        </Grid>

        {/* Analysis: Sentiment-Influence Matrix */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <SentimentInfluenceMatrix />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <NarrativeBattle />
        </Grid>

        {/* Dynamics: Reaction Velocity + Sentiment Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ReactionVelocityChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SentimentOverviewChart />
        </Grid>

        {/* Network: Reshare Tree + Keyword Velocity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ReshareTreeChart data={reshares} loading={reshareLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KeywordVelocity />
        </Grid>

        {/* Network Activity */}
        <Grid size={{ xs: 12 }}>
          <NetworkActivityChart />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
