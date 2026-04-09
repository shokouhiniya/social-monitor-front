import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  analytics: icon('ic-analytics'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  blog: icon('ic-blog'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'پایش',
    items: [
      {
        title: 'داشبورد کلان',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      {
        title: 'نمای ماکرو',
        path: paths.dashboard.macro,
        icon: ICONS.analytics,
      },
    ],
  },
  {
    subheader: 'مدیریت',
    items: [
      {
        title: 'پیج‌ها',
        path: paths.dashboard.pages.root,
        icon: ICONS.user,
      },
      {
        title: 'پست‌ها',
        path: paths.dashboard.posts,
        icon: ICONS.blog,
      },
      {
        title: 'گزارش‌های میدانی',
        path: paths.dashboard.fieldReports,
        icon: ICONS.file,
      },
    ],
  },
];
