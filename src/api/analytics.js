import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useScopeContext } from 'src/contexts/scope-context';

// ----------------------------------------------------------------------
// همهٔ هوک‌های آنالیتیکس scope فعال را هم در queryKey (برای کش) و هم به‌صورت
// صریح در params درخواست می‌فرستند تا scope به‌صورت قطعی از React context جریان
// یابد (نه از طریق localStorage سراسری). این کار اجازه می‌دهد صفحات «تحلیل» با
// `StaticScopeProvider` یک scope ثابت (مثل all_micromedia / platform:instagram /
// micromedia:42) را روی همان ماژول‌های موجود اعمال کنند.
//
// scope='all' → پارامتر `__noScope` فرستاده می‌شود تا interceptor مقدار
// localStorage را تزریق نکند و کل شبکه پوشش داده شود.
// ----------------------------------------------------------------------

function useScoped() {
  const { scope, clusterId } = useScopeContext();
  const s = scope || 'all';
  let params;
  if (s === 'cluster' && clusterId) {
    params = { scope: 'cluster', clusterId };
  } else if (s && s !== 'all') {
    params = { scope: s };
  } else {
    params = { __noScope: true };
  }
  return { key: [s, clusterId || 0], params };
}

export function useMacroDashboard() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'macro-dashboard', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.macroDashboard, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useAlignmentIndex() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'alignment-index', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.alignmentIndex, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useProfileDeepDive(pageId, timeRange = '1w') {
  return useQuery({
    queryKey: ['analytics', 'profile', pageId, timeRange],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.profileDeepDive(pageId), {
        params: { timeRange },
      });
      return unwrapEnvelope(res.data);
    },
    enabled: !!pageId,
  });
}

export function useNetworkPulse() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'network-pulse', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.networkPulse, { params });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 60000,
  });
}

export function useNetworkPulseWeekly() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'network-pulse-weekly', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.networkPulseWeekly, { params });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 300000, // 5 min
  });
}

export function useReactionVelocity(days = 7) {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'reaction-velocity', days, ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.reactionVelocity, {
        params: { ...params, days },
      });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useGhostPages() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'ghost-pages', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.ghostPages, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useActivityIndex() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'activity-index', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.activityIndex, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function usePeriodicReport(hours = 6) {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'periodic-report', hours, ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.periodicReport, {
        params: { ...params, hours },
      });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: false, // manual refresh only
  });
}

export function useLatestPosts(limit = 10) {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'latest-posts', limit, ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.latestPosts, {
        params: { ...params, limit },
      });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useHighImpactPosts(limit = 5) {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'high-impact-posts', limit, ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.highImpactPosts, {
        params: { ...params, limit },
      });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useNarrativeHealth() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'narrative-health', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeHealth, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCrisisCorridor() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'crisis-corridor', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.crisisCorridor, { params });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 60000,
  });
}

export function useAiSynthesizer() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'ai-synthesizer', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.aiSynthesizer, { params });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 300000,
  });
}

export function useKeywordVelocity() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'keyword-velocity', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.keywordVelocity, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useSentimentInfluenceMatrix() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'sentiment-influence-matrix', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.sentimentInfluenceMatrix, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useNarrativeBattle() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'narrative-battle', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeBattle, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useActorsSceneReport() {
  const { key, params } = useScoped();
  return useQuery({
    queryKey: ['analytics', 'actors-scene-report', ...key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.actorsSceneReport, { params });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: false, // manual refresh only
  });
}

export function useGenerateAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(endpoints.analytics.generateAlerts);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hours = 6) => {
      const res = await axiosInstance.post(endpoints.analytics.generateReport, { hours });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  });
}

export function useRefreshStatus() {
  return useQuery({
    queryKey: ['analytics', 'refresh-status'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.refreshStatus);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 60000,
  });
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(endpoints.analytics.refresh);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] });
    },
  });
}
