import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { normalizePage, unwrapEnvelope } from 'src/lib/envelope';

// Telegram endpoints
const telegramEndpoints = {
  sync: '/telegram/sync',
  monitor: (id) => `/telegram/monitor/${id}`,
  fetchMore: (id) => `/telegram/fetch-more/${id}`,
};

// Sync a Telegram channel
export function useSyncTelegramChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, messageLimit, pageCategory, clientKeywords }) => {
      const res = await axiosInstance.post(telegramEndpoints.sync, {
        username,
        message_limit: messageLimit || 50,
        page_category: pageCategory,
        client_keywords: clientKeywords,
      });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['telegram-channels'] });
    },
  });
}

// Monitor (refresh) a Telegram channel
export function useMonitorTelegramChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageId) => {
      const res = await axiosInstance.post(telegramEndpoints.monitor(pageId));
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

// Fetch more messages for a channel
export function useFetchMoreTelegramMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageId, count }) => {
      const res = await axiosInstance.post(telegramEndpoints.fetchMore(pageId), { count });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Get telegram channels (pages with platform=telegram)
export function useTelegramChannels(params = {}) {
  return useQuery({
    queryKey: ['telegram-channels', params],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.pages.list, {
        params: { ...params, platform: 'telegram' },
      });
      return normalizePage(res.data);
    },
  });
}
