import { useQuery } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { useScopeContext } from 'src/contexts/scope-context';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های محتوا (content feed). پردازش envelope/pagination از طریق helperهای
// مشترک task 9.2 (Requirement 12.5/12.7). فید با `normalizePage` نرمال می‌شود تا
// هم `items` (V2) و هم `data` (legacy) را داشته باشد.
// ----------------------------------------------------------------------

function useScopeKey() {
  const { scope, clusterId } = useScopeContext();
  return [scope || 'all', clusterId || 0];
}

export function usePosts(params) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useTrendingKeywords(days = 7) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['posts', 'trending-keywords', days, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.trendingKeywords, { params: { days } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useSentimentTimeline(pageId, days = 30) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['posts', 'sentiment-timeline', pageId, days, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.sentimentTimeline, {
        params: { page_id: pageId, days },
      });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useTopicGravity(days = 7) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['posts', 'topic-gravity', days, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.topicGravity, { params: { days } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useReshareTree(days = 7) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['posts', 'reshare-tree', days, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.reshareTree, { params: { days } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function usePostsFeed(params) {
  return useQuery({
    queryKey: ['posts', 'feed', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.feed, { params });
      return normalizePage(res.data);
    },
  });
}

export function useTopicClusters() {
  return useQuery({
    queryKey: ['posts', 'topic-clusters'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.topicClusters);
      return unwrapEnvelope(res.data);
    },
  });
}

export function usePulseByPage(days = 7) {
  return useQuery({
    queryKey: ['posts', 'pulse-by-page', days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.pulseByPage, { params: { days } });
      return unwrapEnvelope(res.data);
    },
  });
}
