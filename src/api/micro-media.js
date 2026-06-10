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
    enabled: params !== null && params !== undefined,
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

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.microMedia.createAccount(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['micro-media', id, 'accounts'] }),
  });
}

export function useDetachAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageId }) => {
      const res = await axiosInstance.delete(endpoints.microMedia.detachAccount(pageId));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['micro-media'] }),
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

// ----------------------------------------------------------------------
// نمایندگان (representatives) — انتخاب میکرورسانه‌ها به‌عنوان نمایندهٔ خوشه/هویت.
// خوشه و هویت کاملاً مستقل‌اند (دو پرچم جدا).
// ----------------------------------------------------------------------

/** همهٔ نمایندگان، گروه‌بندی‌شده: { cluster: {[clusterId]: [...]}, identity: {[title]: [...]} } */
export function useMicroMediaRepresentatives({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['micro-media', 'representatives'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.representatives);
      return unwrapEnvelope(res.data);
    },
    enabled,
  });
}

/** فهرست میکرورسانه‌های یک خوشهٔ موضوعی (برای دیالوگ مدیریت نمایندگان خوشه). */
export function useMicroMediaByCluster(clusterId, enabled = true) {
  return useQuery({
    queryKey: ['micro-media', 'by-cluster', clusterId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.byCluster(clusterId));
      return unwrapEnvelope(res.data);
    },
    enabled: enabled && !!clusterId,
  });
}

/** فهرست میکرورسانه‌های یک هویت (برای دیالوگ مدیریت نمایندگان هویت). */
export function useMicroMediaByIdentity(title, enabled = true) {
  return useQuery({
    queryKey: ['micro-media', 'by-identity', title],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.microMedia.byIdentity, {
        params: { title },
      });
      return unwrapEnvelope(res.data);
    },
    enabled: enabled && !!title,
  });
}

/** تعیین/لغو نماینده‌بودن یک میکرورسانه برای خوشه یا هویت. */
export function useSetMicroMediaRepresentative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scope, value }) => {
      const res = await axiosInstance.patch(endpoints.microMedia.setRepresentative(id), {
        scope,
        value,
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['micro-media'] });
    },
  });
}
