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
    // My Network (was instagram)
    mynetwork: {
      root: `${ROOTS.DASHBOARD}/mynetwork`,
      macro: `${ROOTS.DASHBOARD}/mynetwork/macro`,
      pages: {
        root: `${ROOTS.DASHBOARD}/mynetwork/pages`,
        profile: (id) => `${ROOTS.DASHBOARD}/mynetwork/pages/${id}`,
      },
      posts: `${ROOTS.DASHBOARD}/mynetwork/posts`,
      alerts: `${ROOTS.DASHBOARD}/mynetwork/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/mynetwork/field-reports`,
      settings: `${ROOTS.DASHBOARD}/mynetwork/settings`,
    },
    // Keep instagram as alias for backward compatibility
    instagram: {
      root: `${ROOTS.DASHBOARD}/mynetwork`,
      macro: `${ROOTS.DASHBOARD}/mynetwork/macro`,
      pages: {
        root: `${ROOTS.DASHBOARD}/mynetwork/pages`,
        profile: (id) => `${ROOTS.DASHBOARD}/mynetwork/pages/${id}`,
      },
      posts: `${ROOTS.DASHBOARD}/mynetwork/posts`,
      alerts: `${ROOTS.DASHBOARD}/mynetwork/alerts`,
      fieldReports: `${ROOTS.DASHBOARD}/mynetwork/field-reports`,
      settings: `${ROOTS.DASHBOARD}/mynetwork/settings`,
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
