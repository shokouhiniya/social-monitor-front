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
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useFetchPageData, useProcessPageData } from 'src/api/pages';

// ----------------------------------------------------------------------

export function ProfileHeader({ page }) {
  const fetchMutation = useFetchPageData();
  const processMutation = useProcessPageData();
  const [fetched, setFetched] = useState(false);

  if (!page) return null;

  const hasBio = !!page.bio;
  const hasAnalysis = !!page.persona_radar && !!page.cluster;

  const handleFetch = () => {
    fetchMutation.mutate(page.id, {
      onSuccess: () => setFetched(true),
    });
  };

  const handleProcess = () => {
    processMutation.mutate(page.id);
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: 500 }}>
              {page.bio}
            </Typography>
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
        <Stack spacing={1}>
          {!hasAnalysis || !fetched ? (
            <>
              {/* Fetch Button */}
              <Tooltip title="واکشی اطلاعات پروفایل از اینستاگرام" arrow>
                <Button
                  variant={fetched ? 'outlined' : 'contained'}
                  color="info"
                  startIcon={fetchMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cloud-download-bold-duotone" />}
                  onClick={handleFetch}
                  disabled={fetchMutation.isPending}
                  size="small"
                >
                  {fetchMutation.isPending ? 'در حال واکشی...' : fetched ? 'واکشی مجدد' : 'بارگیری'}
                </Button>
              </Tooltip>

              {/* Process Button — shows after fetch */}
              {(fetched || hasBio) && (
                <Tooltip title="ارسال به هوش مصنوعی برای تحلیل و ساخت پروفایل هوشمند" arrow>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={processMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
                    onClick={handleProcess}
                    disabled={processMutation.isPending}
                    size="small"
                  >
                    {processMutation.isPending ? 'در حال پردازش...' : 'پردازش هوشمند'}
                  </Button>
                </Tooltip>
              )}
            </>
          ) : (
            <Stack spacing={1}>
              <Tooltip title="واکشی مجدد اطلاعات" arrow>
                <Button variant="outlined" color="info" size="small" startIcon={<Iconify icon="solar:cloud-download-bold-duotone" />}
                  onClick={handleFetch} disabled={fetchMutation.isPending}
                >
                  {fetchMutation.isPending ? 'واکشی...' : 'بارگیری مجدد'}
                </Button>
              </Tooltip>
              <Tooltip title="پردازش مجدد با هوش مصنوعی" arrow>
                <Button variant="outlined" color="warning" size="small" startIcon={<Iconify icon="solar:cpu-bolt-bold-duotone" />}
                  onClick={handleProcess} disabled={processMutation.isPending}
                >
                  {processMutation.isPending ? 'پردازش...' : 'پردازش مجدد'}
                </Button>
              </Tooltip>
            </Stack>
          )}

          {/* Status indicators */}
          {fetchMutation.isSuccess && (
            <Chip label="✓ واکشی شد" size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
          )}
          {processMutation.isSuccess && (
            <Chip label="✓ پردازش شد" size="small" color="warning" variant="outlined" sx={{ fontSize: 10 }} />
          )}
          {(fetchMutation.isError || processMutation.isError) && (
            <Chip label="✗ خطا" size="small" color="error" variant="outlined" sx={{ fontSize: 10 }} />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
