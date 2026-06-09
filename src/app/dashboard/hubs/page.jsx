import { CONFIG } from 'src/global-config';

import { HubsListView } from 'src/sections/hubs/view';

// ----------------------------------------------------------------------

export const metadata = { title: `هاب‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <HubsListView />;
}
