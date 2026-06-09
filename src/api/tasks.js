import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های تسک‌ها (micromedia-transformation فاز ۲).
// ----------------------------------------------------------------------

export function useTasks(params) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.tasks.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useTasksOverview() {
  return useQuery({
    queryKey: ['tasks', 'overview'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.tasks.overview);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useSetTaskTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tags }) => {
      const res = await axiosInstance.post(endpoints.tasks.tags(id), { tags });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.tasks.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.tasks.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.tasks.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useChangeTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosInstance.patch(endpoints.tasks.status(id), { status });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
