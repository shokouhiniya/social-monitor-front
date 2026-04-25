'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import { toJalali } from 'src/utils/format-jalali';
import { proxyImage } from 'src/utils/proxy-image';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { useFetchPageData, useProcessPageData, usePageProgress } from 'src/api/pages';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEP_ICONS = {
  'واکشی پروفایل...': 'solar:user-scan-bold',
  'واکشی پست‌ها...': 'solar:gallery-download-bold',
  'دانلود مدیا...': 'solar:cloud-download-bold',
  'واکشی استوری‌ها...': 'solar:stories-bold',
  'شروع پردازش...': 'solar:cpu-bolt-bold',
  'رونوشت‌برداری ویدیوها...': 'solar:microphone-bold',
  'ارسال به هوش مصنوعی...': 'solar:magic-stick-3-bold',
  'ذخیره نتایج تحلیل...': 'solar:database-bold',
  'تکمیل شد': 'solar:check-circle-bold',
};

function ProgressBar({ progress }) {
  if (!progress) return null;

  const isRunning = progress.status === 'running';
  const isError = progress.status === 'error';
  const isComplete = progress.status === 'completed';
  const icon = STEP_ICONS[progress.step] || 'solar:loading-bold';

  const color = isError ? 'error' : isComplete ? 'success' : progress.operation === 'fetch' ? 'info' : 'warning';

  return (
    <Box sx={(theme) => ({
      px: 1.5, py: 1, borderRadius: 1,
      bgcolor: alpha(theme.palette[color].main, 0.06),
      border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
    })}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        {isRunning ? (
          <CircularProgress size={14} color={color} thickness={5} />
        ) : (
          <Iconify icon={isError ? 'solar:danger-triangle-bold' : 'solar:check-circle-bold'} width={14} sx={{ color: `${color}.main` }} />
        )}
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, flex: 1 }} color={`${color}.main`}>
          {progress.step}
        </Typography>
        {progress.detail && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
            {progress.detail}
          </Typography>
        )}
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }} color={`${color}.main`}>
          {progress.percent}%
        </Typography>
      </Stack>
      <LinearProgress
        variant={isRunning && progress.percent === 0 ? 'indeterminate' : 'determinate'}
        value={progress.percent}
        color={color}
        sx={{ height: 5, borderRadius: 1 }}
      />
      {isError && progress.error && (
        <Typography variant="caption" color="error.main" sx={{ fontSize: 9, mt: 0.5, display: 'block' }}>
          {progress.error}
        </Typography>
      )}
    </Box>
  );
}

export function ProfileHeader({ page, onEdit, timeRange }) {
  const fetchMutation = useFetchPageData();
  const processMutation = useProcessPageData();
  const [fetchMenuAnchor, setFetchMenuAnchor] = useState(null);
  const [processMenuAnchor, setProcessMenuAnchor] = useState(null);

  // Poll progress when a mutation is pending
  const isAnyPending = fetchMutation.isPending || processMutation.isPending;
  const { data: progressData } = usePageProgress(page?.id, isAnyPending);

  // Find active progress for each operation
  const progressList = Array.isArray(progressData) ? progressData : progressData ? [progressData] : [];
  const fetchProgress = progressList.find((p) => p.operation === 'fetch' && p.status === 'running');
  const processProgress = progressList.find((p) => p.operation === 'process' && p.status === 'running');

  if (!page) return null;

  const hasFetched = !!page.last_fetched_at;
  const hasProcessed = !!page.last_processed_at;

  const handleFetch = () => {
    setFetchMenuAnchor(null);
    fetchMutation.mutate(page.id);
  };

  const handleProcess = () => {
    setProcessMenuAnchor(null);
    processMutation.mutate({ id: page.id, timeRange });
  };

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(endpoints.pages.export(page.id));
      const data = res.data?.data;
      if (!data) return;

      const lines = [];
      lines.push('=== اطلاعات پیج ===');
      const p = data.page;
      Object.entries(p).forEach(([k, v]) => {
        lines.push(`${k},${typeof v === 'object' ? JSON.stringify(v) : v}`);
      });

      if (data.posts?.length > 0) {
        lines.push('');
        lines.push('=== پست‌ها ===');
        const postHeaders = Object.keys(data.posts[0]);
        lines.push(postHeaders.join(','));
        data.posts.forEach((post) => {
          lines.push(postHeaders.map((h) => {
            const val = post[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val)}"`;
            if (typeof val === 'string' && val.includes(',')) return `"${val.replace(/"/g, '""')}"`;
            return String(val);
          }).join(','));
        });
      }

      const csv = lines.join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `page_${page.username || page.id}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={3}>
        <Box sx={{ position: 'relative' }}>
          <Avatar src={proxyImage(page.profile_image_url)} sx={{ width: 80, height: 80, fontSize: 32 }}>
            {page.name?.[0]}
          </Avatar>
          {onEdit && (
            <Tooltip title="ویرایش پروفایل" arrow>
              <IconButton size="small" onClick={onEdit}
                sx={(theme) => ({
                  position: 'absolute', bottom: -4, right: -4,
                  width: 28, height: 28,
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[2],
                  '&:hover': { bgcolor: 'action.hover' },
                })}
              >
                <Iconify icon="solar:pen-bold-duotone" width={14} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{page.name}</Typography>
            {page.is_active === false && <Chip label="غیرفعال" size="small" color="error" icon={<Iconify icon="solar:ghost-bold" width={14} />} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <Box
              component="a"
              href={
                page.platform === 'telegram'
                  ? `https://t.me/${page.username}`
                  : page.platform === 'twitter'
                    ? `https://x.com/${page.username}`
                    : `https://instagram.com/${page.username}`
              }
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, fontSize: 'inherit', '&:hover': { textDecoration: 'underline' } }}
            >
              @{page.username}
            </Box>
            {' • '}{page.platform}
          </Typography>
          {page.bio && <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: 500 }}>{page.bio}</Typography>}
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {page.category && <Chip label={page.category} size="small" color="primary" variant="outlined" />}
            {page.country && <Chip label={page.country} size="small" variant="outlined" />}
            {page.language && <Chip label={page.language} size="small" variant="outlined" />}
            {page.cluster && <Chip label={`خوشه: ${page.cluster}`} size="small" color="info" variant="outlined" />}
          </Stack>
        </Box>

        <Stack direction="row" spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{page.followers_count?.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">فالوور</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{page.following_count?.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">فالووینگ</Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 200 }}>
          {/* Step 1: Fetch */}
          {fetchMutation.isPending && fetchProgress ? (
            <Box sx={{ width: '100%' }}>
              <ProgressBar progress={fetchProgress} />
            </Box>
          ) : !hasFetched && !fetchMutation.isSuccess ? (
            <Button
              variant="contained" color="info" size="small" fullWidth
              startIcon={fetchMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cloud-download-bold-duotone" />}
              onClick={handleFetch} disabled={fetchMutation.isPending}
            >
              {fetchMutation.isPending ? 'در حال واکشی...' : 'بارگیری'}
            </Button>
          ) : (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, fontSize: 10, display: 'block' }}>
                  ✓ واکشی شد
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                  {toJalali(fetchMutation.data?.page?.last_fetched_at || page.last_fetched_at)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={(e) => setFetchMenuAnchor(e.currentTarget)}>
                <Iconify icon="solar:menu-dots-bold" width={16} />
              </IconButton>
              <Menu anchorEl={fetchMenuAnchor} open={Boolean(fetchMenuAnchor)} onClose={() => setFetchMenuAnchor(null)}>
                <MenuItem onClick={handleFetch} sx={{ fontSize: 12 }}>
                  <Iconify icon="solar:cloud-download-bold" width={16} sx={{ mr: 1 }} />بارگیری مجدد
                </MenuItem>
              </Menu>
            </Stack>
          )}

          {/* Fetch error */}
          {fetchMutation.isError && (
            <Button variant="outlined" color="error" size="small" fullWidth onClick={handleFetch}
              startIcon={<Iconify icon="solar:refresh-bold" />} sx={{ fontSize: 11 }}
            >
              تلاش مجدد
            </Button>
          )}

          {/* Step 2: Process — only after successful fetch */}
          {(hasFetched || fetchMutation.isSuccess) && (
            processMutation.isPending && processProgress ? (
              <Box sx={{ width: '100%' }}>
                <ProgressBar progress={processProgress} />
              </Box>
            ) : !hasProcessed && !processMutation.isSuccess ? (
              <Button
                variant="contained" color="warning" size="small" fullWidth
                startIcon={processMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
                onClick={handleProcess} disabled={processMutation.isPending}
              >
                {processMutation.isPending ? 'در حال پردازش...' : 'پردازش هوشمند'}
              </Button>
            ) : (
              <Stack spacing={0.5} sx={{ width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, fontSize: 10, display: 'block' }}>
                      ✓ پردازش شد
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                      {toJalali(processMutation.data?.page?.last_processed_at || page.last_processed_at)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => setProcessMenuAnchor(e.currentTarget)}>
                    <Iconify icon="solar:menu-dots-bold" width={16} />
                  </IconButton>
                  <Menu anchorEl={processMenuAnchor} open={Boolean(processMenuAnchor)} onClose={() => setProcessMenuAnchor(null)}>
                    <MenuItem onClick={handleProcess} sx={{ fontSize: 12 }}>
                      <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ mr: 1 }} />پردازش مجدد
                    </MenuItem>
                  </Menu>
                </Stack>
                {(processMutation.data?.page?.last_processed_timeframe || page.last_processed_timeframe) && (
                  <Box sx={(theme) => ({ px: 1, py: 0.5, bgcolor: alpha(theme.palette.warning.main, 0.08), borderRadius: 0.5, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` })}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block' }}>
                      بازه زمانی: {
                        { '24h': '۲۴ ساعت', '3d': '۳ روز', '1w': '۱ هفته', '2w': '۲ هفته', '1m': '۱ ماه', 'all': 'همه' }
                        [processMutation.data?.page?.last_processed_timeframe || page.last_processed_timeframe] ||
                        (processMutation.data?.page?.last_processed_timeframe || page.last_processed_timeframe)
                      }
                    </Typography>
                  </Box>
                )}
              </Stack>
            )
          )}

          {/* Process error */}
          {processMutation.isError && (
            <Button variant="outlined" color="error" size="small" fullWidth onClick={handleProcess}
              startIcon={<Iconify icon="solar:refresh-bold" />} sx={{ fontSize: 11 }}
            >
              تلاش مجدد
            </Button>
          )}

          {/* Export button */}
          <Button variant="outlined" size="small" fullWidth onClick={handleExport}
            startIcon={<Iconify icon="solar:file-download-bold-duotone" />} sx={{ fontSize: 11 }}
          >
            دانلود اطلاعات اکانت
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
