import { useQuery } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// هوک‌های داشبوردهای مدیریتی (micromedia-transformation فاز ۳).
// ----------------------------------------------------------------------

export function useManagementDashboard() {
  return useQuery({
    queryKey: ['dashboards', 'management'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.dashboards.management);
      return unwrapEnvelope(res.data);
    },
  });
}

export function useHubDashboard(id) {
  return useQuery({
    queryKey: ['dashboards', 'hub', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.dashboards.hub(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}

export function useOperationDashboard(id) {
  return useQuery({
    queryKey: ['dashboards', 'operation', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.dashboards.operation(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
  });
}
