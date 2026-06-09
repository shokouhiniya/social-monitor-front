import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های تعاملات جدید (micromedia-transformation فاز ۲) روی `/interactions-v2`.
// ----------------------------------------------------------------------

export function useInteractions(params) {
  return useQuery({
    queryKey: ['interactions-v2', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.interactionsV2.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useInteractionsOverview() {
  return useQuery({
    queryKey: ['interactions-v2', 'overview'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.interactionsV2.overview);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCreateInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.interactionsV2.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interactions-v2'] }),
  });
}
