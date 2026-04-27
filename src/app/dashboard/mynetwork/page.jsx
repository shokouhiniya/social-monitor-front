import { CONFIG } from 'src/global-config';

import { DashboardView } from 'src/sections/dashboard/view';

export const metadata = { title: `داشبورد شبکه من - ${CONFIG.appName}` };

export default function Page() {
  return <DashboardView />;
}
