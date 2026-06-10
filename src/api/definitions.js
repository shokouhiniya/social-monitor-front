import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// تعاریف مرجع: هویت/سکو (جدول definitions) و خوشه (جدول clusters).
// ----------------------------------------------------------------------

export function useDefinitions(type) {
  return useQuery({
    queryKey: ['definitions', type],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.definitions.list, {
        params: { type, includeInactive: 'true' },
      });
      return unwrapEnvelope(res.data);
    },
    enabled: !!type,
  });
}

/**
 * سکوهای فعال (type=platform) برای استفاده در فرم افزودن سکو و تب‌های تحلیل.
 * فقط فعال‌ها و دارای key (برای تطبیق با pages.platform).
 */
export function usePlatformOptions() {
  return useQuery({
    queryKey: ['definitions', 'platform', 'options'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.definitions.list, {
        params: { type: 'platform' },
      });
      const list = unwrapEnvelope(res.data) ?? [];
      return list
        .filter((d) => d.is_active !== false)
        .map((d) => ({
          key: d.key || String(d.id),
          label: d.title,
          icon: d.icon || null,
        }));
    },
  });
}

export function useCreateDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.definitions.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['definitions'] }),
  });
}

export function useUpdateDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.definitions.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['definitions'] }),
  });
}

export function useDeleteDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const res = await axiosInstance.delete(endpoints.definitions.remove(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['definitions'] }),
  });
}

// --- خوشه‌ها (جدول موجود clusters) ---

export function useClusters() {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.clusters.list);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCreateCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.clusters.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clusters'] }),
  });
}

export function useUpdateCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(endpoints.clusters.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clusters'] }),
  });
}

export function useDeleteCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const res = await axiosInstance.delete(endpoints.clusters.delete(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clusters'] }),
  });
}
