import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های میکرورسانه (micromedia-transformation فاز ۲).
// ----------------------------------------------------------------------

export function useMicroMediaList(params) {
  return useQuery({
    queryKey: ['micro-media', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useMicroMedia(id) {
  return useQuery({
    queryKey: ['micro-media', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateMicroMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.microMedia.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['micro-media'] }),
  });
}

export function useBulkCreateMicroMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      const res = await axiosInstance.post(endpoints.microMedia.bulk, rows);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['micro-media'] }),
  });
}

export function useUpdateMicroMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.microMedia.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['micro-media'] });
      qc.invalidateQueries({ queryKey: ['micro-media', id] });
    },
  });
}

export function useDeleteMicroMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(endpoints.microMedia.delete(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['micro-media'] }),
  });
}

export function useSetMicroMediaTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tags }) => {
      const res = await axiosInstance.post(endpoints.microMedia.tags(id), { tags });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id] }),
  });
}

export function useMicroMediaAccounts(id) {
  return useQuery({
    queryKey: ['micro-media', id, 'accounts'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.accounts(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAttachAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.microMedia.accounts(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id, 'accounts'] }),
  });
}

export function useMicroMediaPerformance(id) {
  return useQuery({
    queryKey: ['micro-media', id, 'performance'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.performance(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useRefreshPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.microMedia.refreshPerformance(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, id) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id, 'performance'] }),
  });
}

export function useMicroMediaScores(id) {
  return useQuery({
    queryKey: ['micro-media', id, 'scores'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.scores(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAddScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.microMedia.scores(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id, 'scores'] }),
  });
}

export function useMicroMediaInteractions(id) {
  return useQuery({
    queryKey: ['micro-media', id, 'interactions'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.interactions(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAddMicroMediaInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.microMedia.interactions(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id, 'interactions'] }),
  });
}

export function useMicroMediaPosts(id) {
  return useQuery({
    queryKey: ['micro-media', id, 'posts'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.posts(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useSuggestProfile() {
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.microMedia.suggestProfile(id));
      return unwrapEnvelope(res.data);
    },
  });
}
