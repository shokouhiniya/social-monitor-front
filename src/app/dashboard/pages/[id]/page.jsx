import { CONFIG } from 'src/global-config';

import { PageProfileContent } from './content';

// ----------------------------------------------------------------------

export const metadata = { title: `پروفایل پیج - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <PageProfileContent id={params.id} />;
}
