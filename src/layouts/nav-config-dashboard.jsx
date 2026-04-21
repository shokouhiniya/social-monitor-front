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
  lock: icon('ic-lock'),
  params: icon('ic-params'),
};

// ----------------------------------------------------------------------

// Instagram nav items
export const instagramNavData = [
  {
    subheader: 'پایش',
    items: [
      { title: 'داشبورد کلان', path: paths.dashboard.instagram.root, icon: ICONS.dashboard },
      { title: 'نمای ماکرو', path: paths.dashboard.instagram.macro, icon: ICONS.analytics },
      { title: 'هشدارهای استراتژیک', path: paths.dashboard.instagram.alerts, icon: ICONS.lock },
    ],
  },
  {
    subheader: 'مدیریت',
    items: [
      { title: 'پیج‌ها', path: paths.dashboard.instagram.pages.root, icon: ICONS.user },
      { title: 'پست‌ها', path: paths.dashboard.instagram.posts, icon: ICONS.blog },
      { title: 'گزارش‌های میدانی', path: paths.dashboard.instagram.fieldReports, icon: ICONS.file },
    ],
  },
  {
    subheader: 'سیستم',
    items: [
      { title: 'تنظیمات', path: paths.dashboard.instagram.settings, icon: ICONS.params },
    ],
  },
];

// Telegram nav items
export const telegramNavData = [
  {
    subheader: 'پایش',
    items: [
      { title: 'داشبورد کلان', path: paths.dashboard.telegram.root, icon: ICONS.dashboard },
      { title: 'نمای ماکرو', path: paths.dashboard.telegram.macro, icon: ICONS.analytics },
      { title: 'هشدارهای استراتژیک', path: paths.dashboard.telegram.alerts, icon: ICONS.lock },
    ],
  },
  {
    subheader: 'مدیریت',
    items: [
      { title: 'کانال‌ها', path: paths.dashboard.telegram.channels, icon: ICONS.user },
      { title: 'پست‌ها', path: paths.dashboard.telegram.posts, icon: ICONS.blog },
      { title: 'گزارش‌های میدانی', path: paths.dashboard.telegram.fieldReports, icon: ICONS.file },
    ],
  },
  {
    subheader: 'سیستم',
    items: [
      { title: 'تنظیمات', path: paths.dashboard.telegram.settings, icon: ICONS.params },
    ],
  },
];

// Default export (used as fallback)
export const navData = instagramNavData;

// Get nav data by network
export function getNavDataByNetwork(network) {
  switch (network) {
    case 'telegram':
      return telegramNavData;
    case 'instagram':
    default:
      return instagramNavData;
  }
}
