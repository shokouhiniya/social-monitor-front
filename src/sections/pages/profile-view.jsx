'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProfileDeepDive } from 'src/api/analytics';

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
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
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

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ProfileHeader page={data.page} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <InteractionCopilot page={data.page} contentHooks={data.content_hooks} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ActionCards pageId={id} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <PersonaRadar data={data.persona_radar} />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <SentimentTimeline data={data.sentiment_timeline} />
        </Grid>

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
          <ComparisonSlider currentData={data.page} previousData={data.page} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ContentHookAnalyzer data={data.content_hooks} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FieldNotes reports={data.page?.field_reports} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
