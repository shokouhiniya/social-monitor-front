import { useQuery } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function usePosts(params) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.list, { params });
      return res.data?.data;
    },
  });
}

export function useTrendingKeywords(days = 7) {
  return useQuery({
    queryKey: ['posts', 'trending-keywords', days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.trendingKeywords, { params: { days } });
      return res.data?.data;
    },
  });
}

export function useSentimentTimeline(pageId, days = 30) {
  return useQuery({
    queryKey: ['posts', 'sentiment-timeline', pageId, days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.sentimentTimeline, {
        params: { page_id: pageId, days },
      });
      return res.data?.data;
    },
  });
}

export function useTopicGravity(days = 7) {
  return useQuery({
    queryKey: ['posts', 'topic-gravity', days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.topicGravity, { params: { days } });
      return res.data?.data;
    },
  });
}

export function useReshareTree(days = 7) {
  return useQuery({
    queryKey: ['posts', 'reshare-tree', days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.reshareTree, { params: { days } });
      return res.data?.data;
    },
  });
}

export function usePostsFeed(params) {
  return useQuery({
    queryKey: ['posts', 'feed', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.feed, { params });
      return res.data?.data;
    },
  });
}

export function useTopicClusters() {
  return useQuery({
    queryKey: ['posts', 'topic-clusters'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.posts.topicClusters);
      return res.data?.data;
    },
  });
}
