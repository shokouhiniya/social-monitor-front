import { CONFIG } from 'src/global-config';

import { PagesListView } from 'src/sections/pages/view';

export const metadata = { title: `پیج‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <PagesListView />;
}
