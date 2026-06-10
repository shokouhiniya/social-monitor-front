import { CONFIG } from 'src/global-config';

import { MicroMediaAnalysisDetailView } from 'src/sections/analysis';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل میکرورسانه - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <MicroMediaAnalysisDetailView id={params.id} />;
}
