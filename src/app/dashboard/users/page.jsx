import { CONFIG } from 'src/global-config';

import { UsersListView } from 'src/sections/users/view';

// ----------------------------------------------------------------------

export const metadata = { title: `کاربران - ${CONFIG.appName}` };

export default function Page() {
  return <UsersListView />;
}
