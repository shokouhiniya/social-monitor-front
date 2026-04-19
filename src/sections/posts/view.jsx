'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useHighImpactPosts } from 'src/api/analytics';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePostsFeed, useTopicClusters } from 'src/api/posts';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SENTIMENT_CONFIG = {
  angry: { color: 'error', icon: 'solar:fire-bold', label: 'خشمگین' },
  hopeful: { color: 'success', icon: 'solar:sun-bold', label: 'امیدوار' },
  neutral: { color: 'default', icon: 'solar:minus-circle-bold', label: 'خنثی' },
  sad: { color: 'info', icon: 'solar:cloud-bold', label: 'غمگین' },
};

export function PostsListView() {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [outliersOnly, setOutliersOnly] = useState(false);
  const [viewMode, setViewMode] = useState('feed'); // feed | cluster
  const [page, setPage] = useState(1);

  const { data: feedData, isLoading: feedLoading } = usePostsFeed({
    search: search || undefined,
    sentiment_label: sentimentFilter || undefined,
    post_type: typeFilter || undefined,
    outliers_only: outliersOnly ? 'true' : undefined,
    page,
    limit: 20,
  });

  const { data: spikePosts } = useHighImpactPosts(3);
  const { data: clusters, isLoading: clustersLoading } = useTopicClusters();

  const posts = feedData?.data || [];
  const total = feedData?.total || 0;

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>فید هوشمند رصد</Typography>
          <Typography variant="body2" color="text.secondary">{total} پست • تحلیل لحظه‌ای محتوای شبکه</Typography>
        </Box>
        <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => { if (v) setViewMode(v); }}>
          <ToggleButton value="feed"><Iconify icon="solar:list-bold" width={18} sx={{ mr: 0.5 }} />فید</ToggleButton>
          <ToggleButton value="cluster"><Iconify icon="solar:atom-bold" width={18} sx={{ mr: 0.5 }} />خوشه‌ای</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Spike Feed */}
      {spikePosts?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Iconify icon="solar:bolt-circle-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>پست‌های فوق‌بحرانی</Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflow: 'auto', pb: 1 }}>
            {spikePosts.map((post) => (
              <SpikeCard key={post.id} post={post} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Smart Filter Bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <TextField
          size="small" placeholder="جستجو در کپشن‌ها..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-bold-duotone" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          sx={{ minWidth: 250 }}
        />
        {Object.entries(SENTIMENT_CONFIG).map(([key, conf]) => (
          <Chip key={key} label={conf.label} variant={sentimentFilter === key ? 'filled' : 'outlined'}
            color={sentimentFilter === key ? conf.color : 'default'}
            icon={<Iconify icon={conf.icon} width={14} />}
            onClick={() => { setSentimentFilter(sentimentFilter === key ? '' : key); setPage(1); }}
          />
        ))}
        <Chip label="وایرال" variant={outliersOnly ? 'filled' : 'outlined'} color={outliersOnly ? 'warning' : 'default'}
          icon={<Iconify icon="solar:fire-bold" width={14} />}
          onClick={() => { setOutliersOnly(!outliersOnly); setPage(1); }}
        />
        {['image', 'video', 'reel', 'story'].map((t) => (
          <Chip key={t} label={t} variant={typeFilter === t ? 'filled' : 'outlined'} size="small"
            onClick={() => { setTypeFilter(typeFilter === t ? '' : t); setPage(1); }}
          />
        ))}
      </Stack>

      {viewMode === 'feed' ? (
        /* Feed View */
        feedLoading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {posts.map((post) => (
                <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
            {posts.length > 0 && posts.length < total && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={() => setPage(page + 1)}>بارگذاری بیشتر</Button>
              </Box>
            )}
          </>
        )
      ) : (
        /* Cluster View */
        clustersLoading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={3}>
            {(clusters || []).map((cluster) => (
              <Card key={cluster.topic} sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Iconify icon="solar:atom-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{cluster.topic}</Typography>
                  <Chip label={`${cluster.count} پست`} size="small" color="primary" variant="outlined" />
                </Stack>
                <Grid container spacing={2}>
                  {(cluster.posts || []).slice(0, 3).map((post) => (
                    <Grid key={post.id} size={{ xs: 12, sm: 4 }}>
                      <PostCard post={post} compact />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            ))}
          </Stack>
        )
      )}
    </DashboardContent>
  );
}

// --- Sub Components ---

function SpikeCard({ post }) {
  const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
  return (
    <Card
      sx={(theme) => ({
        p: 2, minWidth: 280, flexShrink: 0,
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, transparent 100%)`,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Iconify icon="solar:bolt-circle-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
        <Avatar src={post.page?.profile_image_url} sx={{ width: 32, height: 32 }}>{post.page?.name?.[0]}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{post.page?.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }} noWrap>
            {post.caption?.slice(0, 60)}
          </Typography>
        </Box>
        <Chip label={`${engagement.toLocaleString()}`} size="small" color="warning" sx={{ fontWeight: 700 }} />
      </Stack>
    </Card>
  );
}

function PostCard({ post, compact }) {
  const sentConf = SENTIMENT_CONFIG[post.sentiment_label] || SENTIMENT_CONFIG.neutral;
  const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);

  // Generate Instagram post URL
  const getInstagramUrl = () => {
    if (!post.external_id) return null;
    return `https://www.instagram.com/p/${post.external_id}/`;
  };

  const handleClick = () => {
    const url = getInstagramUrl();
    if (url) window.open(url, '_blank');
  };

  return (
    <Card
      onClick={handleClick}
      sx={(theme) => ({
        p: 2, height: '100%',
        border: post.is_outlier ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}` : `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
        transition: 'all 0.2s',
        cursor: getInstagramUrl() ? 'pointer' : 'default',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), boxShadow: theme.shadows[2] },
      })}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Avatar src={post.page?.profile_image_url} sx={{ width: 32, height: 32 }}>{post.page?.name?.[0]}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{post.page?.name}</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 10 }}>
            {post.published_at ? new Date(post.published_at).toLocaleDateString('fa-IR') : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          {post.is_outlier && (
            <Tooltip title="انحراف از معیار — تعامل غیرعادی" arrow>
              <Box><Iconify icon="solar:bolt-circle-bold-duotone" width={18} sx={{ color: 'warning.main' }} /></Box>
            </Tooltip>
          )}
          {post.is_viral && (
            <Tooltip title="وایرال شده!" arrow>
              <Box><Iconify icon="solar:fire-bold-duotone" width={18} sx={{ color: 'error.main' }} /></Box>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Caption */}
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, lineHeight: 1.8, mb: 1.5, display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.caption || '—'}
      </Typography>

      {/* Tags */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
        <Chip label={sentConf.label} size="small" color={sentConf.color} variant="outlined" sx={{ height: 22, fontSize: 10 }} icon={<Iconify icon={sentConf.icon} width={12} />} />
        {post.post_type && <Chip label={post.post_type} size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />}
        {post.extracted_topics?.slice(0, 2).map((t) => (
          <Chip key={t} label={t} size="small" sx={{ height: 22, fontSize: 10, bgcolor: 'action.hover' }} />
        ))}
      </Stack>

      {/* Engagement */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon="solar:heart-bold" width={14} sx={{ color: 'error.main' }} />
          <Typography variant="caption" sx={{ fontSize: 11 }}>{post.likes_count?.toLocaleString()}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon="solar:chat-round-dots-bold" width={14} sx={{ color: 'info.main' }} />
          <Typography variant="caption" sx={{ fontSize: 11 }}>{post.comments_count?.toLocaleString()}</Typography>
        </Stack>
        {post.engagement_ratio > 1 && (
          <Chip
            label={`${post.engagement_ratio > 1 ? '+' : ''}${Math.round((post.engagement_ratio - 1) * 100)}%`}
            size="small"
            color={post.engagement_ratio > 2 ? 'warning' : 'default'}
            sx={{ height: 20, fontSize: 10, ml: 'auto' }}
          />
        )}
      </Stack>
    </Card>
  );
}
