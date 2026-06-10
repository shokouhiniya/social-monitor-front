import { CONFIG } from 'src/global-config';

import { PlatformsView } from 'src/sections/definitions/view';

// ----------------------------------------------------------------------

export const metadata = { title: `سکوها - ${CONFIG.appName}` };

export default function Page() {
  return <PlatformsView />;
}
