import { CONFIG } from 'src/global-config';

import { PostsListView } from 'src/sections/posts/view';

// ----------------------------------------------------------------------

export const metadata = { title: `پایش محتوا - ${CONFIG.appName}` };

export default function Page() {
  return <PostsListView fixedTitle="همه محتوا" />;
}
