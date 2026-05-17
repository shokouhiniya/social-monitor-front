import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useAllActionPlans(filters) {
  return useQuery({
    queryKey: ['action-plans', 'all', filters],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.list, { params: filters });
      return res.data?.data;
    },
  });
}

export function useActionPlanStats() {
  return useQuery({
    queryKey: ['action-plans', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.stats);
      return res.data?.data;
    },
    refetchInterval: 30000,
  });
}

export function useActionPlans(pageId) {
  return useQuery({
    queryKey: ['action-plans', 'page', pageId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byPage(pageId));
      return res.data?.data;
    },
    enabled: !!pageId,
  });
}

export function useActionPlansByCluster(clusterId) {
  return useQuery({
    queryKey: ['action-plans', 'cluster', clusterId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byCluster(clusterId));
      return res.data?.data;
    },
    enabled: !!clusterId,
  });
}

export function useActionPlansByAlert(alertId) {
  return useQuery({
    queryKey: ['action-plans', 'alert', alertId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byAlert(alertId));
      return res.data?.data;
    },
    enabled: !!alertId,
  });
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.actionPlans.create, data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useCreateActionPlanFromAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.actionPlans.createFromAlert, data);
      return res.data?.data;
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
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useDeleteActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.actionPlans.detail(id));
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.interactions.create, data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
}
