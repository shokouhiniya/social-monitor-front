'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useReshareTree, useTopicGravity } from 'src/api/posts';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { StatCard } from '../dashboard/components/stat-card';
import { NarrativeBattle } from '../macro/components/narrative-battle';
import { KeywordVelocity } from '../macro/components/keyword-velocity';
import { ReshareTreeChart } from '../macro/components/reshare-tree-chart';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { NetworkActivityChart } from '../macro/components/network-activity-chart';
import { ReactionVelocityChart } from '../macro/components/reaction-velocity-chart';
import { SentimentOverviewChart } from '../macro/components/sentiment-overview-chart';
import { SentimentInfluenceMatrix } from '../macro/components/sentiment-influence-matrix';

// ----------------------------------------------------------------------

export function TelegramMacroView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: topics, isLoading: topicLoading } = useTopicGravity(30);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(30);

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const topKeyword = macro?.trending_keywords?.[0]?.keyword || '—';
  const totalReshares = reshares?.reduce((s, i) => s + Number(i.reshare_count), 0) || 0;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Iconify icon="mdi:telegram" width={28} sx={{ color: '#0088cc' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>نمای ماکرو تلگرام</Typography>
          <Typography variant="body2" color="text.secondary">تحلیل عمیق شبکه کانال‌های تلگرام</Typography>
        </Box>
      </Stack>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="کل کانال‌ها" value={totalPages} icon="mdi:telegram" color="info" info="تعداد کانال‌های تحت پایش" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="کلمه داغ" value={topKeyword} icon="solar:fire-bold-duotone" color="error" info="پرتکرارترین کلمه کلیدی" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="بازنشرها" value={totalReshares} icon="solar:share-bold-duotone" color="secondary" info="مجموع فوروارد‌ها" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <NetworkActivityChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReactionVelocityChart />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SentimentOverviewChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <KeywordVelocity />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NarrativeBattle />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ReshareTreeChart data={reshares} loading={reshareLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SentimentInfluenceMatrix />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
