import { useQuery } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useMacroDashboard() {
  return useQuery({
    queryKey: ['analytics', 'macro-dashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.macroDashboard);
      return res.data?.data;
    },
  });
}

export function useAlignmentIndex() {
  return useQuery({
    queryKey: ['analytics', 'alignment-index'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.alignmentIndex);
      return res.data?.data;
    },
  });
}

export function useProfileDeepDive(pageId) {
  return useQuery({
    queryKey: ['analytics', 'profile', pageId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.profileDeepDive(pageId));
      return res.data?.data;
    },
    enabled: !!pageId,
  });
}

export function useNetworkPulse() {
  return useQuery({
    queryKey: ['analytics', 'network-pulse'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.networkPulse);
      return res.data?.data;
    },
    refetchInterval: 60000, // refresh every minute
  });
}

export function useReactionVelocity(days = 7) {
  return useQuery({
    queryKey: ['analytics', 'reaction-velocity', days],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.reactionVelocity, { params: { days } });
      return res.data?.data;
    },
  });
}

export function useGhostPages() {
  return useQuery({
    queryKey: ['analytics', 'ghost-pages'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.ghostPages);
      return res.data?.data;
    },
  });
}

export function usePeriodicReport() {
  return useQuery({
    queryKey: ['analytics', 'periodic-report'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.periodicReport);
      return res.data?.data;
    },
    refetchInterval: 6 * 60 * 60 * 1000, // refresh every 6 hours
  });
}

export function useLatestPosts(limit = 10) {
  return useQuery({
    queryKey: ['analytics', 'latest-posts', limit],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.latestPosts, { params: { limit } });
      return res.data?.data;
    },
  });
}
