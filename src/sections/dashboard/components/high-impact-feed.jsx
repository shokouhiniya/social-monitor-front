'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';
import { useHighImpactPosts } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function HighImpactFeed() {
  const { data, isLoading } = useHighImpactPosts(5);

  return (
    <ChartCard
      title="پست‌های جریان‌ساز"
      icon="solar:bolt-circle-bold-duotone"
      info="پست‌هایی که در ۲۴ ساعت اخیر بیشترین تعامل (لایک + کامنت + شیر) را داشته‌اند"
    >
      {isLoading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
      ) : (
        <Stack spacing={1.5}>
          {(data || []).map((post, idx) => {
            const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
            return (
              <Box
                key={post.id}
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: idx === 0 ? alpha(theme.palette.warning.main, 0.06) : alpha(theme.palette.grey[500], 0.04),
                  border: idx === 0 ? `1px solid ${alpha(theme.palette.warning.main, 0.15)}` : `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3) },
                })}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  {idx === 0 && (
                    <Iconify icon="solar:fire-bold-duotone" width={20} sx={{ color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
                  )}
                  <Avatar src={post.page?.profile_image_url} sx={{ width: 32, height: 32, mt: 0.25 }}>
                    {post.page?.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{post.page?.name}</Typography>
                      <Chip
                        label={`${engagement.toLocaleString()} تعامل`}
                        size="small"
                        color={idx === 0 ? 'warning' : 'default'}
                        variant={idx === 0 ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.caption || '—'}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:heart-bold" width={13} sx={{ color: 'error.main' }} />
                        <Typography variant="caption" sx={{ fontSize: 10 }}>{post.likes_count?.toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:chat-round-dots-bold" width={13} sx={{ color: 'info.main' }} />
                        <Typography variant="caption" sx={{ fontSize: 10 }}>{post.comments_count?.toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:share-bold" width={13} sx={{ color: 'warning.main' }} />
                        <Typography variant="caption" sx={{ fontSize: 10 }}>{post.shares_count?.toLocaleString()}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </ChartCard>
  );
}
