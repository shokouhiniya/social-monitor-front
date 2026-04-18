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
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';
import { toJalaliDate, toJalaliShort } from 'src/utils/format-jalali';

// ----------------------------------------------------------------------

const EVENT_CONFIG = {
  post: { icon: 'solar:gallery-bold-duotone', color: 'primary', label: 'پست' },
  field_report: { icon: 'solar:microphone-bold-duotone', color: 'warning', label: 'گزارش' },
};
const SENTIMENT_COLORS = { angry: 'error', hopeful: 'success', neutral: 'default', sad: 'info' };

function HighlightText({ text, search }) {
  if (!search || !text) return text || '';
  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? <Box key={i} component="span" sx={{ bgcolor: 'warning.lighter', px: 0.25, borderRadius: 0.5, fontWeight: 700 }}>{part}</Box>
      : part
  );
}

export function NarrativeTimeline({ posts, fieldReports }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const allEvents = useMemo(() => {
    const evts = [];
    (posts || []).slice(0, 20).forEach((p) => { evts.push({ type: 'post', date: p.published_at || p.created_at, data: p }); });
    (fieldReports || []).forEach((r) => { evts.push({ type: 'field_report', date: r.created_at, data: r }); });
    evts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return evts;
  }, [posts, fieldReports]);

  const events = useMemo(() => {
    let f = allEvents;
    if (typeFilter !== 'all') f = f.filter((e) => e.type === typeFilter);
    if (sentimentFilter) f = f.filter((e) => e.type === 'post' && e.data.sentiment_label === sentimentFilter);
    if (search) f = f.filter((e) => { const t = e.type === 'post' ? e.data.caption : e.data.content; return t?.toLowerCase().includes(search.toLowerCase()); });
    return f;
  }, [allEvents, typeFilter, sentimentFilter, search]);

  const hasFilters = search || typeFilter !== 'all' || sentimentFilter;

  return (
    <ChartCard
      title="تایم‌لاین یکپارچه"
      icon="solar:timeline-bold-duotone"
      info="پست‌ها و گزارش‌ها در یک خط زمانی"
      action={
        <Stack direction="row" spacing={0.5} alignItems="center">
          {hasFilters && <Chip label="پاک کردن" size="small" variant="outlined" onClick={() => { setSearch(''); setTypeFilter('all'); setSentimentFilter(''); }} sx={{ fontSize: 10 }} />}
          <IconButton size="small" onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
            <Iconify icon="solar:filter-bold-duotone" width={18} />
          </IconButton>
        </Stack>
      }
      sx={{ height: '100%' }}
    >
      {/* Collapsible Filters */}
      <Collapse in={showFilters}>
        <Stack spacing={1.5} sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
          <TextField size="small" fullWidth placeholder="جستجو در متن..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-bold" width={16} sx={{ color: 'text.disabled' }} /></InputAdornment> }}
            sx={{ '& .MuiInputBase-root': { height: 34, fontSize: 12 } }}
          />
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip label="همه" size="small" variant={typeFilter === 'all' ? 'filled' : 'outlined'} color="primary" onClick={() => setTypeFilter('all')} />
            <Chip label="پست" size="small" variant={typeFilter === 'post' ? 'filled' : 'outlined'} onClick={() => setTypeFilter(typeFilter === 'post' ? 'all' : 'post')} />
            <Chip label="گزارش" size="small" variant={typeFilter === 'field_report' ? 'filled' : 'outlined'} color="warning" onClick={() => setTypeFilter(typeFilter === 'field_report' ? 'all' : 'field_report')} />
            {['hopeful', 'angry', 'neutral', 'sad'].map((s) => (
              <Chip key={s} label={s} size="small" variant={sentimentFilter === s ? 'filled' : 'outlined'}
                color={SENTIMENT_COLORS[s] || 'default'} onClick={() => setSentimentFilter(sentimentFilter === s ? '' : s)}
              />
            ))}
          </Stack>
        </Stack>
      </Collapse>

      {events.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">رویدادی یافت نشد</Typography></Box>
      ) : (
        <Box sx={{ maxHeight: 450, overflow: 'auto', pr: 0.5 }}>
          {events.slice(0, 20).map((event, idx) => {
            const config = EVENT_CONFIG[event.type];
            const isPost = event.type === 'post';
            const d = event.data;
            const isLast = idx === Math.min(events.length, 20) - 1;

            return (
              <Stack key={idx} direction="row" spacing={1.5}>
                <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
                  <Box sx={(theme) => ({ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[config.color].main, 0.12), border: `2px solid ${alpha(theme.palette[config.color].main, 0.3)}` })}>
                    <Iconify icon={config.icon} width={14} sx={{ color: `${config.color}.main` }} />
                  </Box>
                  {!isLast && <Box sx={(theme) => ({ width: 2, flex: 1, minHeight: 16, bgcolor: alpha(theme.palette.divider, 0.4) })} />}
                </Stack>

                <Card
                  sx={(theme) => ({ flex: 1, p: 1.5, mb: 1.5, cursor: isPost ? 'pointer' : 'default', border: `1px solid ${alpha(theme.palette[config.color].main, 0.08)}`, transition: 'all 0.2s', '&:hover': isPost ? { borderColor: alpha(theme.palette[config.color].main, 0.25) } : {} })}
                  onClick={() => isPost && setSelectedPost(d)}
                >
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={config.label} size="small" color={config.color} variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                      {isPost && d.post_type && <Chip label={d.post_type} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />}
                      {isPost && d.sentiment_label && <Chip label={d.sentiment_label} size="small" color={SENTIMENT_COLORS[d.sentiment_label] || 'default'} sx={{ height: 18, fontSize: 9 }} />}
                    </Stack>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{toJalaliShort(event.date)}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    {isPost && d.media_url && (
                      <Box component="img" src={d.media_url} sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontSize: 11, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <HighlightText text={isPost ? (d.caption || 'بدون کپشن') : (d.content || 'گزارش')} search={search} />
                      </Typography>
                      {isPost && (
                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.25 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>❤️ {d.likes_count?.toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>💬 {d.comments_count?.toLocaleString()}</Typography>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            );
          })}
        </Box>
      )}

      {/* Post Detail */}
      <Dialog open={!!selectedPost} onClose={() => setSelectedPost(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedPost && (
          <>
            <DialogTitle sx={{ pb: 1 }}>جزئیات پست</DialogTitle>
            <DialogContent>
              {selectedPost.media_url && <Box component="img" src={selectedPost.media_url} sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1, mb: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />}
              <Typography variant="body2" sx={{ lineHeight: 2, mb: 2 }}>{selectedPost.caption || 'بدون کپشن'}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`❤️ ${selectedPost.likes_count?.toLocaleString()}`} size="small" />
                <Chip label={`💬 ${selectedPost.comments_count?.toLocaleString()}`} size="small" />
                {selectedPost.post_type && <Chip label={selectedPost.post_type} size="small" variant="outlined" />}
                {selectedPost.sentiment_label && <Chip label={selectedPost.sentiment_label} size="small" color={SENTIMENT_COLORS[selectedPost.sentiment_label] || 'default'} />}
                {selectedPost.published_at && <Chip label={toJalaliDate(selectedPost.published_at)} size="small" variant="outlined" />}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </ChartCard>
  );
}
