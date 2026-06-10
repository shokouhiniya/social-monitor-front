import { CONFIG } from 'src/global-config';

import { ContentPageView } from 'src/sections/analysis';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل محتوا - ${CONFIG.appName}` };

export default function Page() {
  return <ContentPageView />;
}
