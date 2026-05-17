'use client';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useCluster, useClusters } from 'src/api/clusters';
import { useScopeContext } from 'src/contexts/scope-context';
import { useActivityIndex, useMacroDashboard, useAlignmentIndex, useNarrativeHealth } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { StatCard } from './components/stat-card';
import { RefreshBar } from './components/refresh-bar';
import { PulseStrip } from './components/pulse-strip';
import { GeoWorldMap } from './components/geo-world-map';
import { PageInfoBox } from './components/page-info-box';
import { ScopeSelector } from './components/scope-selector';
import { AiSynthesizer } from './components/ai-synthesizer';
import { PeriodicReport } from './components/periodic-report';
import { CrisisCorridor } from './components/crisis-corridor';
import { HighImpactFeed } from './components/high-impact-feed';
import { ActorsSceneReport } from './components/actors-scene-report';
import { CollapsibleSection } from './components/collapsible-section';
import { TopInfluencersRank } from './components/top-influencers-rank';
import { IdentityRadialChart } from './components/identity-radial-chart';
import { ProfileDistributions } from './components/profile-distributions';
import { NarrativeHealthGauge } from './components/narrative-health-gauge';
import { StrategicAlertsWidget } from './components/strategic-alerts-widget';

// ----------------------------------------------------------------------

const SCOPE_LABELS = {
  representatives: 'نمایندگان شبکه',
  cluster: 'خوشه',
  all: 'کل شبکه',
};

const PAGE_INFO = {
  title: 'اتاق وضعیت کنشگران',
  icon: 'solar:users-group-rounded-bold-duotone',
  color: 'primary',
  shortDescription: 'نمایان‌گر توصیف تحلیلی از شبکه‌ی صفحات کنشگران شناسایی‌شده — مانیتورینگ ترکیب پروفایل‌ها، گزارش وضعیت صحنه و رتبه‌بندی نفوذ',
  modules: [
    {
      name: 'گزارش وضعیت صحنه',
      icon: 'solar:document-medicine-bold-duotone',
      color: 'primary',
      description: 'متن روایی ۳۰۰ تا ۴۰۰ کلمه‌ای از وضعیت کلی شبکه کنشگران — ترکیب صحنه، جغرافیا، چهره‌های شاخص و ارزیابی هم‌گرایی',
    },
    {
      name: 'توزیع پروفایل کنشگران',
      icon: 'solar:chart-square-bold-duotone',
      color: 'secondary',
      description: 'نمودار میله‌ای قابل سوییچ بین ۵ بُعد: دسته موضوعی، خوشه‌ها، جغرافیا، زبان و دین/مذهب',
    },
    {
      name: '۴ شاخص کلیدی',
      icon: 'solar:square-academic-cap-bold-duotone',
      color: 'info',
      description: 'پیج‌های تحت پایش، شاخص هم‌گرایی، شاخص هم‌راستایی هفته، شاخص فعالیت',
    },
    {
      name: 'رتبه‌بندی نفوذ',
      icon: 'solar:crown-bold-duotone',
      color: 'warning',
      description: 'لیست پیج‌های پرنفوذ شبکه با امتیاز نفوذ — برای شناسایی رهبران فکری و کنشگران شاخص',
    },
    {
      name: 'فیلتر پروفایلی',
      icon: 'solar:filter-bold-duotone',
      color: 'success',
      description: 'با ScopeSelector می‌توانید بر اساس نمایندگان، خوشه یا کل شبکه فیلتر کنید',
    },
    {
      name: 'پنل پایانی (collapse-بسته)',
      icon: 'solar:layers-bold-duotone',
      color: 'default',
      description: 'ماژول‌های ثانوی (نمودار هویت، نقشه جغرافیایی، گزارش دوره‌ای، خلاصه AI، Pulse Strip، …) به‌صورت پیش‌فرض بسته‌اند تا صفحه شلوغ نشود',
    },
  ],
  tips: [
    'برای دسترسی به ماژول‌های ثانوی، به انتهای صفحه بروید و کارت «ماژول‌های تکمیلی» را باز کنید',
    'گزارش وضعیت صحنه با هوش مصنوعی هر بار تولید می‌شود — برای صرفه‌جویی، خروجی فعلی کش می‌شود',
    'نمودار توزیع پروفایل بر اساس همان دامنه (Scope) تنظیم می‌شود',
  ],
};

function ScopeBanner() {
  const router = useRouter();
  const { scope, clusterId, setScope } = useScopeContext();
  const { data: clusters } = useClusters();
  const { data: activeCluster } = useCluster(scope === 'cluster' ? clusterId : null);

  // Auto-recover from stale clusterId (deleted cluster left in localStorage)
  if (scope === 'cluster' && clusterId && clusters && clusters.length > 0) {
    const exists = clusters.some((c) => c.id === Number(clusterId));
    if (!exists) {
      return (
        <Alert
          severity="warning"
          icon={<Iconify icon="solar:refresh-bold-duotone" />}
          action={
            <Button size="small" color="warning" variant="contained" onClick={() => setScope('representatives')}>
              بازگشت به نمایندگان
            </Button>
          }
          sx={{ mb: 2 }}
        >
          خوشه انتخاب‌شده دیگر موجود نیست. به نمایندگان شبکه برگردید یا خوشه دیگری انتخاب کنید.
        </Alert>
      );
    }
  }

  if (scope === 'representatives') {
    const reps = (clusters || []).reduce((s, c) => s + (c.representatives_count || 0), 0);
    if (reps === 0) {
      return (
        <Alert
          severity="warning"
          icon={<Iconify icon="solar:star-bold-duotone" />}
          action={
            <Button size="small" color="warning" variant="contained"
              onClick={() => router.push(paths.dashboard.mynetwork.clusters.root)}
            >
              مدیریت خوشه‌ها
            </Button>
          }
          sx={{ mb: 2 }}
        >
          هیچ پیجی به‌عنوان «نماینده» انتخاب نشده. ابتدا در صفحه خوشه‌ها چند پیج را به‌عنوان نماینده مشخص کنید.
        </Alert>
      );
    }
    return null;
  }

  if (scope === 'cluster') {
    if (!clusterId) {
      return <Alert severity="info" sx={{ mb: 2 }}>خوشه‌ای انتخاب نشده. از سلکتور بالا یک خوشه انتخاب کنید.</Alert>;
    }
    if (activeCluster && (activeCluster.pages_count ?? activeCluster.pages?.length ?? 0) === 0) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          خوشه «{activeCluster.name}» هنوز پیجی ندارد. ابتدا پیج‌ها را به این خوشه اضافه کنید.
        </Alert>
      );
    }
  }

  return null;
}

export function DashboardView() {
  const { scope } = useScopeContext();
  const { data: macro, isLoading: macroLoading } = useMacroDashboard();
  const { data: alignment } = useAlignmentIndex();
  const { data: narrativeHealth } = useNarrativeHealth();
  const { data: activityIdx } = useActivityIndex();

  const totalPages = macro?.identity_distribution?.reduce((s, i) => s + Number(i.count), 0) || 0;
  const scopeLabel = scope === 'cluster' ? 'خوشه‌ای' : SCOPE_LABELS[scope] || 'کل شبکه';

  return (
    <DashboardContent maxWidth="xl">
      {/* Page Info Box */}
      <PageInfoBox {...PAGE_INFO} />

      {/* Scope Selector */}
      <ScopeSelector />
      <ScopeBanner />

      {/* Header */}
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>اتاق وضعیت کنشگران</Typography>
        <Typography variant="body2" color="text.secondary">— {scopeLabel}</Typography>
      </Stack>

      {/* Refresh Bar */}
      <RefreshBar />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* KPI Cards (4) */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="پیج‌های تحت پایش"
            value={totalPages}
            icon="solar:users-group-rounded-bold-duotone"
            color="primary"
            info={`تعداد پیج‌های ${scopeLabel}`}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="شاخص هم‌گرایی"
            value={`${alignment?.alignment_index ?? 0}%`}
            icon="solar:graph-new-bold-duotone"
            color={alignment?.alignment_index > 50 ? 'success' : 'warning'}
            info="میزان هم‌صدایی شبکه"
            subtitle={alignment?.description}
          />
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
              (activityIdx?.post_change ?? 0) > 10 || (activityIdx?.engagement_change ?? 0) > 10
                ? 'success'
                : (activityIdx?.post_change ?? 0) < -10 || (activityIdx?.engagement_change ?? 0) < -10
                ? 'error'
                : 'warning'
            }
            info="مقایسه حجم پست و تعامل ۷ روز اخیر با میانگین تاریخی"
            subtitle={`${activityIdx?.recent_posts ?? 0} پست • ${(activityIdx?.recent_engagement ?? 0).toLocaleString()} تعامل`}
          />
        </Grid>

        {/* Actors Scene Report (300-400 word AI narrative) */}
        <Grid size={{ xs: 12 }}>
          <ActorsSceneReport />
        </Grid>

        {/* Profile Distributions (category, cluster, country, language, religion) */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <ProfileDistributions data={macro} loading={macroLoading} />
        </Grid>

        {/* Top Influencers Ranking */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <TopInfluencersRank data={macro?.top_influencers} loading={macroLoading} />
        </Grid>

        {/* Collapsible: Secondary modules (default closed) */}
        <Grid size={{ xs: 12 }}>
          <CollapsibleSection
            title="ماژول‌های تکمیلی"
            icon="solar:layers-bold-duotone"
            color="info"
            subtitle="خلاصه AI، گزارش دوره‌ای، Pulse Strip، نمودار هویتی، نقشه جغرافیایی، سلامت روایت، پست‌های پرتاثیر، Crisis Corridor، هشدارها"
            badge="۹ ماژول"
          >
            <Stack spacing={3}>
              <AiSynthesizer />
              <PeriodicReport />
              <PulseStrip />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <IdentityRadialChart data={macro?.identity_distribution} loading={macroLoading} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <GeoWorldMap data={macro?.geo_distribution} loading={macroLoading} />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <StrategicAlertsWidget />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CrisisCorridor />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <NarrativeHealthGauge />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <HighImpactFeed />
                </Grid>
              </Grid>
            </Stack>
          </CollapsibleSection>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
