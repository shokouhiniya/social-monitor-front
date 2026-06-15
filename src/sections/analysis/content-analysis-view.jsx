'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useActivityIndex, useMacroDashboard, useNarrativeHealth } from 'src/api/analytics';

import { StatCard } from 'src/sections/dashboard/components/stat-card';
import { PulseStrip } from 'src/sections/dashboard/components/pulse-strip';
import { AiSynthesizer } from 'src/sections/dashboard/components/ai-synthesizer';
import { CrisisCorridor } from 'src/sections/dashboard/components/crisis-corridor';
import { HighImpactFeed } from 'src/sections/dashboard/components/high-impact-feed';
import { AiRequiredBadge } from 'src/sections/dashboard/components/ai-required-badge';
import { TopicGravityChart } from 'src/sections/dashboard/components/topic-gravity-chart';
import { CollapsibleSection } from 'src/sections/dashboard/components/collapsible-section';
import { NarrativeHealthGauge } from 'src/sections/dashboard/components/narrative-health-gauge';
import { TrendingKeywordsCloud } from 'src/sections/dashboard/components/trending-keywords-cloud';

// ----------------------------------------------------------------------

/**
 * نمای تحلیل محتوا (محتوامحور) — مستقل از کنشگر. scope از context خوانده می‌شود
 * (با StaticScopeProvider قابل‌تنظیم: all / platform:instagram / ...).
 *
 * ماژول‌های محتوامحور: کلمات کلیدی، ثقل موضوعی، ضربان شبکه، سلامت روایت،
 * پست‌های پرتاثیر، Crisis Corridor، خلاصهٔ AI.
 */
export function ContentAnalysisView({ emptyHint }) {
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: activityIdx } = useActivityIndex();
  const { data: narrativeHealth } = useNarrativeHealth();

  const trending = macro?.trending_keywords ?? [];
  const topicGravity = macro?.topic_gravity ?? [];
  const hasData = trending.length > 0 || topicGravity.length > 0;

  return (
    <Grid container spacing={3}>
      {/* KPIها */}
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="شاخص فعالیت (پست)"
          value={`${activityIdx?.post_change > 0 ? '+' : ''}${activityIdx?.post_change ?? 0}%`}
          icon="solar:posts-carousel-vertical-bold-duotone"
          color={(activityIdx?.post_change ?? 0) >= 0 ? 'success' : 'error'}
          info="تغییر حجم پست ۷ روز اخیر نسبت به میانگین"
          subtitle={`${activityIdx?.recent_posts ?? 0} پست اخیر`}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="شاخص فعالیت (تعامل)"
          value={`${activityIdx?.engagement_change > 0 ? '+' : ''}${activityIdx?.engagement_change ?? 0}%`}
          icon="solar:chat-round-like-bold-duotone"
          color={(activityIdx?.engagement_change ?? 0) >= 0 ? 'success' : 'error'}
          info="تغییر تعامل ۷ روز اخیر نسبت به میانگین"
          subtitle={`${(activityIdx?.recent_engagement ?? 0).toLocaleString()} تعامل`}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="سلامت روایت"
          value={`${narrativeHealth?.score ?? 0}%`}
          icon="solar:target-bold-duotone"
          color={narrativeHealth?.score > 70 ? 'success' : narrativeHealth?.score > 40 ? 'warning' : 'error'}
          info="سهم کلمات کلیدی روایت مدنظر از کل کلمات ۷ روز اخیر"
          subtitle={narrativeHealth?.label}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="کلمات کلیدی فعال"
          value={trending.length}
          icon="solar:hashtag-bold-duotone"
          color="info"
          info="تعداد کلمات کلیدی پرتکرار در بازه"
        />
      </Grid>

      {!hasData && !macroLoading ? (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>{emptyHint || 'محتوایی برای این محدوده یافت نشد.'}</Typography>
          </Box>
        </Grid>
      ) : (
        <>
          {/* ضربان شبکه */}
          <Grid size={{ xs: 12 }}>
            <PulseStrip />
          </Grid>

          {/* ثقل موضوعی + ابر کلمات */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TopicGravityChart data={topicGravity} loading={macroLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TrendingKeywordsCloud data={trending} loading={macroLoading} />
          </Grid>

          {/* سلامت روایت + پست‌های پرتاثیر */}
          <Grid size={{ xs: 12, md: 6 }}>
            <NarrativeHealthGauge />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <HighImpactFeed />
          </Grid>

          {/* ماژول‌های تکمیلی */}
          <Grid size={{ xs: 12 }}>
            <CollapsibleSection
              title="ماژول‌های تکمیلی"
              icon="solar:layers-bold-duotone"
              color="info"
              subtitle="خلاصهٔ AI و Crisis Corridor"
            >
              <Stack spacing={3}>
                <AiRequiredBadge title="خلاصه‌ساز هوش مصنوعی">
                  <AiSynthesizer />
                </AiRequiredBadge>
                <CrisisCorridor />
              </Stack>
            </CollapsibleSection>
          </Grid>
        </>
      )}
    </Grid>
  );
}
