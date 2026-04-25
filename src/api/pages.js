import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function usePages(params) {
  return useQuery({
    queryKey: ['pages', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.list, { params });
      return res.data?.data;
    },
  });
}

export function usePage(id) {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.detail(id));
      return res.data?.data;
    },
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.pages.create, data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(endpoints.pages.update(id), data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.pages.delete(id));
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useRelatedPages(id) {
  return useQuery({
    queryKey: ['pages', id, 'related'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.related(id));
      return res.data?.data;
    },
    enabled: !!id,
  });
}

export function useBulkCreatePages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pages) => {
      const res = await axiosInstance.post(endpoints.pages.bulk, pages);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
}

export function useFetchPageData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.pages.fetch(id));
      return res.data?.data;
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
    mutationFn: async ({ id, timeRange }) => {
      const res = await axiosInstance.post(endpoints.pages.process(id), { timeRange });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function usePageProgress(id, enabled = false) {
  return useQuery({
    queryKey: ['pages', id, 'progress'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pages/${id}/progress`);
      return res.data?.data;
    },
    enabled: !!id && enabled,
    refetchInterval: enabled ? 1000 : false, // Poll every second when enabled
  });
}
