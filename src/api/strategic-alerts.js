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
    refetchInterval: 30000, // refresh every 30 seconds
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

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.patch(endpoints.strategicAlerts.acknowledge(id));
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}
