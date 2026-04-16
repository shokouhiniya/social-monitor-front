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

import { Iconify } from 'src/components/iconify';
import { useFetchPageData, useProcessPageData } from 'src/api/pages';

// ----------------------------------------------------------------------

export function ProfileHeader({ page }) {
  const fetchMutation = useFetchPageData();
  const processMutation = useProcessPageData();
  const [fetchDone, setFetchDone] = useState(false);
  const [processDone, setProcessDone] = useState(false);
  const [fetchMenuAnchor, setFetchMenuAnchor] = useState(null);
  const [processMenuAnchor, setProcessMenuAnchor] = useState(null);

  if (!page) return null;

  const handleFetch = () => {
    setFetchMenuAnchor(null);
    fetchMutation.mutate(page.id, { onSuccess: () => setFetchDone(true) });
  };

  const handleProcess = () => {
    setProcessMenuAnchor(null);
    processMutation.mutate(page.id, { onSuccess: () => setProcessDone(true) });
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
            {page.is_active === false && (
              <Chip label="غیرفعال" size="small" color="error" icon={<Iconify icon="solar:ghost-bold" width={14} />} />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            @{page.username} • {page.platform}
          </Typography>
          {page.bio && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: 500 }}>{page.bio}</Typography>
          )}
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {page.category && <Chip label={page.category} size="small" color="primary" variant="outlined" />}
            {page.country && <Chip label={page.country} size="small" variant="outlined" />}
            {page.language && <Chip label={page.language} size="small" variant="outlined" />}
            {page.cluster && <Chip label={`خوشه: ${page.cluster}`} size="small" color="info" variant="outlined" />}
          </Stack>
        </Box>

        {/* Stats */}
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

        {/* Action Buttons */}
        <Stack spacing={1} alignItems="flex-end">
          {/* Fetch */}
          {!fetchDone && !fetchMutation.isSuccess ? (
            <Button
              variant="contained" color="info" size="small"
              startIcon={fetchMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cloud-download-bold-duotone" />}
              onClick={handleFetch}
              disabled={fetchMutation.isPending}
            >
              {fetchMutation.isPending ? 'در حال واکشی...' : 'بارگیری'}
            </Button>
          ) : (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip label="✓ واکشی شد" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
              <IconButton size="small" onClick={(e) => setFetchMenuAnchor(e.currentTarget)}>
                <Iconify icon="solar:menu-dots-bold" width={18} />
              </IconButton>
              <Menu anchorEl={fetchMenuAnchor} open={Boolean(fetchMenuAnchor)} onClose={() => setFetchMenuAnchor(null)}>
                <MenuItem onClick={handleFetch} sx={{ fontSize: 13 }}>
                  <Iconify icon="solar:cloud-download-bold" width={16} sx={{ mr: 1 }} />
                  بارگیری مجدد
                </MenuItem>
              </Menu>
            </Stack>
          )}

          {/* Process — only show after fetch */}
          {(fetchDone || fetchMutation.isSuccess || page.bio) && (
            !processDone && !processMutation.isSuccess ? (
              <Button
                variant="contained" color="warning" size="small"
                startIcon={processMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
                onClick={handleProcess}
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? 'در حال پردازش...' : 'پردازش هوشمند'}
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Chip label="✓ پردازش شد" size="small" color="warning" variant="outlined" sx={{ fontSize: 11 }} />
                <IconButton size="small" onClick={(e) => setProcessMenuAnchor(e.currentTarget)}>
                  <Iconify icon="solar:menu-dots-bold" width={18} />
                </IconButton>
                <Menu anchorEl={processMenuAnchor} open={Boolean(processMenuAnchor)} onClose={() => setProcessMenuAnchor(null)}>
                  <MenuItem onClick={handleProcess} sx={{ fontSize: 13 }}>
                    <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ mr: 1 }} />
                    پردازش مجدد
                  </MenuItem>
                </Menu>
              </Stack>
            )
          )}

          {/* Error */}
          {(fetchMutation.isError || processMutation.isError) && (
            <Chip label="✗ خطا — دوباره تلاش کنید" size="small" color="error" variant="outlined" sx={{ fontSize: 10 }} />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
