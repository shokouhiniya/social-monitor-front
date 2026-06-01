import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های گزارش‌های میدانی. فهرست با `normalizePage` نرمال می‌شود تا هم `data`
// (مصرف فعلی view) و هم `items` (شکل V2) را داشته باشد و total/page/pageSize
// استاندارد بماند (Requirement 12.5/12.7).
// ----------------------------------------------------------------------

export function useFieldReports(params) {
  return useQuery({
    queryKey: ['field-reports', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.fieldReports.list, { params });
      return normalizePage(res.data);
    },
  });
}

export function useCreateFieldReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.fieldReports.create, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['field-reports'] }),
  });
}

export function useFieldReportStats() {
  return useQuery({
    queryKey: ['field-reports', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.fieldReports.stats);
      return unwrapEnvelope(res.data);
    },
  });
}
