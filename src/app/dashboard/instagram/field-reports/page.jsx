import { CONFIG } from 'src/global-config';

import { FieldReportsView } from 'src/sections/field-reports/view';

export const metadata = { title: `گزارش‌های میدانی - ${CONFIG.appName}` };

export default function Page() {
  return <FieldReportsView />;
}
