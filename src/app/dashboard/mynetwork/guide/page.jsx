import { CONFIG } from 'src/global-config';

import { GuideView } from 'src/sections/guide/view';

export const metadata = { title: `راهنمای سامانه - ${CONFIG.appName}` };

export default function Page() {
  return <GuideView />;
}
