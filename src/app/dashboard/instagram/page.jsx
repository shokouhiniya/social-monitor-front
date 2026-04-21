import { CONFIG } from 'src/global-config';

import { DashboardView } from 'src/sections/dashboard/view';

// ----------------------------------------------------------------------

export const metadata = { title: `داشبورد اینستاگرام - ${CONFIG.appName}` };

export default function Page() {
  return <DashboardView />;
}
