import { CONFIG } from 'src/global-config';

import { MicroMediaListView } from 'src/sections/micro-media/view';

// ----------------------------------------------------------------------

export const metadata = { title: `میکرورسانه‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <MicroMediaListView />;
}
