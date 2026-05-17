import { CONFIG } from 'src/global-config';

import { ClustersListView } from 'src/sections/clusters/list-view';

export const metadata = { title: `خوشه‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <ClustersListView />;
}
