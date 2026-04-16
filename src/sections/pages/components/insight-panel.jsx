'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function InsightPanel({ painPoints, keywords, fieldReports }) {
  const [tab, setTab] = useState(0);
  const reports = fieldReports || [];

  return (
    <ChartCard
      title="پنل ۳۶۰° بصیرت"
      icon="solar:eye-scan-bold-duotone"
      info="ترکیب دغدغه‌های استخراج‌شده از محتوا و گزارش‌های میدانی تیم"
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, minHeight: 32, '& .MuiTab-root': { minHeight: 32, fontSize: 12, py: 0 } }}>
        <Tab label={`دغدغه‌ها (${(painPoints || []).length})`} />
        <Tab label={`کلمات کلیدی (${(keywords || []).length})`} />
        <Tab label={`شواهد میدانی (${reports.length})`} />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={1}>
          {(painPoints || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">دغدغه‌ای شناسایی نشده</Typography>
          ) : (
            (painPoints || []).map((point, idx) => (
              <Stack key={idx} direction="row" alignItems="center" spacing={1.5}
                sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` })}
              >
                <Iconify icon="solar:heart-pulse-bold-duotone" width={18} sx={{ color: 'error.main', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: 13 }}>{point}</Typography>
              </Stack>
            ))
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {(keywords || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">کلمه کلیدی ثبت نشده</Typography>
          ) : (
            (keywords || []).map((kw) => (
              <Chip key={kw} label={kw} size="small" variant="outlined" />
            ))
          )}
        </Box>
      )}

      {tab === 2 && (
        <Stack spacing={1} sx={{ maxHeight: 250, overflow: 'auto' }}>
          {reports.length === 0 ? (
            <Typography variant="body2" color="text.secondary">گزارش میدانی ثبت نشده</Typography>
          ) : (
            reports.map((report) => (
              <Box key={report.id}
                sx={(theme) => ({
                  p: 1.5, borderRadius: 1,
                  bgcolor: report.is_override ? alpha(theme.palette.warning.main, 0.06) : alpha(theme.palette.grey[500], 0.04),
                  borderRight: report.is_override ? `3px solid ${theme.palette.warning.main}` : 'none',
                })}
              >
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Chip label={report.source_type || 'دستی'} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {new Date(report.created_at).toLocaleDateString('fa-IR')}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.8 }}>{report.content}</Typography>
                {report.is_override && report.override_note && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', fontSize: 11 }}>
                    تحلیل انسانی: {report.override_note}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Stack>
      )}
    </ChartCard>
  );
}
