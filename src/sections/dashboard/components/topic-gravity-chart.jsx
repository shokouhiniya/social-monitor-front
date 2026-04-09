'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

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
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3, minWidth: 160 }}>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{d.name}</Box>
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

function CustomContent({ x, y, width, height, name, fill }) {
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={fill} opacity={0.85} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      {width > 50 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={width > 80 ? 12 : 10} fontWeight={600}>
          {name}
        </text>
      )}
    </g>
  );
}

export function TopicGravityChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="ثقل موضوعی" icon="solar:fire-bold-duotone" info="موضوعات داغ شبکه بر اساس حجم محتوا و لحن غالب">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((item) => ({
    name: item.topic,
    size: item.count,
    count: item.count,
    sentiments: item.sentiments,
    fill: SENTIMENT_COLORS[getDominantSentiment(item.sentiments)] || theme.palette.primary.main,
  }));

  return (
    <ChartCard
      title="ثقل موضوعی"
      icon="solar:fire-bold-duotone"
      info="هر بلوک یک موضوع است. اندازه = حجم محتوا، رنگ = لحن غالب (قرمز: خشم، سبز: امید، آبی: غم، خاکستری: خنثی)"
    >
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={items}
            dataKey="size"
            nameKey="name"
            content={<CustomContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
