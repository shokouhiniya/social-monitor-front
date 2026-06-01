import axios from 'axios';

import { CONFIG } from 'src/global-config';

import { extractApiError } from './envelope';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Scope auto-injection ----
// Reads `dashboard_scope` from localStorage (set by ScopeProvider) and
// auto-appends scope/clusterId query params to /analytics and /posts/analytics
// requests so dashboards reflect the selected scope without each hook
// having to wire it manually.
const SCOPE_PATH_MATCHERS = [/^\/?analytics(\/|$)/, /^\/?posts\/analytics(\/|$)/];

function readScopeParams() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('dashboard_scope');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.scope || parsed.scope === 'all') return null;
    if (parsed.scope === 'cluster') {
      if (!parsed.clusterId) return null;
      return { scope: 'cluster', clusterId: parsed.clusterId };
    }
    return { scope: parsed.scope };
  } catch {
    return null;
  }
}

axiosInstance.interceptors.request.use((config) => {
  // Only inject for matching analytics endpoints
  const url = config.url || '';
  const matched = SCOPE_PATH_MATCHERS.some((re) => re.test(url));
  if (!matched) return config;

  // Skip if the caller has explicitly opted out
  if (config.params?.__noScope) {
    delete config.params.__noScope;
    return config;
  }

  const scopeParams = readScopeParams();
  if (!scopeParams) return config;

  config.params = { ...scopeParams, ...(config.params || {}) };
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const body = error?.response?.data;

    // استخراج خطای نرمال‌شده از envelope V2 (با fallback به legacy / HTTP status).
    const apiError = extractApiError(error);

    // پیام Error را برای حفظ سازگاری عقب‌رو نگه می‌داریم:
    // ترتیب اولویت → پیام envelope خطای V2، سپس پیام legacy (`data.message`)،
    // سپس پیام axios. callerهای فعلی که `err.message` را می‌خوانند همچنان کار می‌کنند.
    const serverMessage =
      body?.error?.message || body?.message || error?.message || 'Something went wrong!';

    // Don't log 404 — many queries are conditional and 404 is expected behavior
    if (status !== 404) {
      console.error('Axios error:', apiError.code, serverMessage);
    }

    // Error غنی‌شده: پیام خام سرور حفظ می‌شود ولی فیلدهای V2 الصاق می‌شوند تا
    // لایهٔ UI بتواند پیام فارسی مبتنی بر `code` و قابلیت retry را استفاده کند.
    const enriched = new Error(serverMessage);
    enriched.code = apiError.code;
    enriched.status = apiError.status;
    enriched.details = apiError.details;
    enriched.retryable = apiError.retryable;
    enriched.uiMessage = apiError.message; // پیام فارسی کاربرپسند
    enriched.apiError = apiError;
    return Promise.reject(enriched);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];
    const res = await axiosInstance.get(url, config);
    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/auth/me',
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  pages: {
    list: '/pages',
    detail: (id) => `/pages/${id}`,
    related: (id) => `/pages/${id}/related`,
    progress: (id) => `/pages/${id}/progress`,
    batchStatus: '/pages/batch-status',
    batchRefresh: '/pages/batch-refresh',
    batchRefreshStatus: '/pages/batch-refresh/status',
    batchRefreshCancel: '/pages/batch-refresh/cancel',
    create: '/pages',
    bulk: '/pages/bulk',
    fetch: (id) => `/pages/${id}/fetch`,
    process: (id) => `/pages/${id}/process`,
    narrative: (id) => `/pages/${id}/narrative`,
    export: (id) => `/pages/${id}/export`,
    update: (id) => `/pages/${id}`,
    delete: (id) => `/pages/${id}`,
    categories: '/pages/analytics/categories',
    clusters: '/pages/analytics/clusters',
    countries: '/pages/analytics/countries',
    topInfluencers: '/pages/analytics/top-influencers',
    blindSpots: '/pages/analytics/blind-spots',
  },
  posts: {
    list: '/posts',
    feed: '/posts/feed',
    topicClusters: '/posts/topic-clusters',
    detail: (id) => `/posts/${id}`,
    context: (id) => `/posts/${id}/context`,
    process: (id) => `/posts/${id}/process`,
    create: '/posts',
    bulk: '/posts/bulk',
    trendingKeywords: '/posts/analytics/trending-keywords',
    sentimentTimeline: '/posts/analytics/sentiment-timeline',
    topicGravity: '/posts/analytics/topic-gravity',
    reshareTree: '/posts/analytics/reshare-tree',
    pulseByPage: '/posts/pulse-by-page',
  },
  fieldReports: {
    list: '/field-reports',
    stats: '/field-reports/stats',
    detail: (id) => `/field-reports/${id}`,
    create: '/field-reports',
    updateStatus: (id) => `/field-reports/${id}/status`,
  },
  analytics: {
    macroDashboard: '/analytics/macro-dashboard',
    alignmentIndex: '/analytics/alignment-index',
    silenceRadar: '/analytics/silence-radar',
    pageSilenceRadar: (pageId) => `/analytics/silence-radar/page/${pageId}`,
    profileDeepDive: (pageId) => `/analytics/profile/${pageId}`,
    reactionVelocity: '/analytics/reaction-velocity',
    networkPulse: '/analytics/network-pulse',
    networkPulseWeekly: '/analytics/network-pulse-weekly',
    ghostPages: '/analytics/ghost-pages',
    activityIndex: '/analytics/activity-index',
    periodicReport: '/analytics/periodic-report',
    latestPosts: '/analytics/latest-posts',
    highImpactPosts: '/analytics/high-impact-posts',
    narrativeHealth: '/analytics/narrative-health',
    crisisCorridor: '/analytics/crisis-corridor',
    aiSynthesizer: '/analytics/ai-synthesizer',
    keywordVelocity: '/analytics/keyword-velocity',
    sentimentInfluenceMatrix: '/analytics/sentiment-influence-matrix',
    narrativeBattle: '/analytics/narrative-battle',
    actorsSceneReport: '/analytics/actors-scene-report',
    generateAlerts: '/analytics/generate-alerts',
    generateReport: '/analytics/generate-report',
    refresh: '/analytics/refresh',
    refreshStatus: '/analytics/refresh-status',
  },
  actionPlans: {
    list: '/action-plans',
    stats: '/action-plans/stats',
    byPage: (pageId) => `/action-plans/page/${pageId}`,
    byCluster: (clusterId) => `/action-plans/cluster/${clusterId}`,
    byAlert: (alertId) => `/action-plans/alert/${alertId}`,
    detail: (id) => `/action-plans/${id}`,
    create: '/action-plans',
    createFromAlert: '/action-plans/from-alert',
    update: (id) => `/action-plans/${id}`,
  },
  interactions: {
    byPage: (pageId) => `/interactions/page/${pageId}`,
    byActionPlan: (actionPlanId) => `/interactions/action-plan/${actionPlanId}`,
    create: '/interactions',
  },
  settings: {
    list: '/settings',
    byCategory: (cat) => `/settings/category/${cat}`,
    update: '/settings',
  },
  strategicAlerts: {
    list: '/strategic-alerts',
    stats: '/strategic-alerts/stats',
    grouped: '/strategic-alerts/grouped',
    create: '/strategic-alerts',
    updateStatus: (id) => `/strategic-alerts/${id}/status`,
    detail: (id) => `/strategic-alerts/${id}`,
  },
  clusters: {
    list: '/clusters',
    detail: (id) => `/clusters/${id}`,
    pages: (id) => `/clusters/${id}/pages`,
    create: '/clusters',
    update: (id) => `/clusters/${id}`,
    delete: (id) => `/clusters/${id}`,
    assignPages: (id) => `/clusters/${id}/pages`,
    removePages: (id) => `/clusters/${id}/pages`,
    setRepresentatives: (id) => `/clusters/${id}/representatives`,
    togglePageRepresentative: (id, pageId) => `/clusters/${id}/pages/${pageId}/representative`,
  },
  // --------------------------------------------------------------------
  // V2 endpoints (design §7.2). مسیرهای legacy بالا در دورهٔ گذار حفظ می‌شوند؛
  // این‌ها مسیرهای ماژولار جدید هستند که envelope/pagination استاندارد می‌دهند.
  // --------------------------------------------------------------------
  sources: {
    list: '/sources',
    detail: (id) => `/sources/${id}`,
    analysisHistory: (id) => `/sources/${id}/analysis-history`,
    create: '/sources',
    bulk: '/sources/bulk',
    update: (id) => `/sources/${id}`,
    delete: (id) => `/sources/${id}`,
    representative: (id) => `/sources/${id}/representative`,
    cluster: (id) => `/sources/${id}/cluster`,
    status: (id) => `/sources/${id}/status`,
    fetch: (id) => `/sources/${id}/fetch`,
    analyze: (id) => `/sources/${id}/analyze`,
    insight: (id) => `/sources/${id}/insight`,
  },
  content: {
    list: '/content',
    feed: '/content/feed',
    highImpact: '/content/high-impact',
    detail: (id) => `/content/${id}`,
    context: (id) => `/content/${id}/context`,
  },
  operations: {
    alerts: {
      list: '/operations/alerts',
      detail: (id) => `/operations/alerts/${id}`,
      create: '/operations/alerts',
      transition: (id) => `/operations/alerts/${id}/transition`,
    },
    actionPlans: {
      list: '/operations/action-plans',
      detail: (id) => `/operations/action-plans/${id}`,
      create: '/operations/action-plans',
      transition: (id) => `/operations/action-plans/${id}/transition`,
    },
  },
  jobs: {
    refresh: '/jobs/refresh',
    list: '/jobs',
    detail: (id) => `/jobs/${id}`,
    cancel: (id) => `/jobs/${id}/cancel`,
    retryFailed: (id) => `/jobs/${id}/retry-failed`,
  },
  prompts: {
    list: '/prompts',
    detail: (key) => `/prompts/${key}`,
    executions: (key) => `/prompts/${key}/executions`,
    createVersion: (key) => `/prompts/${key}/versions`,
    activateVersion: (key, versionId) => `/prompts/${key}/versions/${versionId}/activate`,
    test: (key) => `/prompts/${key}/test`,
    setActive: (key) => `/prompts/${key}/active`,
  },
};
