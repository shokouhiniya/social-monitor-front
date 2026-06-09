import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { unwrapEnvelope } from 'src/lib/envelope';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------
// هوک‌های شاخص‌ها و رکوردهای امتیاز (micromedia-transformation فاز ۲).
// ----------------------------------------------------------------------

export function useScoreIndicators(includeInactive = false) {
  return useQuery({
    queryKey: ['media-score-indicators', includeInactive],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.mediaScore.indicators, {
        params: includeInactive ? { includeInactive: 'true' } : {},
      });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useCreateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.mediaScore.indicators, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['media-score-indicators'] }),
  });
}

export function useUpdateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.patch(endpoints.mediaScore.indicator(id), data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['media-score-indicators'] }),
  });
}

export function useUpsertScoreRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.mediaScore.records, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, data) => {
      qc.invalidateQueries({ queryKey: ['media-score-records'] });
      qc.invalidateQueries({ queryKey: ['media-score-leaderboard'] });
      if (data?.micro_media_id) {
        qc.invalidateQueries({
          queryKey: ['micro-media', data.micro_media_id, 'scores'],
        });
      }
    },
  });
}

export function useBatchScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(endpoints.mediaScore.batch, data);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (_, data) => {
      qc.invalidateQueries({ queryKey: ['media-score-records'] });
      qc.invalidateQueries({ queryKey: ['media-score-leaderboard'] });
      if (data?.micro_media_id) {
        qc.invalidateQueries({ queryKey: ['micro-media', data.micro_media_id, 'scores'] });
      }
    },
  });
}

export function useScoreLeaderboard(indicatorId) {
  return useQuery({
    queryKey: ['media-score-leaderboard', indicatorId ?? 'overall'],
    queryFn: async () => {
      const params = indicatorId ? { indicatorId } : {};
      const res = await axiosInstance.get(endpoints.mediaScore.leaderboard, { params });
      return unwrapEnvelope(res.data);
    },
  });
}

export function useMediaScoreDetail(microMediaId) {
  return useQuery({
    queryKey: ['media-score-detail', microMediaId],
    enabled: !!microMediaId,
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.mediaScore.detail(microMediaId));
      return unwrapEnvelope(res.data);
    },
  });
}
