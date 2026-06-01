import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { extractItems, normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک‌های استودیوی Prompt (PromptsModule — design §5.7 / §7.2، Requirement 6).
//
// لایهٔ دادهٔ Prompt Studio که به endpointهای V2 وصل است:
//   GET   /prompts                                  — فهرست تعاریف prompt (Requirement 6.1)
//   GET   /prompts/:key                             — جزئیات prompt + نسخه‌ها
//   GET   /prompts/:key/executions                  — تاریخچهٔ صفحه‌بندی‌شدهٔ اجراها (Requirement 6.7)
//   POST  /prompts/:key/versions                    — ساخت نسخهٔ جدید (Requirement 6.2، admin-only)
//   PATCH /prompts/:key/versions/:versionId/activate— فعال‌سازی نسخه (Requirement 6.3، admin-only)
//   POST  /prompts/:key/test                        — تست دستی prompt (Requirement 6.5)
//   PATCH /prompts/:key/active                       — enable/disable (Requirement 6.8، admin-only)
//
// پردازش envelope/pagination از طریق helperهای مشترک task 9.2 انجام می‌شود.
// ----------------------------------------------------------------------

/** فهرست همهٔ تعاریف prompt (Requirement 6.1). */
export function usePromptDefinitions() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.prompts.list);
      return extractItems(res.data);
    },
  });
}

/** جزئیات یک prompt به‌همراه نسخه‌های آن. */
export function usePrompt(key) {
  return useQuery({
    queryKey: ['prompts', key],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.prompts.detail(key));
      return unwrapEnvelope(res.data);
    },
    enabled: !!key,
  });
}

/** تاریخچهٔ صفحه‌بندی‌شدهٔ اجراهای یک prompt (Requirement 6.7). */
export function usePromptExecutions(key, params) {
  return useQuery({
    queryKey: ['prompts', key, 'executions', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.prompts.executions(key), { params });
      return normalizePage(res.data);
    },
    enabled: !!key,
  });
}

/** ساخت یک نسخهٔ جدید برای یک prompt (Requirement 6.2). */
export function useCreatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, data }) => {
      const res = await axiosInstance.post(endpoints.prompts.createVersion(key), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key] });
    },
  });
}

/** فعال‌سازی یک نسخهٔ prompt (تنها یک نسخهٔ فعال — Requirement 6.3). */
export function useActivatePromptVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, versionId }) => {
      const res = await axiosInstance.patch(endpoints.prompts.activateVersion(key, versionId));
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key] });
    },
  });
}

/** تست دستی یک prompt با ورودی نمونه (Requirement 6.5). */
export function useTestPrompt() {
  return useMutation({
    mutationFn: async ({ key, sampleInput, versionId }) => {
      const res = await axiosInstance.post(endpoints.prompts.test(key), { sampleInput, versionId });
      return unwrapEnvelope(res.data);
    },
  });
}

/** فعال/غیرفعال کردن یک prompt (Requirement 6.8). */
export function useSetPromptActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, is_active }) => {
      const res = await axiosInstance.patch(endpoints.prompts.setActive(key), { is_active });
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.key] });
    },
  });
}
