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
    macro: `${ROOTS.DASHBOARD}/macro`,
    pages: {
      root: `${ROOTS.DASHBOARD}/pages`,
      profile: (id) => `${ROOTS.DASHBOARD}/pages/${id}`,
    },
    fieldReports: `${ROOTS.DASHBOARD}/field-reports`,
    posts: `${ROOTS.DASHBOARD}/posts`,
    alerts: `${ROOTS.DASHBOARD}/alerts`,
    settings: `${ROOTS.DASHBOARD}/settings`,
  },
};
