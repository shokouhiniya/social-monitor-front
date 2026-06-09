import { CONFIG } from 'src/global-config';

import { InteractionsView } from 'src/sections/interactions/view';

// ----------------------------------------------------------------------

export const metadata = { title: `تعاملات - ${CONFIG.appName}` };

export default function Page() {
  return <InteractionsView />;
}
