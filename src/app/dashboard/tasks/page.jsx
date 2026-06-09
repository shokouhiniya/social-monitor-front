import { CONFIG } from 'src/global-config';

import { TasksListView } from 'src/sections/tasks/view';

// ----------------------------------------------------------------------

export const metadata = { title: `تسک‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <TasksListView />;
}
