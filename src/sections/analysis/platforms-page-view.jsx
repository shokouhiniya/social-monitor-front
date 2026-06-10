'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { usePlatformOptions } from 'src/api/definitions';
import { DashboardContent } from 'src/layouts/dashboard';
import { StaticScopeProvider } from 'src/contexts/scope-context';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { ContentAnalysisView } from './content-analysis-view';

// ----------------------------------------------------------------------

export function PlatformsPageView() {
  const { data: platforms, isLoading } = usePlatformOptions();
  const [platform, setPlatform] = useState(null);

  const list = platforms ?? [];
  const active = platform ?? list[0]?.key ?? null;

  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox
        title="تحلیل به تفکیک سکو"
        icon="solar:smartphone-bold-duotone"
        color="success"
        shortDescription="همان تحلیل محتوا، ولی جداگانه برای هر سکو (اینستاگرام، تلگرام، توئیتر، بله، ایتا، …). با انتخاب هر تب، محتوای همان سکو در کل شبکه تحلیل می‌شود."
        tips={[
          'فهرست سکوها از بخش «تعاریف › سکو» مدیریت می‌شود.',
          'سکوهایی که هنوز محتوایی ندارند، خالی نمایش داده می‌شوند.',
        ]}
      />

      {isLoading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : list.length === 0 ? (
        <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
          <Typography>هیچ سکویی تعریف نشده است. ابتدا از «تعاریف › سکو» سکو اضافه کنید.</Typography>
        </Box>
      ) : (
        <>
          <Tabs value={active} onChange={(_, v) => setPlatform(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
            {list.map((p) => (
              <Tab key={p.key} value={p.key} label={p.label} />
            ))}
          </Tabs>

          <StaticScopeProvider key={active} scope={`platform:${active}`}>
            <ContentAnalysisView emptyHint="برای این سکو هنوز محتوایی ثبت/جمع‌آوری نشده است." />
          </StaticScopeProvider>
        </>
      )}
    </DashboardContent>
  );
}
