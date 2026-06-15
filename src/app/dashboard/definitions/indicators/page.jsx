import { CONFIG } from 'src/global-config';

import { IndicatorsPageView } from 'src/sections/media-score/view/indicators-page-view';

// ----------------------------------------------------------------------

export const metadata = { title: `شاخص‌های امتیاز - ${CONFIG.appName}` };

export default function Page() {
  return <IndicatorsPageView />;
}
