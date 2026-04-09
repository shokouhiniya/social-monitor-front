'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useLatestPosts } from 'src/api/analytics';

// ----------------------------------------------------------------------

const SENTIMENT_CONFIG = {
  angry: { color: 'error', icon: 'solar:fire-bold', label: 'خشمگین' },
  hopeful: { color: 'success', icon: 'solar:sun-bold', label: 'امیدوار' },
  neutral: { color: 'default', icon: 'solar:minus-circle-bold', label: 'خنثی' },
  sad: { color: 'info', icon: 'solar:cloud-bold', label: 'غمگین' },
};

export function LatestPosts() {
  const { data, isLoading } = useLatestPosts(8);

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <Iconify icon="solar:posts-carousel-vertical-bold-duotone" width={22} sx={{ color: 'text.secondary' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          تازه‌ترین پست‌ها
        </Typography>
        <Tooltip title="آخرین پست‌های منتشرشده در شبکه پایش" arrow>
          <IconButton size="small" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
            <Iconify icon="solar:info-circle-line-duotone" width={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
      ) : (
        <Stack spacing={1.5} sx={{ maxHeight: 400, overflow: 'auto' }}>
          {(data || []).map((post) => {
            const sentConf = SENTIMENT_CONFIG[post.sentiment_label] || SENTIMENT_CONFIG.neutral;
            return (
              <Box
                key={post.id}
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                })}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Avatar src={post.page?.profile_image_url} sx={{ width: 32, height: 32, mt: 0.25 }}>
                    {post.page?.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {post.page?.name || '—'}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Chip
                          label={sentConf.label}
                          size="small"
                          color={sentConf.color}
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                        {post.post_type && (
                          <Chip label={post.post_type} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                        )}
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.caption || '—'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:heart-bold" width={14} sx={{ color: 'error.main' }} />
                        <Typography variant="caption" color="text.secondary">{post.likes_count?.toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:chat-round-dots-bold" width={14} sx={{ color: 'info.main' }} />
                        <Typography variant="caption" color="text.secondary">{post.comments_count?.toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:share-bold" width={14} sx={{ color: 'warning.main' }} />
                        <Typography variant="caption" color="text.secondary">{post.shares_count?.toLocaleString()}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto', fontSize: 10 }}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('fa-IR') : ''}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}
