import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { extractItems, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های خوشه‌ها. لیست‌ها با `extractItems` به آرایه نرمال می‌شوند (سازگار با
// legacy و V2 — Requirement 12.5/12.7)؛ جزئیات و mutation ها با `unwrapEnvelope`
// پردازش می‌شوند (Requirement 12.1).
// ----------------------------------------------------------------------

export function useClusters() {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.clusters.list);
      return extractItems(res.data);
    },
  });
}

export function useCluster(id) {
  return useQuery({
    queryKey: ['clusters', id],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(endpoints.clusters.detail(id));
        return unwrapEnvelope(res.data);
      } catch (err) {
        // Silent 404 — cluster might have been deleted
        if (err?.code === 'NOT_FOUND' || err?.message?.includes('not found') || err?.message?.includes('404')) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!id,
    retry: false,
  });
}

export function useClusterPages(id) {
  return useQuery({
    queryKey: ['clusters', id, 'pages'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.clusters.pages(id));
      return extractItems(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.clusters.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clusters'] }),
  });
}

export function useUpdateCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(endpoints.clusters.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusters', variables.id] });
    },
  });
}

export function useDeleteCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.clusters.delete(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useAssignPagesToCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pageIds }) => {
      const res = await axiosInstance.post(endpoints.clusters.assignPages(id), {
        page_ids: pageIds,
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusters', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useRemovePagesFromCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pageIds }) => {
      const res = await axiosInstance.delete(endpoints.clusters.removePages(id), {
        data: { page_ids: pageIds },
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusters', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useSetClusterRepresentatives() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pageIds }) => {
      const res = await axiosInstance.put(endpoints.clusters.setRepresentatives(id), {
        page_ids: pageIds,
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusters', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useTogglePageRepresentative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clusterId, pageId, isRepresentative }) => {
      const res = await axiosInstance.patch(
        endpoints.clusters.togglePageRepresentative(clusterId, pageId),
        { is_representative: !!isRepresentative }
      );
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusters', variables.clusterId] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
