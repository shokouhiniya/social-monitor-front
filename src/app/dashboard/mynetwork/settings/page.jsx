import { CONFIG } from 'src/global-config';

import { SettingsView } from 'src/sections/settings/view';

export const metadata = { title: `تنظیمات - ${CONFIG.appName}` };

export default function Page() {
  return <SettingsView />;
}
