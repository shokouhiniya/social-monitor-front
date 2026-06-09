import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های عملیات/کمپین (micromedia-transformation فاز ۲) روی `/campaigns`.
// در UI با عنوان «عملیات» نمایش داده می‌شوند.
// ----------------------------------------------------------------------

export function useOperations(params) {
  return useQuery({
    queryKey: ['operations', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.campaigns.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useOperation(id) {
  return useQuery({
    queryKey: ['operations', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.campaigns.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.campaigns.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['operations'] }),
  });
}

export function useOperationMedia(id) {
  return useQuery({
    queryKey: ['operations', id, 'media'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.campaigns.media(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAddOperationMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, micro_media_ids }) => {
      const res = await axiosInstance.post(endpoints.campaigns.media(id), {
        micro_media_ids,
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['operations', id, 'media'] }),
  });
}

export function useOperationOutputs(id) {
  return useQuery({
    queryKey: ['operations', id, 'outputs'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.campaigns.outputs(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAddOperationOutput() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.campaigns.outputs(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['operations', id, 'outputs'] });
      qc.invalidateQueries({ queryKey: ['operations', id, 'impact'] });
    },
  });
}

export function useOperationImpact(id) {
  return useQuery({
    queryKey: ['operations', id, 'impact'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.campaigns.impact(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateOperationTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.campaigns.tasks(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['operations', id, 'tasks'] }),
  });
}
