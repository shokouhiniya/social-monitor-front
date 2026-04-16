import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useStrategicAlerts() {
  return useQuery({
    queryKey: ['strategic-alerts'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.strategicAlerts.list);
      return res.data?.data;
    },
    refetchInterval: 30000,
  });
}

export function useAlertStats() {
  return useQuery({
    queryKey: ['strategic-alerts', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.strategicAlerts.stats);
      return res.data?.data;
    },
    refetchInterval: 30000,
  });
}

export function useGroupedAlerts() {
  return useQuery({
    queryKey: ['strategic-alerts', 'grouped'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.strategicAlerts.grouped);
      return res.data?.data;
    },
    refetchInterval: 30000,
  });
}

export function useCreateStrategicAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.strategicAlerts.create, data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assigned_to }) => {
      const res = await axiosInstance.patch(endpoints.strategicAlerts.updateStatus(id), { status, assigned_to });
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}
