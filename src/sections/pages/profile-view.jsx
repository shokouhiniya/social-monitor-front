'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProfileDeepDive } from 'src/api/analytics';

import { StatCard } from '../dashboard/components/stat-card';
import { PersonaRadar } from './components/persona-radar';
import { SentimentTimeline } from './components/sentiment-timeline';
import { ProfileHeader } from './components/profile-header';
import { PainPoints } from './components/pain-points';
import { FieldNotes } from './components/field-notes';
import { ContentHookAnalyzer } from './components/content-hook-analyzer';
import { InteractionCopilot } from './components/interaction-copilot';
import { ActionCards } from './components/action-cards';
import { ComparisonSlider } from './components/comparison-slider';

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
        <Grid size={{ xs: 12 }}>
          <ProfileHeader page={pg} />
        </Grid>

        {/* KPI Row */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="اعتبار" value={data.credibility_score?.toFixed(1)}
            icon="solar:shield-check-bold-duotone"
            color={data.credibility_score > 7 ? 'success' : data.credibility_score > 4 ? 'warning' : 'error'}
            info="چقدر حرف‌های این پیج توسط بقیه شبکه جدی گرفته می‌شود"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="نفوذ" value={data.influence_score?.toFixed(1)}
            icon="solar:crown-bold-duotone"
            color={data.influence_score > 7 ? 'primary' : 'info'}
            info="ضریب تاثیرگذاری پیج بر سایر پیج‌های شبکه"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="پایداری" value={data.consistency_rate?.toFixed(1)}
            icon="solar:clock-circle-bold-duotone"
            color={data.consistency_rate > 7 ? 'success' : 'warning'}
            info="مداومت ادمین در انتشار محتوا و حفظ لحن"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="فالوور" value={pg?.followers_count?.toLocaleString()}
            icon="solar:users-group-rounded-bold-duotone"
            color="secondary"
            info="تعداد دنبال‌کنندگان پیج"
          />
        </Grid>

        {/* Interaction Copilot */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InteractionCopilot page={pg} contentHooks={data.content_hooks} />
        </Grid>

        {/* Action Cards */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ActionCards pageId={id} />
        </Grid>

        {/* Persona Radar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <PersonaRadar data={data.persona_radar} />
        </Grid>

        {/* Sentiment Timeline */}
        <Grid size={{ xs: 12, md: 7 }}>
          <SentimentTimeline data={data.sentiment_timeline} />
        </Grid>

        {/* Pain Points + Comparison */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PainPoints
            painPoints={data.pain_points}
            keywords={data.keywords}
            credibility={data.credibility_score}
            influence={data.influence_score}
            consistency={data.consistency_rate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ComparisonSlider currentData={pg} previousData={pg} />
        </Grid>

        {/* Content Hooks + Field Notes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ContentHookAnalyzer data={data.content_hooks} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldNotes reports={pg?.field_reports} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
