// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    // micromedia-transformation — تجربهٔ اصلی: مدیریت میکرورسانه (تصمیم ۷)
    microMedia: {
      root: `${ROOTS.DASHBOARD}/micro-media`,
      new: `${ROOTS.DASHBOARD}/micro-media/new`,
      detail: (id) => `${ROOTS.DASHBOARD}/micro-media/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/micro-media/${id}/edit`,
    },
    hubs: {
      root: `${ROOTS.DASHBOARD}/hubs`,
      detail: (id) => `${ROOTS.DASHBOARD}/hubs/${id}`,
    },
    tasks: {
      root: `${ROOTS.DASHBOARD}/tasks`,
      detail: (id) => `${ROOTS.DASHBOARD}/tasks/${id}`,
    },
    operations: {
      root: `${ROOTS.DASHBOARD}/operations`,
      new: `${ROOTS.DASHBOARD}/operations/new`,
      detail: (id) => `${ROOTS.DASHBOARD}/operations/${id}`,
    },
    interactions: `${ROOTS.DASHBOARD}/interactions`,
    mediaScore: `${ROOTS.DASHBOARD}/media-score`,
    users: `${ROOTS.DASHBOARD}/users`,
    overview: `${ROOTS.DASHBOARD}/overview`,
    // My Network (was instagram)
    mynetwork: {
      root: `${ROOTS.DASHBOARD}/mynetwork`,
      macro: `${ROOTS.DASHBOARD}/mynetwork/macro`,
      pages: {
        root: `${ROOTS.DASHBOARD}/mynetwork/pages`,
        profile: (id) => `${ROOTS.DASHBOARD}/mynetwork/pages/${id}`,
      },
      clusters: {
        root: `${ROOTS.DASHBOARD}/mynetwork/clusters`,
        detail: (id) => `${ROOTS.DASHBOARD}/mynetwork/clusters/${id}`,
      },
      posts: `${ROOTS.DASHBOARD}/mynetwork/posts`,
      alerts: `${ROOTS.DASHBOARD}/mynetwork/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/mynetwork/field-reports`,
      settings: `${ROOTS.DASHBOARD}/mynetwork/settings`,
      refresh: `${ROOTS.DASHBOARD}/mynetwork/refresh`,
      guide: `${ROOTS.DASHBOARD}/mynetwork/guide`,
    },
    // Keep instagram as alias for backward compatibility
    instagram: {
      root: `${ROOTS.DASHBOARD}/mynetwork`,
      macro: `${ROOTS.DASHBOARD}/mynetwork/macro`,
      pages: {
        root: `${ROOTS.DASHBOARD}/mynetwork/pages`,
        profile: (id) => `${ROOTS.DASHBOARD}/mynetwork/pages/${id}`,
      },
      clusters: {
        root: `${ROOTS.DASHBOARD}/mynetwork/clusters`,
        detail: (id) => `${ROOTS.DASHBOARD}/mynetwork/clusters/${id}`,
      },
      posts: `${ROOTS.DASHBOARD}/mynetwork/posts`,
      alerts: `${ROOTS.DASHBOARD}/mynetwork/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/mynetwork/field-reports`,
      settings: `${ROOTS.DASHBOARD}/mynetwork/settings`,
      refresh: `${ROOTS.DASHBOARD}/mynetwork/refresh`,
      guide: `${ROOTS.DASHBOARD}/mynetwork/guide`,
    },
    // Telegram
    telegram: {
      root: `${ROOTS.DASHBOARD}/telegram`,
      macro: `${ROOTS.DASHBOARD}/telegram/macro`,
      channels: `${ROOTS.DASHBOARD}/telegram/channels`,
      channel: (id) => `${ROOTS.DASHBOARD}/telegram/channels/${id}`,
      posts: `${ROOTS.DASHBOARD}/telegram/posts`,
      alerts: `${ROOTS.DASHBOARD}/telegram/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/telegram/field-reports`,
      settings: `${ROOTS.DASHBOARD}/telegram/settings`,
    },
  },
};
