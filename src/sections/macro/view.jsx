'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useScopeContext } from 'src/contexts/scope-context';
import { useReshareTree, useTopicGravity } from 'src/api/posts';
import { useMacroDashboard, useAlignmentIndex } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { StatCard } from '../dashboard/components/stat-card';
import { NarrativeBattle } from './components/narrative-battle';
import { KeywordVelocity } from './components/keyword-velocity';
import { ReshareTreeChart } from './components/reshare-tree-chart';
import { PageInfoBox } from '../dashboard/components/page-info-box';
import { SilenceRadar } from '../dashboard/components/silence-radar';
import { ScopeSelector } from '../dashboard/components/scope-selector';
import { PeriodicReport } from '../dashboard/components/periodic-report';
import { HighImpactFeed } from '../dashboard/components/high-impact-feed';
import { NetworkActivityChart } from './components/network-activity-chart';
import { ReactionVelocityChart } from './components/reaction-velocity-chart';
import { SentimentOverviewChart } from './components/sentiment-overview-chart';
import { TopicGravityChart } from '../dashboard/components/topic-gravity-chart';
import { CollapsibleSection } from '../dashboard/components/collapsible-section';
import { SentimentInfluenceMatrix } from './components/sentiment-influence-matrix';
import { NarrativeHealthGauge } from '../dashboard/components/narrative-health-gauge';
import { StrategicAlertsWidget } from '../dashboard/components/strategic-alerts-widget';

// ----------------------------------------------------------------------

const SCOPE_LABELS = {
  representatives: 'نمایندگان شبکه',
  cluster: 'خوشه انتخاب‌شده',
  all: 'کل شبکه',
};

const PAGE_INFO = {
  title: 'اتاق وضعیت محتوا',
  icon: 'solar:gallery-bold-duotone',
  color: 'info',
  shortDescription: 'دو سطح تحلیل محتوایی — سطح اول: منابع محتوایی منتخب (گزارش، هشدار، ترند) — سطح دوم: نمایندگان خوشه‌های منتخب (رادار سکوت، نبرد روایت، درخت بازنشر، …)',
  modules: [
    {
      name: 'سطح ۱ — منابع محتوایی منتخب',
      icon: 'solar:document-text-bold-duotone',
      color: 'primary',
      description: 'گزارش دوره‌ای + هشدار استراتژیک + ترندهای موضوعی — ماکرونمای محتوا و تصمیم‌گیری راهبردی',
    },
    {
      name: 'سطح ۲ — نمایندگان خوشه‌های منتخب',
      icon: 'solar:atom-bold-duotone',
      color: 'secondary',
      description: 'رادار سکوت داینامیک، سنجش سلامت روایت، پست‌های جریان‌ساز، نبرد روایت‌ها، سرعت واکنش، درخت بازنشر',
    },
    {
      name: 'گزارش دوره‌ای',
      icon: 'solar:document-text-bold-duotone',
      color: 'info',
      description: 'گزارش متنی از وضعیت محتوای شبکه در بازه ۲۴ ساعت تا ۱ ماه — قابلیت تولید با AI',
    },
    {
      name: 'هشدارهای استراتژیک',
      icon: 'solar:bell-bold-duotone',
      color: 'error',
      description: 'لیست هشدارهای فعال + امکان تعریف عملیات و ارجاع به مرکز عملیات',
    },
    {
      name: 'ترندهای موضوعی (Topic Gravity)',
      icon: 'solar:black-hole-bold-duotone',
      color: 'primary',
      description: 'گراف حبابی موضوعات داغ شبکه — اندازه = حجم پست، رنگ = لحن غالب',
    },
    {
      name: 'رادار سکوت داینامیک',
      icon: 'solar:eye-closed-bold-duotone',
      color: 'error',
      description: 'موضوعات داغ جهانی را وارد کنید تا ببینید کدام موضوعات پوشش داده شده و کدام سکوت',
    },
    {
      name: 'سنجش سلامت روایت',
      icon: 'solar:target-bold-duotone',
      color: 'success',
      description: 'گیج چرخشی نشان‌دهنده درصد هم‌راستایی شبکه با کلمات کلیدی روایت مطلوب',
    },
    {
      name: 'پست‌های جریان‌ساز',
      icon: 'solar:bolt-circle-bold-duotone',
      color: 'warning',
      description: 'پست‌هایی با تعامل غیرعادی که جریان شبکه را شکل می‌دهند',
    },
    {
      name: 'نبرد روایت‌ها',
      icon: 'solar:swords-bold-duotone',
      color: 'error',
      description: 'موضوعاتی با دو دیدگاه متضاد در شبکه',
    },
    {
      name: 'سرعت واکنش',
      icon: 'solar:rocket-2-bold-duotone',
      color: 'info',
      description: 'چقدر طول می‌کشد تا شبکه به یک خبر فوری واکنش نشان دهد',
    },
    {
      name: 'درخت بازنشر',
      icon: 'solar:copy-bold-duotone',
      color: 'secondary',
      description: 'پیج‌هایی که محتوای آن‌ها بیشترین بازنشر را دارند — منابع روایت‌ساز',
    },
  ],
  tips: [
    'برای ماژول‌های تکمیلی (KPI ماکرو، Sentiment-Influence Matrix، Network Activity) به انتهای صفحه بروید',
    'با ScopeSelector می‌توانید همان دو سطح را فقط برای یک خوشه یا فقط برای نمایندگان نمایش دهید',
    'هشدارها می‌توانند مستقیماً به یک «عملیات» در مرکز عملیات تبدیل شوند',
  ],
};

function SectionHeader({ icon, color, title, description }) {
  return (
    <Box sx={(theme) => ({ p: 2, mb: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette[color].main, 0.06), border: `1px solid ${alpha(theme.palette[color].main, 0.15)}` })}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[color].main, 0.14) })}>
          <Iconify icon={icon} width={22} sx={{ color: `${color}.main` }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{description}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function MacroView() {
  const { scope } = useScopeContext();
  const { data: macro } = useMacroDashboard();
  useAlignmentIndex();
  const { data: topics, isLoading: topicLoading } = useTopicGravity(30);
  const { data: reshares, isLoading: reshareLoading } = useReshareTree(30);

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const topKeyword = macro?.trending_keywords?.[0]?.keyword || '—';
  const totalReshares = reshares?.reduce((s, i) => s + Number(i.reshare_count), 0) || 0;

  const topTopics = macro?.topic_gravity?.slice(0, 3) || [];
  const polarityScore =
    topTopics.length > 0
      ? Math.round(
          (topTopics.reduce((s, t) => {
            const sents = t.sentiments || {};
            const angry = sents.angry || 0;
            const hopeful = sents.hopeful || 0;
            const total = Object.values(sents).reduce((a, b) => a + b, 0) || 1;
            return s + Math.abs(angry - hopeful) / total;
          }, 0) /
            topTopics.length) *
            100,
        )
      : 0;

  const scopeLabel = SCOPE_LABELS[scope] || 'کل شبکه';

  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox {...PAGE_INFO} />

      <ScopeSelector />

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>اتاق وضعیت محتوا</Typography>
          <Typography variant="body2" color="text.secondary">— {scopeLabel}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          دو سطح تحلیلی — منابع محتوایی منتخب و نمایندگان خوشه‌های منتخب
        </Typography>
      </Box>

      {/* ============================================================ */}
      {/* سطح ۱ — اتاق وضعیت منابع محتوایی منتخب                          */}
      {/* ============================================================ */}
      <SectionHeader
        icon="solar:document-text-bold-duotone"
        color="primary"
        title="سطح ۱ — وضعیت منابع محتوایی منتخب"
        description="گزارش دوره‌ای، هشدارهای استراتژیک و ترندهای موضوعی شبکه"
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Periodic Report */}
        <Grid size={{ xs: 12 }}>
          <PeriodicReport />
        </Grid>

        {/* Strategic Alerts (with create-operation capability) */}
        <Grid size={{ xs: 12 }}>
          <StrategicAlertsWidget />
        </Grid>

        {/* Topic Gravity (full width) */}
        <Grid size={{ xs: 12 }}>
          <TopicGravityChart data={topics} loading={topicLoading} />
        </Grid>
      </Grid>

      {/* ============================================================ */}
      {/* سطح ۲ — اتاق وضعیت نمایندگان خوشه‌های منتخب                     */}
      {/* ============================================================ */}
      <SectionHeader
        icon="solar:atom-bold-duotone"
        color="secondary"
        title="سطح ۲ — وضعیت نمایندگان خوشه‌های منتخب"
        description="رادار سکوت، سلامت روایت، پست‌های جریان‌ساز، نبرد روایت‌ها، سرعت واکنش و درخت بازنشر"
      />

      <Grid container spacing={3}>
        {/* Silence Radar (dynamic, scope-aware) */}
        <Grid size={{ xs: 12 }}>
          <SilenceRadar />
        </Grid>

        {/* Narrative Health + High Impact (Stream-Setters) */}
        <Grid size={{ xs: 12, md: 5 }}>
          <NarrativeHealthGauge />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <HighImpactFeed />
        </Grid>

        {/* Narrative Battle */}
        <Grid size={{ xs: 12, md: 7 }}>
          <NarrativeBattle />
        </Grid>

        {/* Reaction Velocity */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ReactionVelocityChart />
        </Grid>

        {/* Reshare Tree (full width) */}
        <Grid size={{ xs: 12 }}>
          <ReshareTreeChart data={reshares} loading={reshareLoading} />
        </Grid>

        {/* Collapsible: Supplementary modules (default closed) */}
        <Grid size={{ xs: 12 }}>
          <CollapsibleSection
            title="ماژول‌های تکمیلی"
            icon="solar:layers-bold-duotone"
            color="info"
            subtitle="KPI های ماکرو، ماتریس احساسات-نفوذ، شتاب واژگان، سیر احساسات شبکه و فعالیت شبانه‌روزی"
            badge="۵ ماژول"
          >
            <Stack spacing={3}>
              {/* Macro KPIs */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard title="پیج‌های در دامنه" value={totalPages} icon="solar:users-group-rounded-bold-duotone" color="primary" info={`مجموع پیج‌های ${scopeLabel}`} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard title="شاخص دوقطبی‌گری" value={`${polarityScore}%`} icon="solar:bolt-circle-bold-duotone" color={polarityScore > 50 ? 'error' : 'info'} info="میزان دوقطبی بودن فضای شبکه" />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard title="واژه کلیدی روز" value={topKeyword} icon="solar:hashtag-bold-duotone" color="warning" info="پرتکرارترین کلمه کلیدی" />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <StatCard title="نرخ بازنشر کل" value={totalReshares} icon="solar:share-bold-duotone" color="secondary" info="مجموع بازنشرهای ۳۰ روز اخیر" />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <SentimentInfluenceMatrix />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <KeywordVelocity />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SentimentOverviewChart />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <NetworkActivityChart />
                </Grid>
              </Grid>
            </Stack>
          </CollapsibleSection>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
