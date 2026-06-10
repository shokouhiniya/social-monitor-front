import { CONFIG } from 'src/global-config';
import { StaticScopeProvider } from 'src/contexts/scope-context';

import { DashboardView } from 'src/sections/dashboard/view';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل شبکه - ${CONFIG.appName}` };

export default function Page() {
  return (
    <StaticScopeProvider scope="all_micromedia">
      <DashboardView title="تحلیل شبکه — همهٔ میکرورسانه‌ها" hideScopeControls />
    </StaticScopeProvider>
  );
}
