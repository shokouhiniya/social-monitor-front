'use client';

import { useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { PulseStrip } from './components/pulse-strip';
import { StatCard } from './components/stat-card';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';
import { TopicGravityChart } from './components/topic-gravity-chart';
import { IdentityPieChart } from './components/identity-pie-chart';
import { GeoBarChart } from './components/geo-bar-chart';
import { TrendingKeywordsCloud } from './components/trending-keywords-cloud';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { SilenceRadar } from './components/silence-radar';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment, isLoading: alignmentLoading } = useAlignmentIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const totalKeywords = macro?.trending_keywords?.length || 0;
  const totalClusters = macro?.cluster_distribution?.length || 0;

  return (
    <DashboardContent maxWidth="xl">
      <PulseStrip />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          مرکز هوش رسانه‌ای
        </Typography>
        <Typography variant="body2" color="text.secondary">
          نمای کلان از اکوسیستم شبکه پایش
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards Row */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="پیج‌های تحت پایش"
            value={totalPages}
            icon="solar:users-group-rounded-bold-duotone"
            color="primary"
            info="تعداد کل پیج‌هایی که در شبکه پایش قرار دارند"
            trend={12}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="شاخص هم‌گرایی"
            value={`${alignment?.alignment_index ?? 0}%`}
            icon="solar:graph-new-bold-duotone"
            color={alignment?.alignment_index > 50 ? 'success' : 'warning'}
            info="میزان هم‌صدایی شبکه — چقدر پیج‌ها یک حرف واحد می‌زنند"
            subtitle={alignment?.description}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="خوشه‌های فعال"
            value={totalClusters}
            icon="solar:atom-bold-duotone"
            color="info"
            info="تعداد خوشه‌های معنایی شناسایی‌شده در شبکه"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="کلمات کلیدی ترند"
            value={totalKeywords}
            icon="solar:hashtag-bold-duotone"
            color="secondary"
            info="تعداد کلمات کلیدی پرتکرار در ۳۰ روز اخیر"
          />
        </Grid>

        {/* Strategic Alerts */}
        <Grid size={{ xs: 12 }}>
          <StrategicAlertsWidget />
        </Grid>

        {/* Topic Gravity + Identity Distribution */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <IdentityPieChart data={macro?.identity_distribution} loading={macroLoading} />
        </Grid>

        {/* Silence Radar */}
        <Grid size={{ xs: 12 }}>
          <SilenceRadar />
        </Grid>

        {/* Geo + Trending + Influencers */}
        <Grid size={{ xs: 12, md: 5 }}>
          <GeoBarChart data={macro?.geo_distribution} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TrendingKeywordsCloud data={macro?.trending_keywords} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
