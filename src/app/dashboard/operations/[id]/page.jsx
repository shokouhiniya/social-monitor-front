import { CONFIG } from 'src/global-config';

import { OperationDetailView } from 'src/sections/operations/view';

// ----------------------------------------------------------------------

export const metadata = { title: `جزئیات عملیات - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <OperationDetailView id={params.id} />;
}
