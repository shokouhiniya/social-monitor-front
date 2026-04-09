import { CONFIG } from 'src/global-config';

import { AlertsView } from 'src/sections/alerts/view';

// ----------------------------------------------------------------------

export const metadata = { title: `هشدارهای استراتژیک - ${CONFIG.appName}` };

export default function Page() {
  return <AlertsView />;
}
