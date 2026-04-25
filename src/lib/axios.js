import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
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
    create: '/pages',
    bulk: '/pages/bulk',
    fetch: (id) => `/pages/${id}/fetch`,
    process: (id) => `/pages/${id}/process`,
    export: (id) => `/pages/${id}/export`,
    update: (id) => `/pages/${id}`,
    delete: (id) => `/pages/${id}`,
    categories: '/pages/analytics/categories',
    clusters: '/pages/analytics/clusters',
    countries: '/pages/analytics/countries',
    topInfluencers: '/pages/analytics/top-influencers',
  },
  posts: {
    list: '/posts',
    feed: '/posts/feed',
    topicClusters: '/posts/topic-clusters',
    detail: (id) => `/posts/${id}`,
    context: (id) => `/posts/${id}/context`,
    create: '/posts',
    bulk: '/posts/bulk',
    trendingKeywords: '/posts/analytics/trending-keywords',
    sentimentTimeline: '/posts/analytics/sentiment-timeline',
    topicGravity: '/posts/analytics/topic-gravity',
    reshareTree: '/posts/analytics/reshare-tree',
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
    profileDeepDive: (pageId) => `/analytics/profile/${pageId}`,
    reactionVelocity: '/analytics/reaction-velocity',
    networkPulse: '/analytics/network-pulse',
    ghostPages: '/analytics/ghost-pages',
    periodicReport: '/analytics/periodic-report',
    latestPosts: '/analytics/latest-posts',
    highImpactPosts: '/analytics/high-impact-posts',
    narrativeHealth: '/analytics/narrative-health',
    crisisCorridor: '/analytics/crisis-corridor',
    aiSynthesizer: '/analytics/ai-synthesizer',
    keywordVelocity: '/analytics/keyword-velocity',
    sentimentInfluenceMatrix: '/analytics/sentiment-influence-matrix',
    narrativeBattle: '/analytics/narrative-battle',
    generateAlerts: '/analytics/generate-alerts',
    generateReport: '/analytics/generate-report',
    refresh: '/analytics/refresh',
    refreshStatus: '/analytics/refresh-status',
  },
  actionPlans: {
    byPage: (pageId) => `/action-plans/page/${pageId}`,
    detail: (id) => `/action-plans/${id}`,
    create: '/action-plans',
    update: (id) => `/action-plans/${id}`,
  },
  interactions: {
    byPage: (pageId) => `/interactions/page/${pageId}`,
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
};
