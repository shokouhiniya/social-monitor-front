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
