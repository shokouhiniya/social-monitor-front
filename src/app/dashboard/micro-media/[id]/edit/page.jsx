import { CONFIG } from 'src/global-config';

import { MicroMediaCreateView } from 'src/sections/micro-media/view';

// ----------------------------------------------------------------------

export const metadata = { title: `ویرایش میکرورسانه - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <MicroMediaCreateView id={params.id} />;
}
