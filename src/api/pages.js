import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// همهٔ هوک‌ها از طریق helperهای envelope (task 9.2) پاسخ را پردازش می‌کنند تا هم با
// envelope استاندارد V2 (`{ meta, data }`) و هم با پاسخ خام legacy سازگار بمانند
// (Requirement 12.5/12.7). فهرست‌ها با `normalizePage` به شکلی نرمال می‌شوند که
// هم `items`/`pageSize` (V2) و هم `data`/`limit` (legacy) را داشته باشد.
// ----------------------------------------------------------------------

export function usePages(params) {
  return useQuery({
    queryKey: ['pages', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function usePage(id) {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.pages.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(endpoints.pages.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.pages.delete(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useRelatedPages(id) {
  return useQuery({
    queryKey: ['pages', id, 'related'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.related(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useBulkCreatePages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pages) => {
      const res = await axiosInstance.post(endpoints.pages.bulk, pages);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useFetchPageData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.pages.fetch(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useProcessPageData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, timeRange, services, force }) => {
      const res = await axiosInstance.post(endpoints.pages.process(id), { timeRange, services, force });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGenerateNarrative() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.pages.narrative(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pages', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'profile', id] });
    },
  });
}

export function usePageProgress(id, enabled = false) {
  return useQuery({
    queryKey: ['pages', id, 'progress'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pages/${id}/progress`);
      return unwrapEnvelope(res.data);
    },
    enabled: !!id && enabled,
    refetchInterval: enabled ? 1000 : false, // Poll every second when enabled
  });
}

export function useBlindSpots(limit = 6) {
  return useQuery({
    queryKey: ['pages', 'blind-spots', limit],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.blindSpots, { params: { limit } });
      return unwrapEnvelope(res.data);
    },
  });
}
