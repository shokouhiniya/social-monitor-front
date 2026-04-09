import { useQuery } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useMacroDashboard() {
  return useQuery({
    queryKey: ['analytics', 'macro-dashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.macroDashboard);
      return res.data?.data;
    },
  });
}

export function useAlignmentIndex() {
  return useQuery({
    queryKey: ['analytics', 'alignment-index'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.alignmentIndex);
      return res.data?.data;
    },
  });
}

export function useProfileDeepDive(pageId) {
  return useQuery({
    queryKey: ['analytics', 'profile', pageId],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.analytics.profileDeepDive(pageId));
      return res.data?.data;
    },
    enabled: !!pageId,
  });
}
