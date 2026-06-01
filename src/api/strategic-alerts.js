import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { extractItems, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های هشدارهای راهبردی. لیست‌ها با `extractItems` به آرایه نرمال می‌شوند تا
// چه پاسخ آرایه‌ای legacy باشد و چه `{ items, total }` صفحه‌بندی‌شدهٔ V2، callerها
// همیشه یک آرایه دریافت کنند (Requirement 12.5/12.7). سایر پاسخ‌ها با
// `unwrapEnvelope` پردازش می‌شوند (Requirement 12.1).
// ----------------------------------------------------------------------

export function useStrategicAlerts() {
  return useQuery({
    queryKey: ['strategic-alerts'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.strategicAlerts.list);
      return extractItems(res.data);
    },
    refetchInterval: 30000,
  });
}

export function useAlertStats() {
  return useQuery({
    queryKey: ['strategic-alerts', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.strategicAlerts.stats);
      return unwrapEnvelope(res.data);
    },
    refetchInterval: 30000,
  });
}

export function useGroupedAlerts(status) {
  return useQuery({
    queryKey: ['strategic-alerts', 'grouped', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const res = await axiosInstance.get(endpoints.strategicAlerts.grouped, { params });
      return extractItems(res.data);
    },
    refetchInterval: 30000,
  });
}

export function useCreateStrategicAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.strategicAlerts.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, assigned_to }) => {
      const res = await axiosInstance.patch(endpoints.strategicAlerts.updateStatus(id), { status, assigned_to });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategic-alerts'] }),
  });
}
