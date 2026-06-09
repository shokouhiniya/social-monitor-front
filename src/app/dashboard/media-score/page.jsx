import { CONFIG } from 'src/global-config';

import { MediaScoreView } from 'src/sections/media-score/view';

// ----------------------------------------------------------------------

export const metadata = { title: `امتیازدهی رسانه - ${CONFIG.appName}` };

export default function Page() {
  return <MediaScoreView />;
}
