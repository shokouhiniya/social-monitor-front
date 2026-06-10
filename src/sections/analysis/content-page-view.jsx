'use client';

import { DashboardContent } from 'src/layouts/dashboard';
import { StaticScopeProvider } from 'src/contexts/scope-context';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { ContentAnalysisView } from './content-analysis-view';

// ----------------------------------------------------------------------

export function ContentPageView() {
  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox
        title="تحلیل محتوا — کل شبکه"
        icon="solar:documents-bold-duotone"
        color="secondary"
        shortDescription="تحلیل کل محتوای شبکه به‌صورت یکجا و مستقل از میکرورسانه و سکو — کلمات کلیدی، ثقل موضوعی، روند فعالیت، سلامت روایت و پست‌های پرتاثیر."
        tips={[
          'این داشبورد همهٔ محتوای جمع‌آوری‌شدهٔ همهٔ سکوها را با هم تحلیل می‌کند.',
          'برای تفکیک به ازای هر سکو، به صفحهٔ «سکو» در منوی تحلیل بروید.',
        ]}
      />
      <StaticScopeProvider scope="all">
        <ContentAnalysisView />
      </StaticScopeProvider>
    </DashboardContent>
  );
}
