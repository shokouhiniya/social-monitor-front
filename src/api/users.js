import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// هوک‌های مدیریت کاربران داخلی (پنل super_admin).
// ----------------------------------------------------------------------

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.users.list);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.users.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.users.update(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, password }) => {
      const res = await axiosInstance.patch(endpoints.users.password(id), { password });
      return unwrapEnvelope(res.data);
    },
  });
}
