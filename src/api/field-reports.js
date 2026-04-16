import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useFieldReports(params) {
  return useQuery({
    queryKey: ['field-reports', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.fieldReports.list, { params });
      return res.data?.data;
    },
  });
}

export function useCreateFieldReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.fieldReports.create, data);
      return res.data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['field-reports'] }),
  });
}

export function useFieldReportStats() {
  return useQuery({
    queryKey: ['field-reports', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.fieldReports.stats);
      return res.data?.data;
    },
  });
}
