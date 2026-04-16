'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const EVENT_CONFIG = {
  post: { icon: 'solar:gallery-bold-duotone', color: 'primary', label: 'پست' },
  field_report: { icon: 'solar:microphone-bold-duotone', color: 'warning', label: 'گزارش میدانی' },
};

export function NarrativeTimeline({ posts, fieldReports }) {
  const [selectedPost, setSelectedPost] = useState(null);

  const events = [];

  (posts || []).slice(0, 12).forEach((p) => {
    events.push({ type: 'post', date: p.published_at || p.created_at, data: p });
  });

  (fieldReports || []).forEach((r) => {
    events.push({ type: 'field_report', date: r.created_at, data: r });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ChartCard
      title="تایم‌لاین یکپارچه"
      icon="solar:timeline-bold-duotone"
      info="پست‌ها و گزارش‌های میدانی در یک خط زمانی — کلیک روی هر پست برای مشاهده جزئیات"
    >
      <Stack spacing={0} sx={{ maxHeight: 450, overflow: 'auto', position: 'relative' }}>
        <Box sx={(theme) => ({ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, bgcolor: alpha(theme.palette.divider, 0.5) })} />

        {events.slice(0, 20).map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const isPost = event.type === 'post';
          const d = event.data;

          return (
            <Stack
              key={idx}
              direction="row"
              spacing={2}
              sx={{
                py: 1.5, position: 'relative', cursor: isPost ? 'pointer' : 'default',
                '&:hover': isPost ? { bgcolor: 'action.hover', borderRadius: 1 } : {},
              }}
              onClick={() => isPost && setSelectedPost(d)}
            >
              <Box
                sx={(theme) => ({
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: alpha(theme.palette[config.color].main, 0.12),
                  border: `2px solid ${alpha(theme.palette[config.color].main, 0.3)}`,
                  zIndex: 1,
                })}
              >
                <Iconify icon={config.icon} width={16} sx={{ color: `${config.color}.main` }} />
              </Box>

              {/* Thumbnail for posts */}
              {isPost && d.media_url && (
                <Box
                  component="img"
                  src={d.media_url}
                  sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: `${config.color}.main`, fontSize: 10 }}>
                    {config.label}
                  </Typography>
                  {isPost && d.sentiment_label && (
                    <Chip label={d.sentiment_label} size="small" sx={{ height: 16, fontSize: 9 }}
                      color={d.sentiment_label === 'hopeful' ? 'success' : d.sentiment_label === 'angry' ? 'error' : 'default'}
                      variant="outlined"
                    />
                  )}
                  {isPost && d.post_type && (
                    <Chip label={d.post_type} size="small" variant="outlined" sx={{ height: 16, fontSize: 9 }} />
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {event.date ? new Date(event.date).toLocaleDateString('fa-IR') : '—'}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.6 }} noWrap>
                  {isPost ? (d.caption || 'بدون کپشن') : (d.content || 'گزارش')}
                </Typography>
                {isPost && (
                  <Stack direction="row" spacing={1.5} sx={{ mt: 0.25 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>❤️ {d.likes_count?.toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>💬 {d.comments_count?.toLocaleString()}</Typography>
                  </Stack>
                )}
              </Box>
            </Stack>
          );
        })}
      </Stack>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onClose={() => setSelectedPost(null)} maxWidth="sm" fullWidth>
        {selectedPost && (
          <>
            <DialogTitle sx={{ pb: 1 }}>جزئیات پست</DialogTitle>
            <DialogContent>
              {selectedPost.media_url && (
                <Box
                  component="img"
                  src={selectedPost.media_url}
                  sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1, mb: 2 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <Typography variant="body2" sx={{ lineHeight: 2, mb: 2 }}>
                {selectedPost.caption || 'بدون کپشن'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Chip label={`❤️ ${selectedPost.likes_count?.toLocaleString()}`} size="small" />
                <Chip label={`💬 ${selectedPost.comments_count?.toLocaleString()}`} size="small" />
                {selectedPost.shares_count > 0 && <Chip label={`🔄 ${selectedPost.shares_count?.toLocaleString()}`} size="small" />}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedPost.post_type && <Chip label={selectedPost.post_type} size="small" variant="outlined" />}
                {selectedPost.sentiment_label && <Chip label={selectedPost.sentiment_label} size="small" color={selectedPost.sentiment_label === 'hopeful' ? 'success' : selectedPost.sentiment_label === 'angry' ? 'error' : 'default'} />}
                {selectedPost.published_at && <Chip label={new Date(selectedPost.published_at).toLocaleDateString('fa-IR')} size="small" variant="outlined" />}
              </Stack>
              {selectedPost.extracted_topics?.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">موضوعات:</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {selectedPost.extracted_topics.map((t) => <Chip key={t} label={t} size="small" color="info" variant="outlined" />)}
                  </Stack>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </ChartCard>
  );
}
