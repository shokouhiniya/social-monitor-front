'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
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
import { useDefinitions, usePlatformOptions } from 'src/api/definitions';

import { Iconify } from 'src/components/iconify';
import { ActionStateView } from 'src/components/action-state';
import { JalaliDatePicker } from 'src/components/jalali-date-picker';

// ----------------------------------------------------------------------

const SENTIMENT_CONFIG = {
  angry:   { color: 'error',   icon: 'solar:fire-bold',          label: 'خشمگین' },
  hopeful: { color: 'success', icon: 'solar:sun-bold',           label: 'امیدوار' },
  neutral: { color: 'default', icon: 'solar:minus-circle-bold',  label: 'خنثی' },
  sad:     { color: 'info',    icon: 'solar:cloud-bold',         label: 'غمگین' },
};

const POST_TYPES = [
  { value: 'image',    label: 'تصویر',   icon: 'solar:gallery-bold' },
  { value: 'video',    label: 'ویدیو',   icon: 'solar:videocamera-bold' },
  { value: 'reel',     label: 'ریل',     icon: 'solar:videocamera-record-bold' },
  { value: 'story',    label: 'استوری',  icon: 'solar:stories-bold' },
  { value: 'carousel', label: 'کاروسل', icon: 'solar:gallery-wide-bold' },
];

const SORT_OPTIONS = [
  { value: 'published_at:DESC',  label: 'جدیدترین' },
  { value: 'published_at:ASC',   label: 'قدیمی‌ترین' },
  { value: 'likes_count:DESC',   label: 'بیشترین لایک' },
  { value: 'views_count:DESC',   label: 'بیشترین بازدید' },
  { value: 'comments_count:DESC',label: 'بیشترین کامنت' },
  { value: 'shares_count:DESC',  label: 'بیشترین اشتراک' },
];

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';

function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('/static/')) return `${SERVER_URL}${url}`;
  return url;
}

function isVideoMedia(url, postType) {
  if (postType === 'video' || postType === 'reel') return true;
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm');
}

function mediaIdToShortcode(mediaId) {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = BigInt(mediaId);
    let shortcode = '';
    while (id > 0n) { shortcode = alphabet[Number(id % 64n)] + shortcode; id = id / 64n; }
    return shortcode;
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Sidebar
// ─────────────────────────────────────────────────────────────────────────────

function FilterSidebar({
  search, setSearch,
  sentimentFilter, setSentimentFilter,
  typeFilter, setTypeFilter,
  outliersOnly, setOutliersOnly,
  platformFilter, setPlatformFilter,
  clusterFilter, setClusterFilter,
  identityFilter, setIdentityFilter,
  countryFilter, setCountryFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  sortValue, setSortValue,
  onReset,
  activeCount,
  clustersData,
  platformOptions,
  identities,
}) {
  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'sticky',
        top: 80,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:filter-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>فیلترها</Typography>
          {activeCount > 0 && (
            <Chip size="small" label={activeCount} color="primary" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
          )}
        </Stack>
        {activeCount > 0 && (
          <Tooltip title="پاک کردن همه فیلترها">
            <IconButton size="small" color="error" onClick={onReset}>
              <Iconify icon="solar:close-circle-bold" width={16} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Search */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            جستجو
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="کپشن، کلمه کلیدی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold-duotone" width={16} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <Iconify icon="solar:close-circle-bold" width={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        <Divider />

        {/* Sentiment */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            لحن محتوا
          </Typography>
          <Stack spacing={0.5}>
            <Box
              onClick={() => setSentimentFilter('')}
              sx={{
                px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer',
                bgcolor: sentimentFilter === '' ? 'primary.lighter' : 'transparent',
                border: '1px solid',
                borderColor: sentimentFilter === '' ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: sentimentFilter === '' ? 700 : 400, color: sentimentFilter === '' ? 'primary.main' : 'text.secondary' }}>
                همه
              </Typography>
            </Box>
            {Object.entries(SENTIMENT_CONFIG).map(([key, conf]) => (
              <Box
                key={key}
                onClick={() => setSentimentFilter(sentimentFilter === key ? '' : key)}
                sx={{
                  px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: sentimentFilter === key ? `${conf.color}.lighter` : 'transparent',
                  border: '1px solid',
                  borderColor: sentimentFilter === key ? `${conf.color}.main` : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon={conf.icon} width={14} sx={{ color: `${conf.color}.main` }} />
                <Typography variant="caption" sx={{ fontWeight: sentimentFilter === key ? 700 : 400, color: sentimentFilter === key ? `${conf.color}.main` : 'text.secondary' }}>
                  {conf.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Post type */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            نوع محتوا
          </Typography>
          <Stack spacing={0.5}>
            <Box
              onClick={() => setTypeFilter('')}
              sx={{
                px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer',
                bgcolor: typeFilter === '' ? 'primary.lighter' : 'transparent',
                border: '1px solid', borderColor: typeFilter === '' ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: typeFilter === '' ? 700 : 400, color: typeFilter === '' ? 'primary.main' : 'text.secondary' }}>همه</Typography>
            </Box>
            {POST_TYPES.map((t) => (
              <Box
                key={t.value}
                onClick={() => setTypeFilter(typeFilter === t.value ? '' : t.value)}
                sx={{
                  px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: typeFilter === t.value ? 'info.lighter' : 'transparent',
                  border: '1px solid', borderColor: typeFilter === t.value ? 'info.main' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon={t.icon} width={14} sx={{ color: typeFilter === t.value ? 'info.main' : 'text.disabled' }} />
                <Typography variant="caption" sx={{ fontWeight: typeFilter === t.value ? 700 : 400, color: typeFilter === t.value ? 'info.main' : 'text.secondary' }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Quick filters */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            فیلتر سریع
          </Typography>
          <Box
            onClick={() => setOutliersOnly(!outliersOnly)}
            sx={{
              px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: outliersOnly ? 'warning.lighter' : 'transparent',
              border: '1px solid', borderColor: outliersOnly ? 'warning.main' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:fire-bold-duotone" width={14} sx={{ color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: outliersOnly ? 700 : 400, color: outliersOnly ? 'warning.main' : 'text.secondary' }}>
              فقط وایرال‌ها
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Platform */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            سکو (پلتفرم)
          </Typography>
          <TextField
            select size="small" fullWidth
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <MenuItem value="">همه سکوها</MenuItem>
            {(platformOptions ?? []).map((p) => (
              <MenuItem key={p.key} value={p.key}>{p.label || p.key}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Cluster */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            خوشه موضوعی
          </Typography>
          <TextField
            select size="small" fullWidth
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
          >
            <MenuItem value="">همه خوشه‌ها</MenuItem>
            {(clustersData ?? []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Identity */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            هویت میکرورسانه
          </Typography>
          <TextField
            select size="small" fullWidth
            value={identityFilter}
            onChange={(e) => setIdentityFilter(e.target.value)}
          >
            <MenuItem value="">همه هویت‌ها</MenuItem>
            {(identities ?? []).map((i) => (
              <MenuItem key={i.id} value={i.title}>{i.title}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Country */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            کشور
          </Typography>
          <TextField
            size="small" fullWidth placeholder="مثلاً: ایران"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        </Box>

        <Divider />

        {/* Date range */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            بازه تاریخی
          </Typography>
          <Stack spacing={1}>
            <JalaliDatePicker
              label="از تاریخ"
              value={dateFrom}
              onChange={(v) => setDateFrom(v)}
            />
            <JalaliDatePicker
              label="تا تاریخ"
              value={dateTo}
              onChange={(v) => setDateTo(v)}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Sort */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            مرتب‌سازی
          </Typography>
          <TextField
            select size="small" fullWidth
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────────────────────

export function PostsListView({ fixedMicroMediaId, fixedTitle } = {}) {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [outliersOnly, setOutliersOnly] = useState(false);
  const [viewMode, setViewMode] = useState('feed');
  const [page, setPage] = useState(1);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [accumulatedPosts, setAccumulatedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextText, setContextText] = useState('');
  const [contextSaving, setContextSaving] = useState(false);

  // Advanced filters
  const [platformFilter, setPlatformFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [identityFilter, setIdentityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortValue, setSortValue] = useState('published_at:DESC');

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: clustersData } = useClusters();
  const { data: platformOptions } = usePlatformOptions();
  const { data: identities } = useDefinitions('identity');

  const POSTS_PER_PAGE = 20;
  const MAX_LOAD_MORE = 5;
  const usePagination = loadMoreCount >= MAX_LOAD_MORE;

  const [sortBy, sortDir] = sortValue.split(':');

  const { data: feedData, isLoading: feedLoading, error: feedError, refetch: refetchFeed } = usePostsFeed({
    search: search || undefined,
    sentiment_label: sentimentFilter || undefined,
    post_type: typeFilter || undefined,
    outliers_only: outliersOnly ? 'true' : undefined,
    platform: platformFilter || undefined,
    cluster_id: clusterFilter || undefined,
    country: countryFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    micro_media_id: fixedMicroMediaId || undefined,
    sort_by: sortBy !== 'published_at' ? sortBy : undefined,
    sort_dir: sortDir !== 'DESC' ? sortDir : undefined,
    page,
    limit: POSTS_PER_PAGE,
  });

  const { data: spikePosts } = useHighImpactPosts(3);
  const { data: topicClusters, isLoading: clustersLoading } = useTopicClusters();

  const currentPagePosts = feedData?.data || [];
  const total = feedData?.total || 0;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const allPosts = useMemo(() => {
    const combined = usePagination ? currentPagePosts : [...accumulatedPosts, ...currentPagePosts];
    const map = new Map();
    for (const p of combined) {
      const key = p.external_id || p.id;
      if (map.has(key)) {
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

  const handleReset = useCallback(() => {
    setSearch('');
    setSentimentFilter('');
    setTypeFilter('');
    setOutliersOnly(false);
    setPlatformFilter('');
    setClusterFilter('');
    setIdentityFilter('');
    setCountryFilter('');
    setDateFrom('');
    setDateTo('');
    setSortValue('published_at:DESC');
    resetFilters();
  }, [resetFilters]);

  const handleLoadMore = () => {
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

  // شمارش فیلترهای فعال
  const activeFilterCount = [
    search, sentimentFilter, typeFilter, outliersOnly,
    platformFilter, clusterFilter, identityFilter, countryFilter, dateFrom, dateTo,
  ].filter(Boolean).length;

  const filterProps = {
    search, setSearch: (v) => { setSearch(v); resetFilters(); },
    sentimentFilter, setSentimentFilter: (v) => { setSentimentFilter(v); resetFilters(); },
    typeFilter, setTypeFilter: (v) => { setTypeFilter(v); resetFilters(); },
    outliersOnly, setOutliersOnly: (v) => { setOutliersOnly(v); resetFilters(); },
    platformFilter, setPlatformFilter: (v) => { setPlatformFilter(v); resetFilters(); },
    clusterFilter, setClusterFilter: (v) => { setClusterFilter(v); resetFilters(); },
    identityFilter, setIdentityFilter: (v) => { setIdentityFilter(v); resetFilters(); },
    countryFilter, setCountryFilter: (v) => { setCountryFilter(v); resetFilters(); },
    dateFrom, setDateFrom: (v) => { setDateFrom(v); resetFilters(); },
    dateTo, setDateTo: (v) => { setDateTo(v); resetFilters(); },
    sortValue, setSortValue: (v) => { setSortValue(v); resetFilters(); },
    onReset: handleReset,
    activeCount: activeFilterCount,
    clustersData,
    platformOptions,
    identities,
  };

  return (
    <DashboardContent maxWidth="xl" sx={{ pt: 2 }}>
      {/* ─── Header ─── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {fixedTitle || 'پایش محتوا'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {feedLoading ? '...' : `${total.toLocaleString()} محتوا`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} فیلتر فعال`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Mobile filter toggle */}
          <Badge badgeContent={activeFilterCount} color="primary" sx={{ display: { md: 'none' } }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:filter-bold-duotone" />}
              onClick={() => setMobileFilterOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              فیلتر
            </Button>
          </Badge>
          {/* View toggle */}
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => { if (v) setViewMode(v); }}
          >
            <ToggleButton value="feed">
              <Iconify icon="solar:widget-bold" width={18} />
            </ToggleButton>
            <ToggleButton value="cluster">
              <Iconify icon="solar:atom-bold" width={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* ─── Spike bar ─── */}
      {spikePosts?.length > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 2, overflow: 'auto', pb: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:bolt-circle-bold-duotone" width={16} sx={{ color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', whiteSpace: 'nowrap' }}>
              پرتعامل:
            </Typography>
          </Stack>
          {spikePosts.map((post) => (
            <Chip
              key={post.id}
              size="small"
              avatar={<Avatar src={proxyImage(post.page?.profile_image_url)}>{post.page?.name?.[0]}</Avatar>}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" noWrap sx={{ maxWidth: 120, fontSize: 11 }}>
                    {post.caption?.slice(0, 40) || post.page?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, color: 'warning.main' }}>
                    ❤️ {((post.likes_count || 0) + (post.comments_count || 0)).toLocaleString()}
                  </Typography>
                </Stack>
              }
              onClick={() => setSelectedPost(post)}
              sx={(t) => ({
                height: 28, cursor: 'pointer',
                bgcolor: alpha(t.palette.warning.main, 0.08),
                border: `1px solid ${alpha(t.palette.warning.main, 0.25)}`,
                '&:hover': { bgcolor: alpha(t.palette.warning.main, 0.15) },
              })}
            />
          ))}
        </Stack>
      )}

      {/* ─── Active filter chips ─── */}
      {activeFilterCount > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          {search && <Chip size="small" label={`جستجو: ${search}`} onDelete={() => { setSearch(''); resetFilters(); }} />}
          {sentimentFilter && <Chip size="small" color={SENTIMENT_CONFIG[sentimentFilter]?.color} label={`لحن: ${SENTIMENT_CONFIG[sentimentFilter]?.label}`} onDelete={() => { setSentimentFilter(''); resetFilters(); }} />}
          {typeFilter && <Chip size="small" color="info" label={`نوع: ${POST_TYPES.find((t) => t.value === typeFilter)?.label || typeFilter}`} onDelete={() => { setTypeFilter(''); resetFilters(); }} />}
          {outliersOnly && <Chip size="small" color="warning" label="وایرال" onDelete={() => { setOutliersOnly(false); resetFilters(); }} />}
          {platformFilter && <Chip size="small" label={`سکو: ${(platformOptions ?? []).find((p) => p.key === platformFilter)?.label || platformFilter}`} onDelete={() => { setPlatformFilter(''); resetFilters(); }} />}
          {clusterFilter && <Chip size="small" color="warning" label={`خوشه: ${(clustersData ?? []).find((c) => c.id === clusterFilter)?.name || clusterFilter}`} onDelete={() => { setClusterFilter(''); resetFilters(); }} />}
          {identityFilter && <Chip size="small" color="info" label={`هویت: ${identityFilter}`} onDelete={() => { setIdentityFilter(''); resetFilters(); }} />}
          {countryFilter && <Chip size="small" label={`کشور: ${countryFilter}`} onDelete={() => { setCountryFilter(''); resetFilters(); }} />}
          {dateFrom && <Chip size="small" label={`از: ${dateFrom}`} onDelete={() => { setDateFrom(''); resetFilters(); }} />}
          {dateTo && <Chip size="small" label={`تا: ${dateTo}`} onDelete={() => { setDateTo(''); resetFilters(); }} />}
          <Chip
            size="small"
            color="error"
            variant="outlined"
            label="پاک کردن همه"
            icon={<Iconify icon="solar:close-circle-bold" width={14} />}
            onClick={handleReset}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      )}

      {/* ─── Body: Sidebar + Content ─── */}
      <Stack direction="row" spacing={2} alignItems="flex-start">

        {/* Sidebar — desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <FilterSidebar {...filterProps} />
        </Box>

        {/* Content area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {viewMode === 'feed' ? (
            feedLoading && allPosts.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            ) : feedError && allPosts.length === 0 ? (
              <ActionStateView loading={false} error={feedError} onRetry={refetchFeed}>{null}</ActionStateView>
            ) : allPosts.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <Iconify icon="solar:gallery-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">محتوایی یافت نشد</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                  فیلترها را تغییر دهید یا منابع را بروزرسانی کنید
                </Typography>
                {activeFilterCount > 0 && (
                  <Button size="small" onClick={handleReset} sx={{ mt: 2 }}>
                    پاک کردن فیلترها
                  </Button>
                )}
              </Card>
            ) : (
              <>
                <Grid container spacing={1.5}>
                  {allPosts.map((post) => (
                    <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <PostCard post={post} onClick={() => setSelectedPost(post)} />
                    </Grid>
                  ))}
                </Grid>

                {feedLoading && allPosts.length > 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                )}

                {!feedLoading && hasMore && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button variant="outlined" onClick={handleLoadMore} startIcon={<Iconify icon="solar:arrow-down-bold" />}>
                      بارگذاری بیشتر ({total - allPosts.length} مانده)
                    </Button>
                  </Box>
                )}

                {usePagination && totalPages > 1 && (
                  <Stack alignItems="center" sx={{ mt: 3 }}>
                    <Pagination
                      count={totalPages} page={page} onChange={handlePageChange}
                      color="primary" shape="rounded" showFirstButton showLastButton
                    />
                  </Stack>
                )}
              </>
            )
          ) : (
            clustersLoading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
              <Stack spacing={2}>
                {(topicClusters || []).map((cluster) => (
                  <Card key={cluster.topic} sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Iconify icon="solar:atom-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{cluster.topic}</Typography>
                      <Chip label={`${cluster.count} محتوا`} size="small" color="primary" variant="soft" />
                    </Stack>
                    <Grid container spacing={1.5}>
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
        </Box>
      </Stack>

      {/* ─── Mobile filter drawer ─── */}
      <Drawer anchor="right" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)}
        PaperProps={{ sx: { width: 280, p: 0 } }}
      >
        <FilterSidebar {...filterProps} />
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="contained" fullWidth onClick={() => setMobileFilterOpen(false)}>
            اعمال فیلترها
          </Button>
        </Box>
      </Drawer>

      {/* ─── Post detail dialog ─── */}
      <PostDetailDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onOpenContext={() => { setContextText(selectedPost?.manual_context || ''); setContextOpen(true); }}
      />

      {/* ─── Manual context dialog ─── */}
      <Dialog open={contextOpen} onClose={() => setContextOpen(false)} maxWidth="sm" fullWidth>
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
          <TextField
            fullWidth multiline rows={4}
            placeholder="مثال: در این ویدیو شخص در حال سخنرانی درباره ... است"
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            dir="rtl"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContextOpen(false)}>انصراف</Button>
          <Button
            variant="contained" color="warning" disabled={contextSaving}
            startIcon={contextSaving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
            onClick={async () => {
              if (!selectedPost) return;
              setContextSaving(true);
              try {
                await axiosInstance.patch(endpoints.posts.context(selectedPost.id), { manual_context: contextText });
                selectedPost.manual_context = contextText;
                setContextOpen(false);
              } catch (err) { console.error(err); }
              finally { setContextSaving(false); }
            }}
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Card
// ─────────────────────────────────────────────────────────────────────────────

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
        border: post.is_viral
          ? `1px solid ${alpha(theme.palette.error.main, 0.4)}`
          : post.is_outlier
            ? `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
            : `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
        transition: 'all 0.2s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), boxShadow: theme.shadows[4] },
      })}
    >
      {/* Media */}
      {hasMedia ? (
        <Box sx={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', bgcolor: 'grey.100' }}>
          {isVideo ? (
            <Box
              component="video"
              src={getMediaUrl(post.media_url)}
              muted playsInline preload="metadata"
              onMouseEnter={(e) => e.target.play().catch(() => {})}
              onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box
              component="img"
              src={getMediaUrl(post.media_url)}
              loading="lazy"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          {/* badges */}
          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 6, left: 6 }}>
            {post.post_type && (
              <Chip label={post.post_type} size="small"
                sx={{ height: 18, fontSize: 9, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
            {post.is_viral && (
              <Chip
                icon={<Iconify icon="solar:fire-bold" width={10} />}
                label="وایرال" size="small"
                sx={{ height: 18, fontSize: 9, bgcolor: 'error.main', color: '#fff', '& .MuiChip-label': { px: 0.5 } }}
              />
            )}
          </Stack>
        </Box>
      ) : (
        <Box sx={{
          aspectRatio: '3/4', bgcolor: 'grey.50', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1,
        }}>
          <Iconify icon="solar:document-text-bold-duotone" width={32} sx={{ color: 'text.disabled' }} />
        </Box>
      )}

      <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Page info */}
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
          {(post._allPages?.length > 1) ? (
            <Stack direction="row">
              {post._allPages.slice(0, 3).map((pg, i) => (
                <Avatar key={pg.id} src={proxyImage(pg.profile_image_url)}
                  sx={{ width: 22, height: 22, ml: i > 0 ? -0.6 : 0, border: '2px solid', borderColor: 'background.paper', fontSize: 10 }}
                >{pg.name?.[0]}</Avatar>
              ))}
            </Stack>
          ) : (
            <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 22, height: 22, fontSize: 10 }}>
              {post.page?.name?.[0]}
            </Avatar>
          )}
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, flex: 1 }} noWrap>
            {post._allPages?.length > 1 ? `${post._allPages.length} حساب` : post.page?.name}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, flexShrink: 0 }}>
            {post.published_at ? toJalaliDate(post.published_at) : ''}
          </Typography>
        </Stack>

        {/* Caption */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: 11, lineHeight: 1.7, mb: 1, flex: 1,
            display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {post.caption || '—'}
        </Typography>

        {/* Footer */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* sentiment + extras */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={sentConf.label} size="small"
              color={sentConf.color} variant="outlined"
              icon={<Iconify icon={sentConf.icon} width={10} />}
              sx={{ height: 18, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }}
            />
            {post.transcription && <Tooltip title="رونوشت صوتی"><span>🎙️</span></Tooltip>}
            {post.ocr_text && <Tooltip title="متن تصویر"><span>📝</span></Tooltip>}
            {post.manual_context && <Tooltip title="توضیح دستی"><span>✍️</span></Tooltip>}
          </Stack>
          {/* engagement */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
              ❤️ {(post.likes_count || 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
              💬 {(post.comments_count || 0).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Detail Dialog
// ─────────────────────────────────────────────────────────────────────────────

function PostDetailDialog({ post, onClose, onOpenContext }) {
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [processPercent, setProcessPercent] = useState(0);
  const [processError, setProcessError] = useState(null);
  const [processDone, setProcessDone] = useState(false);

  if (!post) return null;

  const sentConf = SENTIMENT_CONFIG[post.sentiment_label] || SENTIMENT_CONFIG.neutral;
  const platform = post.page?.platform;
  const isStory = post.post_type === 'story';

  let originalUrl = null;
  if (isStory) {
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
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, maxHeight: '92vh' } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {allPages.length > 1 ? (
            <Stack direction="row">
              {allPages.slice(0, 3).map((pg, i) => (
                <Avatar key={pg.id} src={proxyImage(pg.profile_image_url)}
                  sx={{ width: 32, height: 32, ml: i > 0 ? -0.8 : 0, border: '2px solid', borderColor: 'background.paper' }}
                >{pg.name?.[0]}</Avatar>
              ))}
            </Stack>
          ) : (
            <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 32, height: 32 }}>
              {post.page?.name?.[0]}
            </Avatar>
          )}
          <Box>
            <Typography variant="subtitle2">
              {allPages.length > 1 ? `${allPages.length} حساب` : post.page?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {allPages.length > 1
                ? allPages.map((pg) => `@${pg.username}`).join(' · ')
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
            <Box component="video" src={getMediaUrl(post.media_url)} controls
              sx={{ width: '100%', maxHeight: 480, borderRadius: 1, mb: 2 }}
            />
          ) : (
            <Box component="img" src={getMediaUrl(post.media_url)}
              onError={(e) => { e.target.style.display = 'none'; }}
              sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1, mb: 2 }}
            />
          )
        )}

        {/* Stats chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={`❤️ ${(post.likes_count || 0).toLocaleString()}`} size="small" />
          <Chip label={`💬 ${(post.comments_count || 0).toLocaleString()}`} size="small" />
          {post.views_count > 0 && <Chip label={`👁 ${(post.views_count || 0).toLocaleString()}`} size="small" />}
          {post.shares_count > 0 && <Chip label={`↪️ ${(post.shares_count || 0).toLocaleString()}`} size="small" />}
          {post.post_type && <Chip label={post.post_type} size="small" variant="outlined" />}
          <Chip label={sentConf.label} size="small" color={sentConf.color} icon={<Iconify icon={sentConf.icon} width={12} />} />
          {post.published_at && <Chip label={toJalaliDate(post.published_at)} size="small" variant="outlined" />}
        </Stack>

        {/* Caption */}
        {post.caption && (
          <Typography variant="body2" sx={{ lineHeight: 2, mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
            {post.caption}
          </Typography>
        )}

        {/* Farsi */}
        {post.caption_fa && (
          <Alert severity="info" icon={<span>🔤</span>} sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>ترجمه فارسی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.caption_fa}</Typography>
          </Alert>
        )}

        {/* Transcription */}
        {post.transcription && (
          <Alert severity="secondary" icon={<span>🎙️</span>} sx={{ mb: 1.5, bgcolor: alpha('#7c4dff', 0.06), borderColor: alpha('#7c4dff', 0.2) }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#7c4dff' }}>رونوشت صوتی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.transcription}</Typography>
            {post.transcription_fa && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>ترجمه:</Typography>
                <Typography variant="body2">{post.transcription_fa}</Typography>
              </Box>
            )}
          </Alert>
        )}

        {/* OCR */}
        {post.ocr_text && (
          <Alert severity="warning" icon={<span>📝</span>} sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>متن روی تصویر:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.ocr_text}</Typography>
          </Alert>
        )}

        {/* Manual context */}
        {post.manual_context && (
          <Alert severity="success" icon={<span>✍️</span>} sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>توضیح تحلیل‌گر:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.manual_context}</Typography>
          </Alert>
        )}

        {/* Topics & keywords */}
        {post.extracted_topics?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, alignSelf: 'center' }}>موضوعات:</Typography>
            {post.extracted_topics.map((t) => (
              <Chip key={t} label={t} size="small" sx={{ height: 20, fontSize: 9 }} />
            ))}
          </Stack>
        )}
        {post.extracted_keywords?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, alignSelf: 'center' }}>کلمات کلیدی:</Typography>
            {post.extracted_keywords.map((k) => (
              <Chip key={k} label={k} size="small" variant="outlined" sx={{ height: 20, fontSize: 9 }} />
            ))}
          </Stack>
        )}

        {/* Actions */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1}>
            {originalUrl && (
              <Button
                variant="outlined" fullWidth href={originalUrl} target="_blank"
                rel="noopener noreferrer" sx={{ fontSize: 12 }}
                startIcon={<Iconify icon="solar:link-bold" />}
              >
                {isStory ? 'مشاهده پروفایل' : 'پست اصلی'}
              </Button>
            )}
            <Button
              variant="outlined" fullWidth color="warning" sx={{ fontSize: 12 }}
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
              setProcessStep('در حال پردازش...');
              setProcessPercent(10);
              try {
                const res = await axiosInstance.post(endpoints.posts.process(post.id));
                const data = res.data?.data;
                setProcessPercent(100);
                setProcessStep('تکمیل شد');
                setProcessDone(true);
                if (data?.post) Object.assign(post, data.post);
              } catch (err) {
                setProcessError(err.message);
              } finally {
                setProcessing(false);
              }
            }}
          >
            {processing ? processStep : 'پردازش هوشمند (AI)'}
          </Button>

          {processing && (
            <LinearProgress variant="determinate" value={processPercent} color="secondary" sx={{ borderRadius: 1 }} />
          )}
          {processDone && !processing && (
            <Alert severity="success" sx={{ py: 0.5 }}>پردازش با موفقیت انجام شد</Alert>
          )}
          {processError && !processing && (
            <Alert severity="error" sx={{ py: 0.5 }}>{processError}</Alert>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
