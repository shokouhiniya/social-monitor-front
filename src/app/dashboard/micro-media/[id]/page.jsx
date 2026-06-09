import { CONFIG } from 'src/global-config';

import { MicroMediaDetailView } from 'src/sections/micro-media/view';

// ----------------------------------------------------------------------

export const metadata = { title: `جزئیات میکرورسانه - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <MicroMediaDetailView id={params.id} />;
}
