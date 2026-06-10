import { CONFIG } from 'src/global-config';

import { ClusterDetailView } from 'src/sections/clusters/detail-view';

// ----------------------------------------------------------------------

export const metadata = { title: `جزئیات خوشه - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <ClusterDetailView clusterId={Number(params.id)} />;
}
