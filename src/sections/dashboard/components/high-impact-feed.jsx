'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalaliDate } from 'src/utils/format-jalali';
import { proxyImage } from 'src/utils/proxy-image';

import { useHighImpactPosts } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';
const SENTIMENT_COLORS = { angry: 'error', hopeful: 'success', neutral: 'default', sad: 'info' };

function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('/static/')) return `${SERVER_URL}${url}`;
  return url;
}

function mediaIdToShortcode(mediaId) {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = BigInt(mediaId);
    let sc = '';
    while (id > 0n) { sc = alphabet[Number(id % 64n)] + sc; id = id / 64n; }
    return sc;
  } catch { return null; }
}

export function HighImpactFeed() {
  const { data, isLoading } = useHighImpactPosts(5);
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <>
      <ChartCard
        title="پست‌های جریان‌ساز"
        icon="solar:bolt-circle-bold-duotone"
        info="پست‌هایی که در ۷ روز اخیر بیشترین تعامل (لایک + کامنت + شیر) را داشته‌اند"
      >
        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : (data || []).length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">پستی یافت نشد</Typography></Box>
        ) : (
          <Stack spacing={1.5}>
            {(data || []).map((post, idx) => {
              const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
              return (
                <Box key={post.id} onClick={() => setSelectedPost(post)}
                  sx={(theme) => ({
                    p: 2, borderRadius: 1.5, cursor: 'pointer',
                    bgcolor: idx === 0 ? alpha(theme.palette.warning.main, 0.06) : alpha(theme.palette.grey[500], 0.04),
                    border: idx === 0 ? `1px solid ${alpha(theme.palette.warning.main, 0.15)}` : `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), boxShadow: theme.shadows[2] },
                  })}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    {idx === 0 && <Iconify icon="solar:fire-bold-duotone" width={20} sx={{ color: 'warning.main', mt: 0.25, flexShrink: 0 }} />}
                    <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 32, height: 32, mt: 0.25 }}>{post.page?.name?.[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{post.page?.name}</Typography>
                        <Chip label={`${engagement.toLocaleString()} تعامل`} size="small" color={idx === 0 ? 'warning' : 'default'} variant={idx === 0 ? 'filled' : 'outlined'} sx={{ height: 20, fontSize: 10 }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.caption || '—'}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}><Iconify icon="solar:heart-bold" width={13} sx={{ color: 'error.main' }} /><Typography variant="caption" sx={{ fontSize: 10 }}>{post.likes_count?.toLocaleString()}</Typography></Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}><Iconify icon="solar:chat-round-dots-bold" width={13} sx={{ color: 'info.main' }} /><Typography variant="caption" sx={{ fontSize: 10 }}>{post.comments_count?.toLocaleString()}</Typography></Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}><Iconify icon="solar:share-bold" width={13} sx={{ color: 'warning.main' }} /><Typography variant="caption" sx={{ fontSize: 10 }}>{post.shares_count?.toLocaleString()}</Typography></Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </ChartCard>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <PostPopup post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}

// Inline post popup — same design as the posts page dialog
function PostPopup({ post, onClose }) {
  const platform = post.page?.platform;
  const isStory = post.post_type === 'story';

  let originalUrl = null;
  if (isStory) {
    if (platform === 'instagram') originalUrl = `https://www.instagram.com/${post.page?.username}/`;
    else if (platform === 'telegram') originalUrl = `https://t.me/${post.page?.username}`;
  } else if (platform === 'instagram' && post.external_id) {
    const sc = post.shortcode || mediaIdToShortcode(post.external_id);
    if (sc) originalUrl = `https://www.instagram.com/p/${sc}/`;
  } else if (platform === 'twitter') {
    originalUrl = `https://twitter.com/i/status/${post.external_id}`;
  } else if (platform === 'telegram' && post.page?.username) {
    originalUrl = `https://t.me/${post.page.username}/${post.external_id}`;
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar src={proxyImage(post.page?.profile_image_url)} sx={{ width: 32, height: 32 }}>{post.page?.name?.[0]}</Avatar>
          <Box>
            <Typography variant="subtitle2">{post.page?.name}</Typography>
            <Typography variant="caption" color="text.secondary">@{post.page?.username}</Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}><Iconify icon="solar:close-circle-bold" width={22} /></IconButton>
      </DialogTitle>
      <DialogContent>
        {post.media_url && (
          post.media_url.endsWith('.mp4') ? (
            <Box component="video" src={getMediaUrl(post.media_url)} controls sx={{ width: '100%', maxHeight: 500, borderRadius: 1, mb: 2 }} />
          ) : (
            <Box component="img" src={getMediaUrl(post.media_url)} sx={{ width: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 1, mb: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />
          )
        )}

        <Typography variant="body2" sx={{ lineHeight: 2, mb: 1 }}>{post.caption || 'بدون کپشن'}</Typography>

        {post.caption_fa && (
          <Box dir="rtl" sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: '#e0f7fa', border: '1px solid #b2ebf2' }}>
            <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه فارسی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.caption_fa}</Typography>
          </Box>
        )}

        {post.transcription && (
          <Box dir="rtl" sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: '#f3e5f5', border: '1px solid #ce93d8' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#7c4dff' }}>🎙️ رونوشت صوتی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.transcription}</Typography>
            {post.transcription_fa && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ce93d8' }}>
                <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه:</Typography>
                <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.transcription_fa}</Typography>
              </Box>
            )}
          </Box>
        )}

        {post.ocr_text && (
          <Box dir="rtl" sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: '#fff3e0', border: '1px solid #ffcc80' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#ff6d00' }}>📝 متن تصویر:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.ocr_text}</Typography>
            {post.ocr_text_fa && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ffcc80' }}>
                <Typography variant="caption" color="info.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>🔤 ترجمه:</Typography>
                <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.ocr_text_fa}</Typography>
              </Box>
            )}
          </Box>
        )}

        {post.manual_context && (
          <Box dir="rtl" sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#2e7d32' }}>✍️ توضیح دستی:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{post.manual_context}</Typography>
          </Box>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={`❤️ ${post.likes_count?.toLocaleString()}`} size="small" />
          <Chip label={`💬 ${post.comments_count?.toLocaleString()}`} size="small" />
          {post.views_count > 0 && <Chip label={`👁 ${post.views_count?.toLocaleString()}`} size="small" />}
          {post.post_type && <Chip label={post.post_type} size="small" variant="outlined" />}
          {post.sentiment_label && <Chip label={post.sentiment_label} size="small" color={SENTIMENT_COLORS[post.sentiment_label] || 'default'} />}
          {post.published_at && <Chip label={toJalaliDate(post.published_at)} size="small" variant="outlined" />}
        </Stack>

        {originalUrl && (
          <Button variant="outlined" fullWidth href={originalUrl} target="_blank" rel="noopener noreferrer" sx={{ mb: 1 }}
            startIcon={<Iconify icon={platform === 'instagram' ? 'mdi:instagram' : platform === 'twitter' ? 'mdi:twitter' : 'mdi:telegram'} />}
          >
            {isStory ? 'مشاهده پروفایل' : 'مشاهده پست اصلی'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
