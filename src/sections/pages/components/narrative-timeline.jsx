'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const EVENT_CONFIG = {
  post: { icon: 'solar:gallery-bold-duotone', color: 'primary', label: 'پست' },
  field_report: { icon: 'solar:microphone-bold-duotone', color: 'warning', label: 'گزارش میدانی' },
  alert: { icon: 'solar:bell-bold-duotone', color: 'error', label: 'هشدار' },
  action: { icon: 'solar:clipboard-check-bold-duotone', color: 'info', label: 'اقدام' },
};

export function NarrativeTimeline({ posts, fieldReports }) {
  // Merge all events into one timeline
  const events = [];

  (posts || []).slice(0, 8).forEach((p) => {
    events.push({
      type: 'post',
      date: p.published_at || p.created_at,
      title: p.caption?.slice(0, 80) || 'پست بدون کپشن',
      meta: `${p.post_type || '—'} • ${p.sentiment_label || 'خنثی'}`,
    });
  });

  (fieldReports || []).forEach((r) => {
    events.push({
      type: 'field_report',
      date: r.created_at,
      title: r.content?.slice(0, 80) || 'گزارش',
      meta: `${r.source_type || 'دستی'} • ${r.status}`,
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ChartCard
      title="تایم‌لاین یکپارچه"
      icon="solar:timeline-bold-duotone"
      info="پست‌ها، گزارش‌های میدانی و هشدارها در یک خط زمانی — برای کشف علیت بین رویدادها"
    >
      <Stack spacing={0} sx={{ maxHeight: 400, overflow: 'auto', position: 'relative' }}>
        {/* Vertical line */}
        <Box sx={(theme) => ({ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, bgcolor: alpha(theme.palette.divider, 0.5) })} />

        {events.slice(0, 15).map((event, idx) => {
          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.post;
          return (
            <Stack key={idx} direction="row" spacing={2} sx={{ py: 1.5, position: 'relative' }}>
              {/* Dot */}
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

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: `${config.color}.main`, fontSize: 10 }}>
                    {config.label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {event.date ? new Date(event.date).toLocaleDateString('fa-IR') : '—'}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.6 }} noWrap>
                  {event.title}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {event.meta}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
