import { CONFIG } from 'src/global-config';

import { TagsView } from 'src/sections/definitions/view/tags-view';

// ----------------------------------------------------------------------

export const metadata = { title: `برچسب‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <TagsView />;
}
