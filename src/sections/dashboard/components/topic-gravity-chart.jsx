'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, Cell } from 'recharts';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const SENTIMENT_COLORS = { angry: '#FF5630', hopeful: '#22C55E', neutral: '#919EAB', sad: '#00B8D9' };

function getDominantSentiment(sentiments) {
  if (!sentiments) return 'neutral';
  return Object.entries(sentiments).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3, minWidth: 140 }}>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{d.topic}</Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{d.count} پست</Box>
      {d.sentiments && Object.entries(d.sentiments).map(([k, v]) => (
        <Box key={k} sx={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SENTIMENT_COLORS[k] }} />
          {k}: {v}
        </Box>
      ))}
    </Box>
  );
}

export function TopicGravityChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="ثقل موضوعی" icon="solar:fire-bold-duotone" info="موضوعات داغ شبکه" sx={{ height: '100%' }}>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).slice(0, 12).map((item) => ({
    topic: item.topic,
    count: item.count,
    sentiments: item.sentiments,
    fill: SENTIMENT_COLORS[getDominantSentiment(item.sentiments)] || theme.palette.primary.main,
  }));

  return (
    <ChartCard
      title="ثقل موضوعی"
      icon="solar:fire-bold-duotone"
      info="موضوعات داغ شبکه — رنگ هر ستون = لحن غالب (قرمز: خشم، سبز: امید)"
      sx={{ height: '100%' }}
    >
      <Box sx={{ height: 300, direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} layout="vertical" margin={{ left: 5, right: 15, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
            <XAxis type="number" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
            <YAxis type="category" dataKey="topic" width={80} tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
            <RTooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
              {items.map((item, idx) => (
                <Cell key={idx} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
