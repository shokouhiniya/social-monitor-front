import { CONFIG } from 'src/global-config';

import { ManagementOverviewView } from 'src/sections/management/view';

// ----------------------------------------------------------------------

export const metadata = { title: `داشبورد کلان - ${CONFIG.appName}` };

export default function Page() {
  return <ManagementOverviewView />;
}
