'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useGhostPages } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function GhostPages() {
  const { data, isLoading } = useGhostPages();

  if (isLoading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Iconify icon="mdi:ghost" width={22} sx={{ color: 'text.secondary' }} />
        <Typography variant="subtitle2">
          پیج‌های در معرض ریزش (Ghost)
        </Typography>
        <Chip label={items.length} size="small" color="error" />
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          پیج مشکوکی شناسایی نشد
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.slice(0, 10).map((page) => (
            <Box
              key={page.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1,
                bgcolor: 'action.hover',
                opacity: 0.8,
              }}
            >
              <Avatar
                src={page.profile_image_url}
                sx={{ width: 32, height: 32, filter: 'grayscale(100%)', opacity: 0.5 }}
              >
                <Iconify icon="mdi:ghost" />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" noWrap>{page.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  پایداری: {page.consistency_rate?.toFixed(1)} • {page.is_active ? 'فعال' : 'غیرفعال'}
                </Typography>
              </Box>
              <Chip
                label={page.is_active ? 'کم‌فعالیت' : 'غیرفعال'}
                size="small"
                color={page.is_active ? 'warning' : 'error'}
                variant="outlined"
              />
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
