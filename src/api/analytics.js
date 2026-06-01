import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useScopeContext } from 'src/contexts/scope-context';

// ----------------------------------------------------------------------
// All analytics hooks include the active scope in their queryKey so that
// switching between «نمایندگان شبکه / خوشه / کل شبکه» does not return
// stale data from the previous scope. Axios automatically appends the
// scope/clusterId query params (see src/lib/axios.js).
//
// خروجی هر هوک با `unwrapEnvelope` پردازش می‌شود تا هم با envelope V2
// (`{ meta, data }`) و هم با پاسخ خام legacy سازگار بماند (Requirement 12.1).
// ----------------------------------------------------------------------

function useScopeKey() {
  const { scope, clusterId } = useScopeContext();
  return [scope || 'all', clusterId || 0];
}

export function useMacroDashboard() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'macro-dashboard', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.macroDashboard);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useAlignmentIndex() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'alignment-index', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.alignmentIndex);
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
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'network-pulse', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.networkPulse);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 60000,
  });
}

export function useNetworkPulseWeekly() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'network-pulse-weekly', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.networkPulseWeekly);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 300000, // 5 min
  });
}

export function useReactionVelocity(days = 7) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'reaction-velocity', days, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.reactionVelocity, { params: { days } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useGhostPages() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'ghost-pages', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.ghostPages);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useActivityIndex() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'activity-index', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.activityIndex);
      return unwrapEnvelope(res.data);
    },
  });
}

export function usePeriodicReport(hours = 6) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'periodic-report', hours, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.periodicReport, { params: { hours } });
      return unwrapEnvelope(res.data);
    },
    refetchInterval: false, // manual refresh only
  });
}

export function useLatestPosts(limit = 10) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'latest-posts', limit, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.latestPosts, { params: { limit } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useHighImpactPosts(limit = 5) {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'high-impact-posts', limit, ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.highImpactPosts, { params: { limit } });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useNarrativeHealth() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'narrative-health', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeHealth);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCrisisCorridor() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'crisis-corridor', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.crisisCorridor);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 60000,
  });
}

export function useAiSynthesizer() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'ai-synthesizer', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.aiSynthesizer);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 300000,
  });
}

export function useKeywordVelocity() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'keyword-velocity', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.keywordVelocity);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useSentimentInfluenceMatrix() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'sentiment-influence-matrix', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.sentimentInfluenceMatrix);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useNarrativeBattle() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'narrative-battle', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.narrativeBattle);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useActorsSceneReport() {
  const scopeKey = useScopeKey();
  return useQuery({
    queryKey: ['analytics', 'actors-scene-report', ...scopeKey],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.actorsSceneReport);
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
