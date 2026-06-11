import { CONFIG } from 'src/global-config';

import { MonitorMicroMediaContentView } from 'src/sections/monitor/monitor-micro-media-content-view';

// ----------------------------------------------------------------------

export const metadata = { title: `محتوای میکرورسانه - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <MonitorMicroMediaContentView id={Number(params.id)} />;
}
