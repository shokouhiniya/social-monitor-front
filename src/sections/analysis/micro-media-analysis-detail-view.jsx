'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { usePlatformOptions } from 'src/api/definitions';
import { StaticScopeProvider } from 'src/contexts/scope-context';
import { useMicroMedia, useMicroMediaAccounts } from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { ContentAnalysisView } from './content-analysis-view';

// ----------------------------------------------------------------------

export function MicroMediaAnalysisDetailView({ id }) {
  const router = useRouter();
  const { data: media, isLoading } = useMicroMedia(id);
  const { data: accounts } = useMicroMediaAccounts(id);
  const { data: platformOptions } = usePlatformOptions();
  const [tab, setTab] = useState('all');

  const labelOf = (k) => (platformOptions ?? []).find((p) => p.key === k)?.label || k;

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }
  if (!media) {
    return (
      <DashboardContent>
        <Typography>میکرورسانه یافت نشد</Typography>
      </DashboardContent>
    );
  }

  // سکوهای یکتا بر اساس platform.
  const platforms = [
    ...new Set((accounts ?? []).map((a) => a.platform).filter(Boolean)),
  ];

  const scope = tab === 'all' ? `micromedia:${id}` : `micromedia:${id}:platform:${tab}`;

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">تحلیل: {media.name}</Typography>
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          onClick={() => router.push(paths.dashboard.analysis.microMedia.root)}
        >
          بازگشت به فهرست
        </Button>
      </Stack>

      <PageInfoBox
        title={`داشبورد تحلیلی «${media.name}»`}
        icon="solar:user-id-bold-duotone"
        color="primary"
        shortDescription="تحلیل محتوای این میکرورسانه. تب «کل» همهٔ سکوها را با هم و هر تب سکو، محتوای همان سکو را تحلیل می‌کند."
        tips={['اگر سکویی محتوای جمع‌آوری‌شده نداشته باشد، آن تب خالی نمایش داده می‌شود.']}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab value="all" label="کل سکوها" />
        {platforms.map((p) => (
          <Tab key={p} value={p} label={labelOf(p)} />
        ))}
      </Tabs>

      <StaticScopeProvider key={scope} scope={scope}>
        <ContentAnalysisView emptyHint="برای این محدوده هنوز محتوایی جمع‌آوری نشده است." />
      </StaticScopeProvider>
    </DashboardContent>
  );
}
