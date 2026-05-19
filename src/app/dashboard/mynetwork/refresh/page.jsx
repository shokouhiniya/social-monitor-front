import { CONFIG } from 'src/global-config';

import { RefreshView } from 'src/sections/refresh/view';

export const metadata = { title: `بروزرسانی - ${CONFIG.appName}` };

export default function Page() {
  return <RefreshView />;
}
