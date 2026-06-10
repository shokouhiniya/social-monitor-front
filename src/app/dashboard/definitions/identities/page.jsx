import { CONFIG } from 'src/global-config';

import { IdentitiesView } from 'src/sections/definitions/view';

// ----------------------------------------------------------------------

export const metadata = { title: `هویت‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <IdentitiesView />;
}
