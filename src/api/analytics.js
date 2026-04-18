import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export function useHighImpactPosts(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'high-impact-posts', limit],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.highImpactPosts, { params: { limit } });
      return res.data?.data;
    },
  });
}

export function useNarrativeHealth() {
  return useQuery({
    queryKey: ['analytics', 'narrative-health'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeHealth);
      return res.data?.data;
    },
  });
}

export function useCrisisCorridor() {
  return useQuery({
    queryKey: ['analytics', 'crisis-corridor'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.crisisCorridor);
      return res.data?.data;
    },
    refetchInterval: 60000,
  });
}

export function useAiSynthesizer() {
  return useQuery({
    queryKey: ['analytics', 'ai-synthesizer'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.aiSynthesizer);
      return res.data?.data;
    },
    refetchInterval: 300000,
  });
}

export function useKeywordVelocity() {
  return useQuery({
    queryKey: ['analytics', 'keyword-velocity'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.keywordVelocity);
      return res.data?.data;
    },
  });
}

export function useSentimentInfluenceMatrix() {
  return useQuery({
    queryKey: ['analytics', 'sentiment-influence-matrix'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.sentimentInfluenceMatrix);
      return res.data?.data;
    },
  });
}

export function useNarrativeBattle() {
  return useQuery({
    queryKey: ['analytics', 'narrative-battle'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeBattle);
      return res.data?.data;
    },
  });
}

export function useGenerateAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(endpoints.analytics.generateAlerts);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(endpoints.analytics.generateReport);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  });
}

export function useRefreshStatus() {
  return useQuery({
    queryKey: ['analytics', 'refresh-status'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.refreshStatus);
      return res.data?.data;
    },
    refetchInterval: 60000,
  });
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(endpoints.analytics.refresh);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] });
    },
  });
}
