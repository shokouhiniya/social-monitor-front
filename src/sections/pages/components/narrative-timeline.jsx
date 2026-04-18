'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';
import { toJalaliDate, toJalaliShort } from 'src/utils/format-jalali';

// ----------------------------------------------------------------------

const EVENT_CONFIG = {
  post: { icon: 'solar:gallery-bold-duotone', color: 'primary', label: 'پست' },
  field_report: { icon: 'solar:microphone-bold-duotone', color: 'warning', label: 'گزارش میدانی' },
};

const SENTIMENT_COLORS = { angry: 'error', hopeful: 'success', neutral: 'default', sad: 'info' };

export function NarrativeTimeline({ posts, fieldReports, contentHooks }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const allEvents = useMemo(() => {
    const evts = [];
    (posts || []).slice(0, 20).forEach((p) => {
      evts.push({ type: 'post', date: p.published_at || p.created_at, data: p });
    });
    (fieldReports || []).forEach((r) => {
      evts.push({ type: 'field_report', date: r.created_at, data: r });
    });
    evts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return evts;
  }, [posts, fieldReports]);

  const events = useMemo(() => {
    let filtered = allEvents;
    if (typeFilter !== 'all') filtered = filtered.filter((e) => e.type === typeFilter);
    if (sentimentFilter) filtered = filtered.filter((e) => e.type === 'post' && e.data.sentiment_label === sentimentFilter);
    if (search) filtered = filtered.filter((e) => {
      const text = e.type === 'post' ? e.data.caption : e.data.content;
      return text?.toLowerCase().includes(search.toLowerCase());
    });
    return filtered;
  }, [allEvents, typeFilter, sentimentFilter, search]);

  if (events.length === 0) {
    return (
      <ChartCard title="تایم‌لاین یکپارچه" icon="solar:timeline-bold-duotone" info="پست‌ها و گزارش‌ها در یک خط زمانی">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">رویدادی ثبت نشده — ابتدا بارگیری کنید</Typography>
        </Box>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="تایم‌لاین یکپارچه و قلاب محتوایی"
      icon="solar:timeline-bold-duotone"
      info="پست‌ها، گزارش‌ها و تحلیل فرمت‌های پرتعامل در یک نمای واحد"
    >
      {/* Content Hooks Summary */}
      {contentHooks?.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>قلاب محتوایی:</Typography>
          {contentHooks.map((h) => (
            <Chip key={h.format} label={`${h.format}: ${Number(h.avg_engagement).toFixed(0)} تعامل (${h.post_count} پست)`}
              size="small" variant="outlined" sx={{ fontSize: 10 }}
            />
          ))}
        </Stack>
      )}

      {/* Filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <TextField size="small" placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-bold" width={16} sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          sx={{ minWidth: 180, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
        />
        <Chip label="همه" size="small" variant={typeFilter === 'all' ? 'filled' : 'outlined'} color="primary" onClick={() => setTypeFilter('all')} />
        <Chip label="پست‌ها" size="small" variant={typeFilter === 'post' ? 'filled' : 'outlined'} onClick={() => setTypeFilter(typeFilter === 'post' ? 'all' : 'post')} icon={<Iconify icon="solar:gallery-bold" width={14} />} />
        <Chip label="گزارش‌ها" size="small" variant={typeFilter === 'field_report' ? 'filled' : 'outlined'} color="warning" onClick={() => setTypeFilter(typeFilter === 'field_report' ? 'all' : 'field_report')} icon={<Iconify icon="solar:microphone-bold" width={14} />} />
        {['hopeful', 'angry', 'neutral', 'sad'].map((s) => (
          <Chip key={s} label={s} size="small" variant={sentimentFilter === s ? 'filled' : 'outlined'}
            color={s === 'hopeful' ? 'success' : s === 'angry' ? 'error' : s === 'sad' ? 'info' : 'default'}
            onClick={() => setSentimentFilter(sentimentFilter === s ? '' : s)}
          />
        ))}
      </Stack>

      <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
        {events.slice(0, 20).map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const isPost = event.type === 'post';
          const d = event.data;
          const isLast = idx === Math.min(events.length, 20) - 1;

          return (
            <Stack key={idx} direction="row" spacing={2} sx={{ mb: 0 }}>
              {/* Timeline rail */}
              <Stack alignItems="center" sx={{ width: 40, flexShrink: 0 }}>
                <Box
                  sx={(theme) => ({
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(theme.palette[config.color].main, 0.12),
                    border: `2px solid ${alpha(theme.palette[config.color].main, 0.4)}`,
                  })}
                >
                  <Iconify icon={config.icon} width={18} sx={{ color: `${config.color}.main` }} />
                </Box>
                {!isLast && (
                  <Box sx={(theme) => ({ width: 2, flex: 1, minHeight: 20, bgcolor: alpha(theme.palette.divider, 0.4) })} />
                )}
              </Stack>

              {/* Content card */}
              <Card
                sx={(theme) => ({
                  flex: 1, p: 2, mb: 2,
                  cursor: isPost ? 'pointer' : 'default',
                  border: `1px solid ${alpha(theme.palette[config.color].main, 0.1)}`,
                  transition: 'all 0.2s',
                  '&:hover': isPost ? { borderColor: alpha(theme.palette[config.color].main, 0.3), boxShadow: theme.shadows[2] } : {},
                })}
                onClick={() => isPost && setSelectedPost(d)}
              >
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Chip label={config.label} size="small" color={config.color} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                    {isPost && d.post_type && <Chip label={d.post_type} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                    {isPost && d.sentiment_label && (
                      <Chip label={d.sentiment_label} size="small" color={SENTIMENT_COLORS[d.sentiment_label] || 'default'} sx={{ height: 20, fontSize: 10 }} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {event.date ? toJalaliShort(event.date) : '—'}
                  </Typography>
                </Stack>

                {/* Body */}
                <Stack direction="row" spacing={1.5}>
                  {isPost && d.media_url && (
                    <Box
                      component="img" src={d.media_url}
                      sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {isPost ? (d.caption || 'بدون کپشن') : (d.content || 'گزارش')}
                    </Typography>
                    {isPost && (
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:heart-bold" width={12} sx={{ color: 'error.main' }} />
                          <Typography variant="caption" sx={{ fontSize: 10 }}>{d.likes_count?.toLocaleString()}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:chat-round-dots-bold" width={12} sx={{ color: 'info.main' }} />
                          <Typography variant="caption" sx={{ fontSize: 10 }}>{d.comments_count?.toLocaleString()}</Typography>
                        </Stack>
                      </Stack>
                    )}
                    {!isPost && d.source_type && (
                      <Chip label={d.source_type} size="small" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: 9 }} />
                    )}
                  </Box>
                </Stack>
              </Card>
            </Stack>
          );
        })}
      </Box>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onClose={() => setSelectedPost(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {selectedPost && (
          <>
            <DialogTitle sx={{ pb: 1 }}>جزئیات پست</DialogTitle>
            <DialogContent>
              {selectedPost.media_url && (
                <Box
                  component="img" src={selectedPost.media_url}
                  sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1, mb: 2 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <Typography variant="body2" sx={{ lineHeight: 2, mb: 2 }}>{selectedPost.caption || 'بدون کپشن'}</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip label={`❤️ ${selectedPost.likes_count?.toLocaleString()}`} size="small" />
                <Chip label={`💬 ${selectedPost.comments_count?.toLocaleString()}`} size="small" />
                {selectedPost.post_type && <Chip label={selectedPost.post_type} size="small" variant="outlined" />}
                {selectedPost.sentiment_label && <Chip label={selectedPost.sentiment_label} size="small" color={SENTIMENT_COLORS[selectedPost.sentiment_label] || 'default'} />}
                {selectedPost.published_at && <Chip label={toJalaliDate(selectedPost.published_at)} size="small" variant="outlined" />}
              </Stack>
              {selectedPost.extracted_topics?.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {selectedPost.extracted_topics.map((t) => <Chip key={t} label={t} size="small" color="info" variant="outlined" />)}
                </Stack>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </ChartCard>
  );
}
