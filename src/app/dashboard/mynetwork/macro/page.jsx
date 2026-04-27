import { CONFIG } from 'src/global-config';

import { MacroView } from 'src/sections/macro/view';

export const metadata = { title: `نمای ماکرو - ${CONFIG.appName}` };

export default function Page() {
  return <MacroView />;
}
