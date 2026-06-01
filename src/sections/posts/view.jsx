'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { proxyImage } from 'src/utils/proxy-image';
import { toJalaliDate } from 'src/utils/format-jalali';

import { useClusters } from 'src/api/clusters';
import { useHighImpactPosts } from 'src/api/analytics';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePostsFeed, useTopicClusters } from 'src/api/posts';

import { Iconify } from 'src/components/iconify';
import { ActionStateView } from 'src/components/action-state';

import { PageInfoBox } from '../dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const PAGE_INFO = {
  title: 'فید هوشمند رصد',
  icon: 'solar:gallery-bold-duotone',
  color: 'primary',
  shortDescription: 'مرور تمام پست‌های شبکه با فیلترهای پیشرفته — تشخیص پست‌های وایرال، گروه‌بندی موضوعی، تحلیل تک‌پست با AI',
  modules: [
    { name: 'پست‌های فوق‌بحرانی', icon: 'solar:bolt-circle-bold-duotone', color: 'warning', description: 'نوار بالای صفحه که ۳ پست با تعامل غیرعادی را نشان می‌دهد. این پست‌ها سرعت رشد بالایی دارند.' },
    { name: 'فیلتر سریع', icon: 'solar:filter-bold-duotone', color: 'info', description: 'فیلتر بر اساس لحن (خشمگین/امیدوار/خنثی/غمگین) و نوع پست (تصویر/ویدیو/ریل/استوری/کاروسل) و وایرال بودن.' },
    { name: 'فیلتر پیشرفته', icon: 'solar:settings-bold-duotone', color: 'primary', description: 'فیلتر بر اساس پلتفرم، خوشه، دسته‌بندی، کشور و بازه تاریخی.' },
    { name: 'نمای فید', icon: 'solar:list-bold-duotone', color: 'secondary', description: 'نمای پیش‌فرض — پست‌ها در گرید کارت‌ها با هاور-پلی برای ویدیوها.' },
    { name: 'نمای خوشه‌ای', icon: 'solar:atom-bold-duotone', color: 'success', description: 'پست‌ها بر اساس موضوعات استخراج‌شده توسط AI گروه‌بندی می‌شوند. هر گروه ۳ پست برتر را نشان می‌دهد.' },
    { name: 'دیالوگ پست', icon: 'solar:eye-bold-duotone', color: 'info', description: 'با کلیک روی هر پست: مشاهده فول مدیا، ترجمه فارسی، رونوشت صوتی، متن استخراج‌شده از تصویر، توضیحات دستی.' },
    { name: 'پردازش هوشمند پست', icon: 'solar:cpu-bolt-bold-duotone', color: 'warning', description: 'با کلیک روی این دکمه در دیالوگ پست، AI لحن، موضوعات، کلمات کلیدی و ترجمه را استخراج می‌کند.' },
    { name: 'توضیح دستی', icon: 'solar:pen-new-square-bold-duotone', color: 'success', description: 'برای پست‌هایی که AI نمی‌تواند تفسیر کند (مثلاً ویدیوی بدون کپشن واضح)، می‌توانید توضیح دستی اضافه کنید. این متن در تحلیل بعدی لحاظ می‌شود.' },
  ],
  tips: [
    'با هاور روی ویدیوها، پلی خودکار شروع می‌شود',
    'پست‌های وایرال با حاشیه نارنجی متمایز هستند',
    'پست‌هایی که در چند پیج به اشتراک گذاشته شده‌اند، آواتار همه پیج‌ها را نشان می‌دهند',
  ],
};

const SENTIMENT_CONFIG = {
  angry: { color: 'error', icon: 'solar:fire-bold', label: 'خشمگین' },
  hopeful: { color: 'success', icon: 'solar:sun-bold', label: 'امیدوار' },
  neutral: { color: 'default', icon: 'solar:minus-circle-bold', label: 'خنثی' },
  sad: { color: 'info', icon: 'solar:cloud-bold', label: 'غمگین' },
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';

function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('/static/')) return `${SERVER_URL}${url}`;
  return url;
}

// Detect if media URL is a video
function isVideoMedia(url, postType) {
  if (postType === 'video' || postType === 'reel') return true;
  if (!url) return false;
  // Check extension before any query string
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
}

function mediaIdToShortcode(mediaId) {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = BigInt(mediaId);
    let shortcode = '';
    while (id > 0n) {
      shortcode = alphabet[Number(id % 64n)] + shortcode;
      id = id / 64n;
    }
    return shortcode;
  } catch {
    return null;
  }
}


export function PostsListView() {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [outliersOnly, setOutliersOnly] = useState(false);
  const [viewMode, setViewMode] = useState('feed');
  const [page, setPage] = useState(1);
  const [loadMoreCount, setLoadMoreCount] = useState(0); // tracks how many times "load more" was clicked
  const [accumulatedPosts, setAccumulatedPosts] = useState([]); // posts from previous pages
  const [selectedPost, setSelectedPost] = useState(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextText, setContextText] = useState('');
  const [contextSaving, setContextSaving] = useState(false);

  // Advanced filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: clustersData } = useClusters();

  const POSTS_PER_PAGE = 20;
  const MAX_LOAD_MORE = 5; // after 5 clicks, switch to pagination
  const usePagination = loadMoreCount >= MAX_LOAD_MORE;

  const { data: feedData, isLoading: feedLoading, error: feedError, refetch: refetchFeed } = usePostsFeed({
    search: search || undefined,
    sentiment_label: sentimentFilter || undefined,
    post_type: typeFilter || undefined,
    outliers_only: outliersOnly ? 'true' : undefined,
    platform: platformFilter || undefined,
    category: categoryFilter || undefined,
    cluster_id: clusterFilter || undefined,
    country: countryFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    limit: POSTS_PER_PAGE,
  });

  const { data: spikePosts } = useHighImpactPosts(3);
  const { data: clusters, isLoading: clustersLoading } = useTopicClusters();

  const currentPagePosts = feedData?.data || [];
  const total = feedData?.total || 0;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  // Combine accumulated + current page posts, deduplicate by external_id, merge pages
  const allPosts = useMemo(() => {
    const combined = usePagination ? currentPagePosts : [...accumulatedPosts, ...currentPagePosts];
    const map = new Map();
    for (const p of combined) {
      const key = p.external_id || p.id;
      if (map.has(key)) {
        // Merge: collect all pages that share this post
        const existing = map.get(key);
        if (p.page && !existing._allPages.some((pg) => pg.id === p.page.id)) {
          existing._allPages.push(p.page);
        }
      } else {
        map.set(key, { ...p, _allPages: p.page ? [p.page] : [] });
      }
    }
    return Array.from(map.values());
  }, [accumulatedPosts, currentPagePosts, usePagination]);

  const hasMore = !usePagination && page * POSTS_PER_PAGE < total;

  const resetFilters = useCallback(() => {
    setPage(1);
    setLoadMoreCount(0);
    setAccumulatedPosts([]);
  }, []);

  const handleLoadMore = () => {
    // Save current posts before loading next page
    setAccumulatedPosts((prev) => {
      const seen = new Set(prev.map((p) => p.external_id || p.id));
      const newPosts = currentPagePosts.filter((p) => !seen.has(p.external_id || p.id));
      return [...prev, ...newPosts];
    });
    setPage((prev) => prev + 1);
    setLoadMoreCount((prev) => prev + 1);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox {...PAGE_INFO} />

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
              <Card key={post.id} onClick={() => setSelectedPost(post)}
                sx={(theme) => ({
                  p: 2, minWidth: 280, flexShrink: 0, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, transparent 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  '&:hover': { borderColor: alpha(theme.palette.warning.main, 0.5) },
                })}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon="solar:bolt-circle-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                  <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 32, height: 32 }}>{post.page?.name?.[0]}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{post.page?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }} noWrap>
                      {post.caption?.slice(0, 60)}
                    </Typography>
                  </Box>
                  <Chip label={`${((post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0)).toLocaleString()}`} size="small" color="warning" sx={{ fontWeight: 700 }} />
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Search & Filters */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          {/* Row 1: Search + Advanced Filter Button */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              size="small"
              placeholder="جستجو در کپشن پست‌ها..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetFilters(); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-bold-duotone" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearch(''); resetFilters(); }}>
                      <Iconify icon="solar:close-circle-bold" width={18} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant={(platformFilter || categoryFilter || clusterFilter || countryFilter || dateFrom || dateTo) ? 'contained' : 'outlined'}
              startIcon={<Iconify icon="solar:filter-bold-duotone" />}
              onClick={() => setFilterOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              فیلتر پیشرفته
              {(platformFilter || categoryFilter || clusterFilter || countryFilter || dateFrom || dateTo) && ' ●'}
            </Button>
          </Stack>

          {/* Row 2: Sentiment Filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              لحن:
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label="همه"
                size="small"
                variant={sentimentFilter === '' ? 'filled' : 'outlined'}
                color={sentimentFilter === '' ? 'primary' : 'default'}
                onClick={() => { setSentimentFilter(''); resetFilters(); }}
              />
              {Object.entries(SENTIMENT_CONFIG).map(([key, conf]) => (
                <Chip
                  key={key}
                  size="small"
                  label={conf.label}
                  variant={sentimentFilter === key ? 'filled' : 'outlined'}
                  color={sentimentFilter === key ? conf.color : 'default'}
                  icon={<Iconify icon={conf.icon} width={14} />}
                  onClick={() => { setSentimentFilter(sentimentFilter === key ? '' : key); resetFilters(); }}
                />
              ))}
            </Stack>
          </Box>

          {/* Row 3: Post Type Filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              نوع پست:
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label="همه"
                size="small"
                variant={typeFilter === '' ? 'filled' : 'outlined'}
                color={typeFilter === '' ? 'primary' : 'default'}
                onClick={() => { setTypeFilter(''); resetFilters(); }}
              />
              {[
                { value: 'image', label: 'تصویر', icon: 'solar:gallery-bold' },
                { value: 'video', label: 'ویدیو', icon: 'solar:videocamera-bold' },
                { value: 'reel', label: 'ریل', icon: 'solar:videocamera-record-bold' },
                { value: 'story', label: 'استوری', icon: 'solar:stories-bold' },
                { value: 'carousel', label: 'کاروسل', icon: 'solar:gallery-wide-bold' },
              ].map((t) => (
                <Chip
                  key={t.value}
                  size="small"
                  label={t.label}
                  icon={<Iconify icon={t.icon} width={14} />}
                  variant={typeFilter === t.value ? 'filled' : 'outlined'}
                  color={typeFilter === t.value ? 'info' : 'default'}
                  onClick={() => { setTypeFilter(typeFilter === t.value ? '' : t.value); resetFilters(); }}
                />
              ))}
            </Stack>
          </Box>

          {/* Row 4: Quick Filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              فیلترهای سریع:
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label="پست‌های وایرال"
                size="small"
                icon={<Iconify icon="solar:fire-bold" width={14} />}
                variant={outliersOnly ? 'filled' : 'outlined'}
                color={outliersOnly ? 'warning' : 'default'}
                onClick={() => { setOutliersOnly(!outliersOnly); resetFilters(); }}
              />
            </Stack>
          </Box>

          {/* Active Advanced Filters Display */}
          {(platformFilter || categoryFilter || clusterFilter || countryFilter || dateFrom || dateTo) && (
            <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}` })}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  فیلترهای پیشرفته فعال:
                </Typography>
                {platformFilter && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`پلتفرم: ${platformFilter}`}
                    onDelete={() => { setPlatformFilter(''); resetFilters(); }}
                  />
                )}
                {clusterFilter && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`خوشه: ${(clustersData || []).find((c) => c.id === clusterFilter)?.name || clusterFilter}`}
                    onDelete={() => { setClusterFilter(''); resetFilters(); }}
                  />
                )}
                {categoryFilter && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`دسته: ${categoryFilter}`}
                    onDelete={() => { setCategoryFilter(''); resetFilters(); }}
                  />
                )}
                {countryFilter && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`کشور: ${countryFilter}`}
                    onDelete={() => { setCountryFilter(''); resetFilters(); }}
                  />
                )}
                {dateFrom && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`از: ${dateFrom}`}
                    onDelete={() => { setDateFrom(''); resetFilters(); }}
                  />
                )}
                {dateTo && (
                  <Chip size="small" color="primary" variant="outlined"
                    label={`تا: ${dateTo}`}
                    onDelete={() => { setDateTo(''); resetFilters(); }}
                  />
                )}
                <Button size="small" color="error" variant="text"
                  startIcon={<Iconify icon="solar:close-circle-bold" width={14} />}
                  onClick={() => {
                    setPlatformFilter(''); setCategoryFilter(''); setClusterFilter('');
                    setCountryFilter(''); setDateFrom(''); setDateTo('');
                    resetFilters();
                  }}
                  sx={{ fontSize: 11, height: 24 }}
                >
                  پاک کردن همه
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>
      </Card>

      {viewMode === 'feed' ? (
        feedLoading && allPosts.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : feedError && allPosts.length === 0 ? (
          <ActionStateView loading={false} error={feedError} onRetry={refetchFeed}>{null}</ActionStateView>
        ) : allPosts.length === 0 ? (
          <ActionStateView
            loading={false}
            isEmpty
            emptyProps={{
              icon: 'solar:gallery-bold-duotone',
              title: 'محتوایی برای نمایش نیست',
              description: 'با تغییر فیلترها یا اجرای واکشی منابع، محتوای جدید را اینجا ببینید.',
            }}
          >
            {null}
          </ActionStateView>
        ) : (
          <>
            <Grid container spacing={2}>
              {allPosts.map((post) => (
                <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <PostCard post={post} onClick={() => setSelectedPost(post)} />
                </Grid>
              ))}
            </Grid>

            {/* Loading indicator for next page */}
            {feedLoading && allPosts.length > 0 && (
              <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={28} /></Box>
            )}

            {/* Load more button (first 5 pages) */}
            {!feedLoading && hasMore && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={handleLoadMore} startIcon={<Iconify icon="solar:arrow-down-bold" />}>
                  بارگذاری بیشتر
                </Button>
              </Box>
            )}

            {/* Pagination (after 5 load-mores) */}
            {usePagination && totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        )
      ) : (
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
                      <PostCard post={post} compact onClick={() => setSelectedPost(post)} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            ))}
          </Stack>
        )
      )}

      {/* Post Detail Dialog */}
      <PostDetailDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onOpenContext={() => { setContextText(selectedPost?.manual_context || ''); setContextOpen(true); }}
      />

      {/* Manual Context Dialog */}
      <Dialog open={contextOpen} onClose={() => setContextOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:pen-new-square-bold-duotone" width={22} sx={{ color: 'warning.main' }} />
            <span>توضیح دستی محتوا</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            اطلاعاتی که فقط با دیدن ویدیو یا تفسیر تصویر قابل درک است را اینجا بنویسید.
          </Typography>
          <TextField fullWidth multiline rows={4} placeholder="مثال: در این ویدیو شخص در حال سخنرانی درباره ... است"
            value={contextText} onChange={(e) => setContextText(e.target.value)} dir="rtl" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContextOpen(false)}>انصراف</Button>
          <Button variant="contained" color="warning" disabled={contextSaving}
            startIcon={contextSaving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
            onClick={async () => {
              if (!selectedPost) return;
              setContextSaving(true);
              try {
                await axiosInstance.patch(endpoints.posts.context(selectedPost.id), { manual_context: contextText });
                selectedPost.manual_context = contextText;
                setContextOpen(false);
              } catch (err) { console.error('Failed to save context:', err); }
              finally { setContextSaving(false); }
            }}
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Filter Drawer */}
      <Drawer anchor="left" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Box sx={{ width: 320, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>فیلتر پیشرفته</Typography>
            <IconButton size="small" onClick={() => setFilterOpen(false)}>
              <Iconify icon="solar:close-circle-bold" width={22} />
            </IconButton>
          </Stack>

          <Stack spacing={2.5}>
            <TextField select fullWidth size="small" label="پلتفرم" value={platformFilter} onChange={(e) => { setPlatformFilter(e.target.value); resetFilters(); }}>
              <MenuItem value="">همه پلتفرم‌ها</MenuItem>
              <MenuItem value="instagram">اینستاگرام</MenuItem>
              <MenuItem value="twitter">توییتر</MenuItem>
              <MenuItem value="telegram">تلگرام</MenuItem>
            </TextField>

            <TextField select fullWidth size="small" label="خوشه" value={clusterFilter} onChange={(e) => { setClusterFilter(e.target.value); resetFilters(); }}>
              <MenuItem value="">همه خوشه‌ها</MenuItem>
              {(clustersData || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>

            <TextField fullWidth size="small" label="دسته‌بندی موضوعی" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); resetFilters(); }} placeholder="مثلاً: news, activism..." />

            <TextField fullWidth size="small" label="کشور" value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); resetFilters(); }} placeholder="مثلاً: ایران، فلسطین..." />

            <TextField fullWidth size="small" label="از تاریخ" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); resetFilters(); }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField fullWidth size="small" label="تا تاریخ" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); resetFilters(); }}
              InputLabelProps={{ shrink: true }}
            />

            <Button variant="outlined" color="error" fullWidth onClick={() => {
              setPlatformFilter(''); setCategoryFilter(''); setClusterFilter('');
              setCountryFilter(''); setDateFrom(''); setDateTo('');
              resetFilters();
            }}>
              پاک کردن فیلترها
            </Button>

            <Button variant="contained" fullWidth onClick={() => setFilterOpen(false)}>
              اعمال
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </DashboardContent>
  );
}

// --- Post Card ---

function PostCard({ post, compact, onClick }) {
  const sentConf = SENTIMENT_CONFIG[post.sentiment_label] || SENTIMENT_CONFIG.neutral;
  const hasMedia = !!post.media_url;
  const isVideo = isVideoMedia(post.media_url, post.post_type);

  return (
    <Card
      onClick={onClick}
      sx={(theme) => ({
        height: '100%', cursor: 'pointer', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        border: post.is_outlier ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}` : `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
        transition: 'all 0.2s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), boxShadow: theme.shadows[4] },
      })}
    >
      {/* Media */}
      {hasMedia && (
        <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', bgcolor: 'grey.100' }}>
          {isVideo ? (
            <Box component="video" src={getMediaUrl(post.media_url)} muted playsInline preload="metadata"
              onMouseEnter={(e) => e.target.play().catch(() => {})} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box component="img" src={getMediaUrl(post.media_url)} loading="lazy"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          {/* Post type badge */}
          {post.post_type && (
            <Chip label={post.post_type} size="small"
              sx={{ position: 'absolute', top: 8, left: 8, height: 20, fontSize: 9, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
        </Box>
      )}

      {/* No media placeholder */}
      {!hasMedia && (
        <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Iconify icon="solar:gallery-bold-duotone" width={36} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>بدون مدیا</Typography>
        </Box>
      )}

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header — show all pages that share this post */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {(post._allPages?.length > 1) ? (
            <Stack direction="row" sx={{ mr: 0.5 }}>
              {post._allPages.slice(0, 4).map((pg, i) => (
                <Tooltip key={pg.id} title={`@${pg.username}`} arrow>
                  <Avatar src={proxyImage(pg.profile_image_url)} sx={{ width: 26, height: 26, ml: i > 0 ? -0.8 : 0, border: '2px solid', borderColor: 'background.paper', fontSize: 11 }}>{pg.name?.[0]}</Avatar>
                </Tooltip>
              ))}
              {post._allPages.length > 4 && (
                <Avatar sx={{ width: 26, height: 26, ml: -0.8, border: '2px solid', borderColor: 'background.paper', fontSize: 10, bgcolor: 'grey.300' }}>+{post._allPages.length - 4}</Avatar>
              )}
            </Stack>
          ) : (
            <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 28, height: 28 }}>{post.page?.name?.[0]}</Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }} noWrap>
              {post._allPages?.length > 1 ? `${post._allPages.length} پیج` : post.page?.name}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 9 }}>
              {post.published_at ? toJalaliDate(post.published_at) : ''}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {post.is_outlier && <Tooltip title="تعامل غیرعادی" arrow><Box><Iconify icon="solar:bolt-circle-bold-duotone" width={16} sx={{ color: 'warning.main' }} /></Box></Tooltip>}
            {post.is_viral && <Tooltip title="وایرال" arrow><Box><Iconify icon="solar:fire-bold-duotone" width={16} sx={{ color: 'error.main' }} /></Box></Tooltip>}
          </Stack>
        </Stack>

        {/* Caption */}
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.7, mb: 1, display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.caption || '—'}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }} useFlexGap>
          <Chip label={sentConf.label} size="small" color={sentConf.color} variant="outlined" sx={{ height: 20, fontSize: 9 }} icon={<Iconify icon={sentConf.icon} width={12} />} />
          {post.transcription && <Chip label="🎙️" size="small" sx={{ height: 20, fontSize: 9 }} title="دارای رونوشت صوتی" />}
          {post.ocr_text && <Chip label="📝" size="small" sx={{ height: 20, fontSize: 9 }} title="دارای متن تصویر" />}
          {post.manual_context && <Chip label="✍️" size="small" sx={{ height: 20, fontSize: 9 }} title="دارای توضیح دستی" />}
        </Stack>

        {/* Engagement */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 'auto', pt: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>❤️ {post.likes_count?.toLocaleString()}</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>💬 {post.comments_count?.toLocaleString()}</Typography>
          {post.views_count > 0 && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>👁 {post.views_count?.toLocaleString()}</Typography>}
        </Stack>
      </Box>
    </Card>
  );
}

// --- Post Detail Dialog ---

function PostDetailDialog({ post, onClose, onOpenContext }) {
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(''); // current step label
  const [processPercent, setProcessPercent] = useState(0);
  const [processError, setProcessError] = useState(null);
  const [processDone, setProcessDone] = useState(false);

  if (!post) return null;

  const sentConf = SENTIMENT_CONFIG[post.sentiment_label] || SENTIMENT_CONFIG.neutral;
  const platform = post.page?.platform;
  const isStory = post.post_type === 'story';

  // For stories, link to the profile page. For posts, link to the specific post.
  let originalUrl = null;
  if (isStory) {
    // Stories don't have permanent links — link to the account
    if (platform === 'instagram') originalUrl = `https://www.instagram.com/${post.page?.username}/`;
    else if (platform === 'twitter') originalUrl = `https://x.com/${post.page?.username}`;
    else if (platform === 'telegram') originalUrl = `https://t.me/${post.page?.username}`;
  } else {
    if (platform === 'instagram' && post.external_id) {
      const shortcode = post.shortcode || mediaIdToShortcode(post.external_id);
      if (shortcode) originalUrl = `https://www.instagram.com/p/${shortcode}/`;
    } else if (platform === 'twitter') {
      originalUrl = `https://twitter.com/i/status/${post.external_id}`;
    } else if (platform === 'telegram' && post.page?.username) {
      originalUrl = `https://t.me/${post.page.username}/${post.external_id}`;
    }
  }

  const allPages = post._allPages || (post.page ? [post.page] : []);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {allPages.length > 1 ? (
            <Stack direction="row">
              {allPages.slice(0, 3).map((pg, i) => (
                <Avatar key={pg.id} src={proxyImage(pg.profile_image_url)} sx={{ width: 32, height: 32, ml: i > 0 ? -0.8 : 0, border: '2px solid', borderColor: 'background.paper' }}>{pg.name?.[0]}</Avatar>
              ))}
            </Stack>
          ) : (
            <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 32, height: 32 }}>{post.page?.name?.[0]}</Avatar>
          )}
          <Box>
            <Typography variant="subtitle2">
              {allPages.length > 1 ? `${allPages.length} پیج` : post.page?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {allPages.length > 1
                ? allPages.map((pg) => `@${pg.username}`).join(' • ')
                : `@${post.page?.username}`}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Media */}
        {post.media_url && (
          isVideoMedia(post.media_url, post.post_type) ? (
            <Box component="video" src={getMediaUrl(post.media_url)} controls sx={{ width: '100%', maxHeight: 500, borderRadius: 1, mb: 2 }} />
          ) : (
            <Box component="img" src={getMediaUrl(post.media_url)} sx={{ width: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 1, mb: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />
          )
        )}

        {/* Caption */}
        <Typography variant="body2" sx={{ lineHeight: 2, mb: 1 }}>
          {post.caption || 'بدون کپشن'}
        </Typography>

        {/* Farsi translation */}
        {post.caption_fa && (
          <div dir="rtl" style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#e0f7fa', border: '1px solid #b2ebf2', textAlign: 'right' }}>
            <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه فارسی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.caption_fa}</Typography>
          </div>
        )}

        {/* Transcription */}
        {post.transcription && (
          <div dir="rtl" style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#f3e5f5', border: '1px solid #ce93d8', textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#7c4dff' }}>🎙️ رونوشت صوتی/تصویری:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.transcription}</Typography>
            {post.transcription_fa && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ce93d8' }}>
                <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه فارسی رونوشت:</Typography>
                <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.transcription_fa}</Typography>
              </Box>
            )}
          </div>
        )}

        {/* OCR text */}
        {post.ocr_text && (
          <div dir="rtl" style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#fff3e0', border: '1px solid #ffcc80', textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#ff6d00' }}>📝 متن روی تصویر:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.ocr_text}</Typography>
            {post.ocr_text_fa && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ffcc80' }}>
                <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه فارسی:</Typography>
                <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.ocr_text_fa}</Typography>
              </Box>
            )}
          </div>
        )}

        {/* Manual context */}
        {post.manual_context && (
          <div dir="rtl" style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#2e7d32' }}>✍️ توضیح دستی تحلیل‌گر:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.manual_context}</Typography>
          </div>
        )}

        {/* Chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={`❤️ ${post.likes_count?.toLocaleString()}`} size="small" />
          <Chip label={`💬 ${post.comments_count?.toLocaleString()}`} size="small" />
          {post.views_count > 0 && <Chip label={`👁 ${post.views_count?.toLocaleString()}`} size="small" />}
          {post.post_type && <Chip label={post.post_type} size="small" variant="outlined" />}
          <Chip label={sentConf.label} size="small" color={sentConf.color} icon={<Iconify icon={sentConf.icon} width={12} />} />
          {post.published_at && <Chip label={toJalaliDate(post.published_at)} size="small" variant="outlined" />}
        </Stack>

        {/* Topics & Keywords */}
        {post.extracted_topics?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mr: 0.5 }}>موضوعات:</Typography>
            {post.extracted_topics.map((t) => <Chip key={t} label={t} size="small" sx={{ height: 20, fontSize: 9, bgcolor: 'action.hover' }} />)}
          </Stack>
        )}
        {post.extracted_keywords?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mr: 0.5 }}>کلمات:</Typography>
            {post.extracted_keywords.map((k) => <Chip key={k} label={k} size="small" variant="outlined" sx={{ height: 20, fontSize: 9 }} />)}
          </Stack>
        )}

        {/* Action buttons */}
        <Stack spacing={1} sx={{ mt: 2, pb: 1 }}>
          <Stack direction="row" spacing={1}>
            {originalUrl && (
              <Button variant="outlined" fullWidth href={originalUrl} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 12 }}
                startIcon={<Iconify icon={platform === 'instagram' ? 'mdi:instagram' : platform === 'twitter' ? 'mdi:twitter' : 'mdi:telegram'} />}
              >
                {isStory ? 'مشاهده پروفایل' : 'مشاهده پست اصلی'}
              </Button>
            )}
            <Button variant="outlined" fullWidth color="warning" sx={{ fontSize: 12 }}
              startIcon={<Iconify icon="solar:pen-new-square-bold-duotone" />}
              onClick={onOpenContext}
            >
              {post.manual_context ? 'ویرایش توضیح' : 'توضیح دستی'}
            </Button>
          </Stack>
          <Button
            variant="contained" fullWidth color="secondary" sx={{ fontSize: 12 }}
            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold-duotone" />}
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              setProcessDone(false);
              setProcessError(null);
              setProcessStep('شروع پردازش...');
              setProcessPercent(5);
              try {
                // Simulate step progress while waiting for the backend
                const isVideo = ['video', 'reel', 'story'].includes(post.post_type);
                const isImage = post.media_url && ['.jpg', '.jpeg', '.png', '.webp'].some(e => post.media_url.toLowerCase().endsWith(e));

                if (isVideo && !post.is_transcribed) {
                  setProcessStep('رونوشت‌برداری صوتی...');
                  setProcessPercent(15);
                } else if (isImage && !post.ocr_text) {
                  setProcessStep('استخراج متن تصویر...');
                  setProcessPercent(30);
                } else {
                  setProcessStep('ارسال به هوش مصنوعی...');
                  setProcessPercent(40);
                }

                const res = await axiosInstance.post(endpoints.posts.process(post.id));
                const data = res.data?.data;

                setProcessStep('ذخیره نتایج...');
                setProcessPercent(90);

                if (data?.post) Object.assign(post, data.post);

                setProcessPercent(100);
                setProcessStep('تکمیل شد');
                setProcessDone(true);
              } catch (err) {
                setProcessError(err.message);
              } finally {
                setProcessing(false);
              }
            }}
          >
            {processing ? processStep : 'پردازش هوشمند پست'}
          </Button>

          {/* Progress bar while processing */}
          {processing && (
            <Box sx={(theme) => ({ px: 0.5, py: 1, borderRadius: 1, bgcolor: alpha(theme.palette.secondary.main, 0.06), border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}` })}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <CircularProgress size={12} color="secondary" thickness={5} />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, flex: 1 }} color="secondary.main">{processStep}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }} color="secondary.main">{processPercent}%</Typography>
              </Stack>
              <LinearProgress variant={processPercent === 0 ? 'indeterminate' : 'determinate'} value={processPercent} color="secondary" sx={{ height: 4, borderRadius: 1 }} />
            </Box>
          )}

          {/* Done state */}
          {processDone && !processing && (
            <Box sx={(theme) => ({ px: 1.5, py: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` })}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, fontSize: 11 }}>پردازش با موفقیت انجام شد</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={100} color="success" sx={{ height: 4, borderRadius: 1, mt: 0.5 }} />
            </Box>
          )}

          {/* Error state */}
          {processError && !processing && (
            <Box sx={(theme) => ({ px: 1.5, py: 1, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.06), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` })}>
              <Typography variant="caption" color="error.main" sx={{ fontSize: 11 }}>❌ {processError}</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
