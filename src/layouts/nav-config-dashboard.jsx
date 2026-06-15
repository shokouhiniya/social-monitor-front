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
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  job: icon('ic-job'),
  label: icon('ic-label'),
};

// ----------------------------------------------------------------------
// V2 — ناوبری مفهومی «اتاق عملیات» (design §8.2، Requirements 14.1 / 14.5)
//
// قوانین:
// - چهار بخش مفهومی: «اتاق عملیات»، «مدیریت شبکه»، «هوش مصنوعی»، «سیستم».
// - هیچ لینک مرده‌ای وجود ندارد: هر آیتمِ فعال به یک route واقعی موجود اشاره می‌کند.
// - قابلیت‌های آماده‌نشده حذف نمی‌شوند بلکه با حالت disabled و برچسب «به‌زودی»
//   نمایش داده می‌شوند (هیچ دکمهٔ بی‌عملکرد/no-op نداریم).
// ----------------------------------------------------------------------

const COMING_SOON = 'به‌زودی';

// آیتم «به‌زودی»: غیرفعال و بدون مقصد قابل‌ناوبری (pointer-events در استایل disabled خاموش است)
const comingSoon = (title, navIcon) => ({
  title,
  path: '#',
  icon: navIcon,
  disabled: true,
  caption: COMING_SOON,
});

// آیتمی که هنوز مقصدش توسط کارفرما تعریف نشده (در انتظار تعریف).
const pending = (title, navIcon) => ({
  title,
  path: '#',
  icon: navIcon,
  disabled: true,
  caption: 'در حال تعریف',
});

/**
 * ساخت ساختار ناوبری چهاربخشی برای یک شبکه.
 * @param {object} net پیکربندی شبکه شامل مسیرهای واقعی و عنوان منابع/قابلیت‌ها.
 */
function buildOperationsNavData(net) {
  const { routes, sourcesTitle } = net;

  return [
    {
      subheader: 'اتاق عملیات',
      items: [
        { title: 'وضعیت کنشگران', path: routes.root, icon: ICONS.dashboard },
        { title: 'وضعیت محتوا', path: routes.macro, icon: ICONS.analytics },
        { title: 'هشدارها و فرصت‌ها', path: routes.alerts, icon: ICONS.lock },
        { title: 'گزارش‌های میدانی', path: routes.fieldReports, icon: ICONS.file },
        comingSoon('نمای کلی شبکه', ICONS.dashboard),
        comingSoon('برنامه‌های عملیاتی', ICONS.kanban),
      ],
    },
    {
      subheader: 'مدیریت شبکه',
      items: [
        { title: sourcesTitle, path: routes.sources, icon: ICONS.user },
        routes.clusters
          ? { title: 'خوشه‌ها', path: routes.clusters, icon: ICONS.folder }
          : comingSoon('خوشه‌ها', ICONS.folder),
        comingSoon('نمایندگان', ICONS.user),
        { title: 'محتوای جمع‌آوری‌شده', path: routes.posts, icon: ICONS.blog },
      ],
    },
    {
      subheader: 'هوش مصنوعی',
      items: [
        comingSoon('تحلیل‌ها', ICONS.analytics),
        comingSoon('پرامپت‌ها', ICONS.label),
        comingSoon('اجرای آزمایشی', ICONS.kanban),
        comingSoon('تاریخچهٔ خطاها', ICONS.lock),
      ],
    },
    {
      subheader: 'سیستم',
      items: [
        routes.refresh
          ? { title: 'مرکز بروزرسانی', path: routes.refresh, icon: ICONS.job }
          : comingSoon('مرکز بروزرسانی', ICONS.job),
        { title: 'تنظیمات', path: routes.settings, icon: ICONS.params },
        { title: 'راهنمای سامانه', path: paths.dashboard.mynetwork.guide, icon: ICONS.file },
        comingSoon('سلامت سیستم', ICONS.dashboard),
      ],
    },
  ];
}

// ----------------------------------------------------------------------

const mn = paths.dashboard.mynetwork;
const tg = paths.dashboard.telegram;

// Instagram/MyNetwork nav items — ساختار اتاق عملیات
export const instagramNavData = buildOperationsNavData({
  sourcesTitle: 'منابع (پیج‌ها)',
  routes: {
    root: mn.root,
    macro: mn.macro,
    alerts: mn.alerts,
    fieldReports: mn.fieldReports,
    sources: mn.pages.root,
    clusters: mn.clusters.root,
    posts: mn.posts,
    refresh: mn.refresh,
    settings: mn.settings,
  },
});

// Telegram nav items — ساختار اتاق عملیات
export const telegramNavData = buildOperationsNavData({
  sourcesTitle: 'منابع (کانال‌ها)',
  routes: {
    root: tg.root,
    macro: tg.macro,
    alerts: tg.alerts,
    fieldReports: tg.fieldReports,
    sources: tg.channels,
    clusters: null, // route خوشه‌ها برای تلگرام هنوز موجود نیست → «به‌زودی»
    posts: tg.posts,
    refresh: null, // مرکز بروزرسانی تلگرام هنوز موجود نیست → «به‌زودی»
    settings: tg.settings,
  },
});

// ساختار مرجع اتاق عملیات (شبکهٔ پیش‌فرض = mynetwork)
export const operationsRoomNavData = instagramNavData;

// Default export (used as fallback)
export const navData = instagramNavData;

// ----------------------------------------------------------------------
// micromedia-transformation (تصمیم ۷) — ناوبری تجربهٔ اصلی: مدیریت میکرورسانه.
// فضاهای پلتفرمی (mynetwork/instagram/telegram) حذف و قابلیت‌های قدیمی به
// زیربخش «پایش محتوا» منتقل شده‌اند.
// ----------------------------------------------------------------------
export const managementNavData = [
  {
    subheader: 'مدیریت',
    items: [
      {
        title: 'داشبورد کلان',
        path: paths.dashboard.overview,
        icon: ICONS.dashboard,
        allowedRoles: ['super_admin', 'admin', 'operations_manager'],
      },
      { title: 'میکرورسانه‌ها', path: paths.dashboard.microMedia.root, icon: ICONS.user },
      { title: 'تعاملات', path: paths.dashboard.interactions, icon: ICONS.blog },
      { title: 'امتیازات', path: paths.dashboard.mediaScore, icon: ICONS.analytics },
    ],
  },
  {
    subheader: 'عملیات',
    items: [
      { title: 'عملیات‌ها', path: paths.dashboard.operations.root, icon: ICONS.kanban },
      { title: 'تسک‌ها', path: paths.dashboard.tasks.root, icon: ICONS.label },
    ],
  },
  {
    subheader: 'تحلیل',
    items: [
      {
        title: 'شبکه',
        path: paths.dashboard.analysis.network,
        icon: ICONS.dashboard,
        caption: 'وضعیت کنشگران — برخی ماژول‌ها نیاز به AI دارند',
      },
      { title: 'میکرورسانه‌ها', path: paths.dashboard.analysis.microMedia.root, icon: ICONS.user },
      {
        title: 'محتوا',
        path: paths.dashboard.analysis.content,
        icon: ICONS.analytics,
        caption: 'برخی ماژول‌ها نیاز به AI دارند',
      },
      {
        title: 'سکو',
        path: paths.dashboard.analysis.platforms,
        icon: ICONS.folder,
        caption: 'برخی ماژول‌ها نیاز به AI دارند',
      },
    ],
  },
  {
    subheader: 'پایش محتوا',
    items: [
      {
        title: 'میکرورسانه‌ها',
        path: paths.dashboard.monitor.microMedia.root,
        icon: ICONS.user,
        caption: 'محتوای هر میکرورسانه به تفکیک',
      },
      {
        title: 'همه محتوا',
        path: paths.dashboard.monitor.content,
        icon: ICONS.blog,
        caption: 'کل محتوای کراول‌شده با فیلتر پیشرفته',
      },
    ],
  },
  {
    subheader: 'سیستم',
    items: [
      { title: 'مرکز بروزرسانی', path: paths.dashboard.mynetwork.refresh, icon: ICONS.job },
      {
        title: 'کاربران و دسترسی',
        path: paths.dashboard.users,
        icon: ICONS.user,
        allowedRoles: ['super_admin', 'admin', 'operations_manager'],
      },
      { title: 'تنظیمات', path: paths.dashboard.mynetwork.settings, icon: ICONS.params },
      {
        title: 'تعاریف',
        path: '#',
        icon: ICONS.label,
        allowedRoles: ['super_admin', 'admin', 'operations_manager'],
        children: [
          { title: 'خوشه', path: paths.dashboard.definitions.clusters, icon: ICONS.folder },
          { title: 'هویت', path: paths.dashboard.definitions.identities, icon: ICONS.user },
          { title: 'سکو', path: paths.dashboard.definitions.platforms, icon: ICONS.folder },
          { title: 'هاب', path: paths.dashboard.hubs.root, icon: ICONS.folder },
          { title: 'شاخص‌های امتیاز', path: `${paths.dashboard.root}/definitions/indicators`, icon: ICONS.analytics },
          { title: 'برچسب‌ها', path: paths.dashboard.definitions.tags, icon: ICONS.label },
        ],
      },
    ],
  },
  {
    subheader: 'راهنما',
    items: [
      { title: 'راهنمای سامانه', path: paths.dashboard.mynetwork.guide, icon: ICONS.file },
    ],
  },
];

// Get nav data by network
export function getNavDataByNetwork(network) {
  switch (network) {
    case 'telegram':
      return telegramNavData;
    case 'instagram':
      return instagramNavData;
    case 'management':
    default:
      return managementNavData;
  }
}
