import { CONFIG } from 'src/global-config';

import { MicroMediaAnalysisListView } from 'src/sections/analysis';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل میکرورسانه‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <MicroMediaAnalysisListView />;
}
