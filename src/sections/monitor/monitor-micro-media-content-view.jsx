'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMicroMedia } from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

import { PostsListView } from 'src/sections/posts/view';

// ----------------------------------------------------------------------

/**
 * نمایش کل محتوای یک میکرورسانه با فیلتر پیشرفته.
 * از PostsListView با micro_media_id ثابت استفاده می‌کند.
 */
export function MonitorMicroMediaContentView({ id }) {
  const router = useRouter();
  const { data: media, isLoading } = useMicroMedia(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!media) {
    return (
      <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>میکرورسانه یافت نشد</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* دکمه بازگشت */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 3, pt: 2, pb: 0 }}>
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          onClick={() => router.push(paths.dashboard.monitor.microMedia.root)}
        >
          بازگشت به لیست میکرورسانه‌ها
        </Button>
      </Stack>

      <PostsListView
        fixedMicroMediaId={id}
        fixedTitle={`محتوای «${media.name}»`}
      />
    </Box>
  );
}
