'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { useFetchPageData, useProcessPageData } from 'src/api/pages';

// ----------------------------------------------------------------------

function formatDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return null; }
}

export function ProfileHeader({ page }) {
  const fetchMutation = useFetchPageData();
  const processMutation = useProcessPageData();
  const [fetchMenuAnchor, setFetchMenuAnchor] = useState(null);
  const [processMenuAnchor, setProcessMenuAnchor] = useState(null);

  if (!page) return null;

  const hasFetched = !!page.last_fetched_at;
  const hasProcessed = !!page.last_processed_at;

  const handleFetch = () => {
    setFetchMenuAnchor(null);
    fetchMutation.mutate(page.id);
  };

  const handleProcess = () => {
    setProcessMenuAnchor(null);
    processMutation.mutate(page.id);
  };

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(endpoints.pages.export(page.id));
      const data = res.data?.data;
      if (!data) return;

      const lines = [];
      // Page info
      lines.push('=== اطلاعات پیج ===');
      const p = data.page;
      Object.entries(p).forEach(([k, v]) => {
        lines.push(`${k},${typeof v === 'object' ? JSON.stringify(v) : v}`);
      });

      // Posts
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
        <Avatar src={page.profile_image_url} sx={{ width: 80, height: 80, fontSize: 32 }}>
          {page.name?.[0]}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{page.name}</Typography>
            {page.is_active === false && <Chip label="غیرفعال" size="small" color="error" icon={<Iconify icon="solar:ghost-bold" width={14} />} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>@{page.username} • {page.platform}</Typography>
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
        <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 180 }}>
          {/* Step 1: Fetch */}
          {!hasFetched && !fetchMutation.isSuccess ? (
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
                  {formatDate(fetchMutation.data?.page?.last_fetched_at || page.last_fetched_at)}
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
            !hasProcessed && !processMutation.isSuccess ? (
              <Button
                variant="contained" color="warning" size="small" fullWidth
                startIcon={processMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
                onClick={handleProcess} disabled={processMutation.isPending}
              >
                {processMutation.isPending ? 'در حال پردازش...' : 'پردازش هوشمند'}
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, fontSize: 10, display: 'block' }}>
                    ✓ پردازش شد
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                    {formatDate(processMutation.data?.page?.last_processed_at || page.last_processed_at)}
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
