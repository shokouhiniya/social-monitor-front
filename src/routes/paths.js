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
    // Instagram
    instagram: {
      root: `${ROOTS.DASHBOARD}/instagram`,
      macro: `${ROOTS.DASHBOARD}/instagram/macro`,
      pages: {
        root: `${ROOTS.DASHBOARD}/instagram/pages`,
        profile: (id) => `${ROOTS.DASHBOARD}/instagram/pages/${id}`,
      },
      posts: `${ROOTS.DASHBOARD}/instagram/posts`,
      alerts: `${ROOTS.DASHBOARD}/instagram/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/instagram/field-reports`,
      settings: `${ROOTS.DASHBOARD}/instagram/settings`,
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
