'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMacroDashboard, useAlignmentIndex, useNarrativeHealth, useActivityIndex } from 'src/api/analytics';

import { StatCard } from './components/stat-card';
import { DebugBox } from './components/debug-box';
import { RefreshBar } from './components/refresh-bar';
import { PulseStrip } from './components/pulse-strip';
import { GeoWorldMap } from './components/geo-world-map';
import { SilenceRadar } from './components/silence-radar';
import { AiSynthesizer } from './components/ai-synthesizer';
import { PeriodicReport } from './components/periodic-report';
import { CrisisCorridor } from './components/crisis-corridor';
import { HighImpactFeed } from './components/high-impact-feed';
import { TopicGravityChart } from './components/topic-gravity-chart';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { IdentityRadialChart } from './components/identity-radial-chart';
import { NarrativeHealthGauge } from './components/narrative-health-gauge';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: narrativeHealth } = useNarrativeHealth();
  const { data: activityIdx } = useActivityIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;

  return (
    <DashboardContent maxWidth="xl">
      {/* 1. Refresh Bar */}
      <RefreshBar />
      <DebugBox
        endpoint="POST /analytics/refresh → GET /analytics/refresh-status"
        dataSource="Calls generateReportWithLLM() + generateAlertsWithLLM() together. Cron runs at 00:00, 06:00, 12:00, 18:00 Tehran time."
        usesLLM
        promptKey="prompt_report_generation + prompt_alert_generation"
        promptEditPath="تنظیمات → پرامپت‌ها → پرامپت تولید گزارش / پرامپت تولید هشدار"
        notes="The 'بروزرسانی' button triggers BOTH report + alert generation in one call."
      />

      {/* 2. AI Synthesizer — headline */}
      <Box sx={{ mt: 2 }}>
        <AiSynthesizer />
        <DebugBox
          endpoint="GET /analytics/ai-synthesizer"
          dataSource="getTrendingKeywords(1 day) + getTopicGravity(1 day) + getSentimentTimeline(1 day). Sends topics + keywords + mood to Gemini Flash for a one-sentence Farsi summary."
          usesLLM
          notes="Uses google/gemini-2.0-flash-001 with 15s timeout. Falls back to template if LLM fails."
        />
      </Box>

      {/* 3. Periodic Report */}
      <Box sx={{ mt: 3 }}>
        <PeriodicReport />
        <DebugBox
          endpoint="GET /analytics/periodic-report?hours=N → POST /analytics/generate-report (AI button)"
          dataSource="Rule-based report: getTrendingKeywords + getTopicGravity + getSentimentTimeline + getReshareTree + getCategoryDistribution + getGhostPages. AI report: same data sent to LLM."
          usesLLM
          promptKey="prompt_report_generation + prompt_report_generation_extra"
          promptEditPath="تنظیمات → پرامپت‌ها → پرامپت تولید گزارش + دستورات اضافی تولید گزارش"
          notes="Two modes: 1) Rule-based (default load) generates Farsi paragraphs from data. 2) 'تولید با AI' sends data to LLM for richer analysis. Timeframe selector controls the data window."
        />
      </Box>

      {/* 4. Pulse Strip */}
      <Box sx={{ mt: 3 }}>
        <PulseStrip />
        <DebugBox
          endpoint="GET /analytics/network-pulse"
          dataSource="Posts from last 24h grouped by hour: SELECT EXTRACT(HOUR FROM published_at), COUNT(*) GROUP BY hour"
          usesLLM={false}
          notes="Simple hourly post count. Refreshes every 60 seconds."
        />
      </Box>

      {/* 5. Stat Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="پیج‌های تحت پایش" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info="تعداد کل پیج‌هایی که در شبکه پایش قرار دارند" trend={12} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="شاخص هم‌گرایی" value={`${alignment?.alignment_index ?? 0}%`} icon="solar:graph-new-bold-duotone" color={alignment?.alignment_index > 50 ? 'success' : 'warning'} info="میزان هم‌صدایی شبکه" subtitle={alignment?.description} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="هم‌راستایی هفته"
            value={`${narrativeHealth?.score ?? 0}%`}
            icon="solar:target-bold-duotone"
            color={narrativeHealth?.score > 70 ? 'success' : narrativeHealth?.score > 40 ? 'warning' : 'error'}
            info="سهم کلمات کلیدی روایت مدنظر از کل کلمات کلیدی ۷ روز اخیر"
            subtitle={narrativeHealth?.label}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="شاخص فعالیت"
            value={`📄${activityIdx?.post_change > 0 ? '+' : ''}${activityIdx?.post_change ?? 0}%  💬${activityIdx?.engagement_change > 0 ? '+' : ''}${activityIdx?.engagement_change ?? 0}%`}
            icon="solar:chart-bold-duotone"
            color={
              (activityIdx?.post_change ?? 0) > 10 || (activityIdx?.engagement_change ?? 0) > 10 ? 'success'
              : (activityIdx?.post_change ?? 0) < -10 || (activityIdx?.engagement_change ?? 0) < -10 ? 'error'
              : 'warning'
            }
            info="مقایسه حجم پست و تعامل (بدون استوری) ۷ روز اخیر با میانگین تاریخی"
            subtitle={`${activityIdx?.recent_posts ?? 0} پست • ${(activityIdx?.recent_engagement ?? 0).toLocaleString()} تعامل`}
          />
        </Grid>

        {/* Debug boxes for stat cards */}
        <Grid size={{ xs: 6, md: 3 }}>
          <DebugBox endpoint="GET /analytics/macro-dashboard" dataSource="SUM of identity_distribution counts from getCategoryDistribution()" usesLLM={false} notes="Counts all pages in the pages table." />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <DebugBox endpoint="GET /analytics/alignment-index" dataSource="getTrendingKeywords(30 days). Ratio of top-5 keyword frequency to total keyword frequency." usesLLM={false} notes="High alignment = network is saying the same things." />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <DebugBox endpoint="GET /analytics/narrative-health" dataSource="Matches target_narrative keywords against getTrendingKeywords(7d) + getTopicGravity(7d). Score = matched/total * 100." usesLLM={false} promptEditPath="تنظیمات → روایت → روایت مدنظر" notes="Fuzzy match of target narrative keywords vs network content." />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <DebugBox endpoint="GET /analytics/activity-index" dataSource="Compares last 7 days (post count + engagement excluding stories) vs previous 23 days average normalized to 7 days. Returns separate post_change and engagement_change percentages." usesLLM={false} notes="Stories excluded from engagement calc (API doesn't return interactions for them)." />
        </Grid>

        {/* 6. Alerts + Crisis Corridor */}
        <Grid size={{ xs: 12, md: 8 }}>
          <StrategicAlertsWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CrisisCorridor />
        </Grid>
        {/* Debug: Alerts + Crisis */}
        <Grid size={{ xs: 12, md: 8 }}>
          <DebugBox
            endpoint="GET /strategic-alerts → POST /analytics/generate-alerts (via Refresh)"
            dataSource="Alerts table. Auto-generated by generateAlertsWithLLM(): sends top 30 pages + trending topics + keywords to LLM."
            usesLLM
            promptKey="prompt_alert_generation + prompt_alert_generation_extra"
            promptEditPath="تنظیمات → پرامپت‌ها → پرامپت تولید هشدار + دستورات اضافی تولید هشدار"
            notes="Alerts are generated when 'بروزرسانی' is clicked or by cron. Manual alerts can also be created. LLM returns 5 alerts with title, message, priority, category, playbook."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DebugBox
            endpoint="GET /analytics/crisis-corridor"
            dataSource="Pages WHERE is_active=false OR consistency_rate<2 OR credibility_score<4. Returns top 10."
            usesLLM={false}
            notes="consistency_rate and credibility_score are set by LLM during page analysis, but this query is pure DB filter."
          />
        </Grid>

        {/* 7. Identity + Topic Gravity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopicGravityChart data={macro?.topic_gravity} loading={macroLoading} />
        </Grid>
        {/* Debug: Identity + Topic */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DebugBox
            endpoint="GET /analytics/macro-dashboard → getCategoryDistribution()"
            dataSource="SELECT page.category, COUNT(*) GROUP BY category — from pages table"
            usesLLM={false}
            notes="Categories (news, activist, celebrity...) are assigned by LLM during page analysis."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DebugBox
            endpoint="GET /analytics/macro-dashboard → getTopicGravity(30 days)"
            dataSource="Aggregates post.extracted_topics from last 30 days with sentiment breakdown per topic."
            usesLLM={false}
            notes="extracted_topics are set by LLM during page/post analysis. This just aggregates them."
          />
        </Grid>

        {/* 8. Silence Radar */}
        <Grid size={{ xs: 12 }}>
          <SilenceRadar />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DebugBox
            endpoint="POST /analytics/silence-radar"
            dataSource="User provides global topics → backend fuzzy-matches against getTopicGravity(7d) + getTrendingKeywords(7d). Default topics from setting 'silence_radar_topics'."
            usesLLM={false}
            promptEditPath="تنظیمات → روایت → موضوعات رادار سکوت"
            notes="No LLM. Simple string matching: topic is 'covered' if any network keyword/topic contains it or vice versa."
          />
        </Grid>

        {/* 9. Geo Map */}
        <Grid size={{ xs: 12 }}>
          <GeoWorldMap data={macro?.geo_distribution} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DebugBox
            endpoint="GET /analytics/macro-dashboard → getCountryDistribution()"
            dataSource="SELECT page.country, COUNT(*) GROUP BY country — from pages table"
            usesLLM={false}
            notes="Country is manually set when adding a page or by LLM during analysis."
          />
        </Grid>

        {/* 10. Influencers + Narrative Health + High Impact */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <NarrativeHealthGauge />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <HighImpactFeed />
        </Grid>
        {/* Debug: Influencers + Narrative + High Impact */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DebugBox
            endpoint="GET /analytics/macro-dashboard → getTopInfluencers(10)"
            dataSource="SELECT * FROM pages ORDER BY influence_score DESC LIMIT 10"
            usesLLM={false}
            notes="influence_score is set by LLM during page analysis (processWithLLM)."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DebugBox
            endpoint="GET /analytics/narrative-health"
            dataSource="Compares getTrendingKeywords(7d) + getTopicGravity(7d) against target_narrative setting. Fuzzy string match."
            usesLLM={false}
            promptEditPath="تنظیمات → روایت → روایت مدنظر"
            notes="No LLM. Checks how many target narrative keywords appear in the network's content. Score = matched/total * 100."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DebugBox
            endpoint="GET /analytics/high-impact-posts?limit=5"
            dataSource="Posts from last 24h ORDER BY (likes_count + comments_count + shares_count) DESC LIMIT 5"
            usesLLM={false}
            notes="Pure engagement ranking. No AI involved."
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
