import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های مرکز Job (JobsModule — design §5.11 / §7.2، Requirement 10).
//
// لایهٔ دادهٔ مرکز Job که به endpointهای V2 وصل است:
//   POST /jobs/refresh           — ساخت Job بروزرسانی دسته‌ای (Requirement 10.1)
//   GET  /jobs                   — فهرست صفحه‌بندی‌شده (Requirement 12.5-12.7)
//   GET  /jobs/:id               — جزئیات Job (status/progress/failedTasks/logs)
//   POST /jobs/:id/cancel        — لغو Job در حال اجرا (Requirement 10.10)
//   POST /jobs/:id/retry-failed  — تلاش مجدد task های ناموفق (Requirement 10.5)
//
// پردازش envelope/pagination از طریق helperهای مشترک task 9.2 انجام می‌شود تا هم
// با envelope V2 و هم با پاسخ خام legacy سازگار بماند.
// ----------------------------------------------------------------------

/** فهرست صفحه‌بندی‌شدهٔ Job ها با فیلتر اختیاری status/type. */
export function useJobs(params) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.jobs.list, { params });
      return normalizePage(res.data);
    },
  });
}

/**
 * جزئیات یک Job. هنگام فعال‌بودن، با فاصلهٔ زمانی poll می‌شود تا پیشرفت زنده
 * به‌روزرسانی شود؛ به‌محض رسیدن Job به وضعیت پایانی، poll متوقف می‌شود.
 */
export function useJob(id, { poll = true } = {}) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.jobs.detail(id));
      return unwrapEnvelope(res.data);
    },
    enabled: !!id,
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.status;
      const terminal = ['succeeded', 'failed', 'cancelled'];
      return status && terminal.includes(status) ? false : 2000;
    },
  });
}

/** ساخت یک Job بروزرسانی دسته‌ای روی مجموعه‌ای از منابع (Requirement 10.1). */
export function useCreateRefreshJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceIds, steps }) => {
      const res = await axiosInstance.post(endpoints.jobs.refresh, { sourceIds, steps });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

/** لغو یک Job در حال اجرا (Requirement 10.10). */
export function useCancelJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.jobs.cancel(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
    },
  });
}

/** تلاش مجدد task های ناموفق یک Job (Requirement 10.5). */
export function useRetryFailedTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(endpoints.jobs.retryFailed(id));
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
    },
  });
}
