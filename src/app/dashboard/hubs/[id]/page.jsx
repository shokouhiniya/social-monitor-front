import { CONFIG } from 'src/global-config';

import { HubDetailView } from 'src/sections/hubs/view';

// ----------------------------------------------------------------------

export const metadata = { title: `جزئیات هاب - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <HubDetailView id={params.id} />;
}
