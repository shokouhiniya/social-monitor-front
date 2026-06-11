import { CONFIG } from 'src/global-config';

import { MonitorMicroMediaListView } from 'src/sections/monitor/monitor-micro-media-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `پایش محتوا - میکرورسانه‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <MonitorMicroMediaListView />;
}
