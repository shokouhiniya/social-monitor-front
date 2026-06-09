import { CONFIG } from 'src/global-config';

import { OperationsListView } from 'src/sections/operations/view';

// ----------------------------------------------------------------------

export const metadata = { title: `عملیات‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <OperationsListView />;
}
