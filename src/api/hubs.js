import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// هوک‌های هاب‌ها (micromedia-transformation فاز ۲). همه از طریق envelope helper
// پردازش می‌شوند تا با `{ meta, data }` سازگار بمانند.
// ----------------------------------------------------------------------

export function useHubs() {
  return useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.hubs.list);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useHubsStats() {
  return useQuery({
    queryKey: ['hubs', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.hubs.stats);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useAssignableUsers() {
  return useQuery({
    queryKey: ['hubs', 'assignable-users'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.hubs.assignableUsers);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useHub(id) {
  return useQuery({
    queryKey: ['hubs', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.hubs.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.hubs.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hubs'] }),
  });
}

export function useUpdateHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.hubs.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hubs'] }),
  });
}

export function useHubUsers(id) {
  return useQuery({
    queryKey: ['hubs', id, 'users'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.hubs.users(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useAssignHubUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.post(endpoints.hubs.users(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['hubs', id, 'users'] }),
  });
}
