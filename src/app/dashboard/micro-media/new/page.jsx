import { CONFIG } from 'src/global-config';

import { MicroMediaCreateView } from 'src/sections/micro-media/view';

// ----------------------------------------------------------------------

export const metadata = { title: `میکرورسانه جدید - ${CONFIG.appName}` };

export default function Page() {
  return <MicroMediaCreateView />;
}
