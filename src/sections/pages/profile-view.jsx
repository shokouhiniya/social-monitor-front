'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProfileDeepDive } from 'src/api/analytics';

import { ProfileStatCard } from './components/profile-stat-card';
import { CriticalRedlines } from './components/critical-redlines';
import { PersonaRadar } from './components/persona-radar';
import { SentimentTimeline } from './components/sentiment-timeline';
import { ProfileHeader } from './components/profile-header';
import { InteractionCopilot } from './components/interaction-copilot';
import { ActionCards } from './components/action-cards';
import { ContentHookAnalyzer } from './components/content-hook-analyzer';
import { InsightPanel } from './components/insight-panel';
import { NarrativeTimeline } from './components/narrative-timeline';

// ----------------------------------------------------------------------

export function PageProfileView({ id }) {
  const { data, isLoading } = useProfileDeepDive(id);

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }

  if (!data) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography>پیج یافت نشد</Typography>
      </DashboardContent>
    );
  }

  const pg = data.page;

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* Critical Redlines */}
        <Grid size={{ xs: 12 }}>
          <CriticalRedlines page={pg} />
        </Grid>

        {/* Profile Header */}
        <Grid size={{ xs: 12 }}>
          <ProfileHeader page={pg} />
        </Grid>

        {/* Smart KPIs with pulse graph */}
        <Grid size={{ xs: 6, md: 3 }}>
          <ProfileStatCard title="اعتبار" value={data.credibility_score} prevValue={data.credibility_score * 0.9} icon="solar:shield-check-bold-duotone" color={data.credibility_score > 7 ? 'success' : data.credibility_score > 4 ? 'warning' : 'error'} info="میزان جدی گرفته شدن توسط شبکه" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <ProfileStatCard title="نفوذ" value={data.influence_score} prevValue={data.influence_score * 0.85} icon="solar:crown-bold-duotone" color="primary" info="ضریب تاثیرگذاری بر سایر پیج‌ها" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <ProfileStatCard title="پایداری" value={data.consistency_rate} prevValue={data.consistency_rate * 0.95} icon="solar:clock-circle-bold-duotone" color={data.consistency_rate > 7 ? 'success' : 'warning'} info="مداومت در انتشار محتوا و حفظ لحن" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <ProfileStatCard title="فالوور" value={pg?.followers_count || 0} prevValue={(pg?.followers_count || 0) * 0.92} icon="solar:users-group-rounded-bold-duotone" color="secondary" info="تعداد دنبال‌کنندگان" maxValue={pg?.followers_count * 1.2 || 100} />
        </Grid>

        {/* AI Assistant: Interaction Copilot */}
        <Grid size={{ xs: 12, md: 5 }}>
          <InteractionCopilot page={pg} contentHooks={data.content_hooks} />
        </Grid>

        {/* Action Cards */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ActionCards pageId={id} />
        </Grid>

        {/* Psychology: Persona Radar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <PersonaRadar data={data.persona_radar} />
        </Grid>

        {/* Sentiment Timeline */}
        <Grid size={{ xs: 12, md: 7 }}>
          <SentimentTimeline data={data.sentiment_timeline} />
        </Grid>

        {/* Insight Panel (Pain Points + Keywords + Field Notes) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InsightPanel painPoints={data.pain_points} keywords={data.keywords} fieldReports={pg?.field_reports} />
        </Grid>

        {/* Content Hook Analyzer */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ContentHookAnalyzer data={data.content_hooks} />
        </Grid>

        {/* Unified Narrative Timeline */}
        <Grid size={{ xs: 12 }}>
          <NarrativeTimeline posts={pg?.posts} fieldReports={pg?.field_reports} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
