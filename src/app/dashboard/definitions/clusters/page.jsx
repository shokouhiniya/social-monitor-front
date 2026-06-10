import { CONFIG } from 'src/global-config';

import { ClustersView } from 'src/sections/definitions/view';

// ----------------------------------------------------------------------

export const metadata = { title: `خوشه‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <ClustersView />;
}
