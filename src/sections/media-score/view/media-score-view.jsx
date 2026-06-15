'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { ScoringTab } from './scoring-tab';
import { LeaderboardTab } from './leaderboard-tab';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'leaderboard', label: 'لیدربرد' },
  { value: 'scoring', label: 'ثبت امتیاز' },
];

export function MediaScoreView() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>امتیازات</Typography>

      <PageInfoBox
        title="امتیازات"
        icon="solar:star-shine-bold-duotone"
        color="warning"
        shortDescription="ارزیابی انسانیِ چندبعدیِ میکرورسانه‌ها. در «لیدربرد» رتبه‌بندی هر شاخص را ببینید، در «ثبت امتیاز» برای هر رسانه امتیاز دوره‌ای ثبت کنید."
        tips={[
          'امتیازها تاریخچه‌دار و دوره‌ای‌اند؛ روند تغییرات در پروفایل هر میکرورسانه دیده می‌شود.',
          'امتیاز کلی، میانگین وزنیِ شاخص‌های فعال است.',
          'مدیریت شاخص‌ها از بخش تعاریف › شاخص‌های امتیاز انجام می‌شود.',
        ]}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
      </Tabs>

      <Box>
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'scoring' && <ScoringTab />}
      </Box>
    </DashboardContent>
  );
}
