import { CONFIG } from 'src/global-config';

import { PlatformsPageView } from 'src/sections/analysis';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل سکوها - ${CONFIG.appName}` };

export default function Page() {
  return <PlatformsPageView />;
}
