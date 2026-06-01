import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { extractItems, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های برنامه‌های عملیاتی. لیست‌ها با `extractItems` به آرایه نرمال می‌شوند
// (سازگار با هر دو شکل legacy و V2 صفحه‌بندی‌شده — Requirement 12.5/12.7) و
// سایر پاسخ‌ها با `unwrapEnvelope` پردازش می‌شوند (Requirement 12.1).
// ----------------------------------------------------------------------

export function useAllActionPlans(filters) {
  return useQuery({
    queryKey: ['action-plans', 'all', filters],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.list, { params: filters });
      return extractItems(res.data);
    },
  });
}

export function useActionPlanStats() {
  return useQuery({
    queryKey: ['action-plans', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.stats);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 30000,
  });
}

export function useActionPlans(pageId) {
  return useQuery({
    queryKey: ['action-plans', 'page', pageId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byPage(pageId));
      return extractItems(res.data);
    },
    enabled: !!pageId,
  });
}

export function useActionPlansByCluster(clusterId) {
  return useQuery({
    queryKey: ['action-plans', 'cluster', clusterId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byCluster(clusterId));
      return extractItems(res.data);
    },
    enabled: !!clusterId,
  });
}

export function useActionPlansByAlert(alertId) {
  return useQuery({
    queryKey: ['action-plans', 'alert', alertId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byAlert(alertId));
      return extractItems(res.data);
    },
    enabled: !!alertId,
  });
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.actionPlans.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useCreateActionPlanFromAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.actionPlans.createFromAlert, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] });
    },
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.actionPlans.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useDeleteActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.actionPlans.detail(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.interactions.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}
