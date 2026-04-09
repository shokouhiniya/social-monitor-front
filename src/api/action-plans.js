import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useActionPlans(pageId) {
  return useQuery({
    queryKey: ['action-plans', pageId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.actionPlans.byPage(pageId));
      return res.data?.data;
    },
    enabled: !!pageId,
  });
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.actionPlans.create, data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.actionPlans.update(id), data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['action-plans'] }),
  });
}
