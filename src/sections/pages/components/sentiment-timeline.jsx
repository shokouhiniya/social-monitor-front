'use client';

import { Area, XAxis, YAxis, Tooltip, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { toJalaliDate } from 'src/utils/format-jalali';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.jalaliDate}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>احساس: {Number(d.avg_sentiment).toFixed(2)}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{d.post_count} پست</Box>
    </Box>
  );
}

export function SentimentTimeline({ data }) {
  const theme = useTheme();
  const items = data || [];

  if (items.length === 0) {
    return (
      <ChartCard title="تایم‌لاین تغییر فاز" icon="solar:graph-bold-duotone" info="نوسان لحن محتوا — بالای صفر: امیدوار، زیر صفر: خشمگین" sx={{ height: '100%' }}>
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
          داده‌ای موجود نیست
        </Box>
      </ChartCard>
    );
  }

  // Filter out days with no posts and calculate bubble size based on post count
  const chartData = items
    .filter(item => Number(item.post_count) > 0) // Only show days with posts
    .map((item) => {
      const postCount = Number(item.post_count) || 0;
      const avgSentiment = Number(item.avg_sentiment) || 0;
      
      return {
        ...item,
        jalaliDate: toJalaliDate(item.date),
        avg_sentiment: avgSentiment,
        post_count: postCount,
        // Calculate bubble size (radius) based on post count
        // Min size 3, max size 15, scaled logarithmically for better visualization
        bubbleSize: Math.max(3, Math.min(15, 3 + Math.log(postCount + 1) * 3)),
      };
    });

  return (
    <ChartCard title="تایم‌لاین تغییر فاز" icon="solar:graph-bold-duotone"
      info="نوسان احساسات در طول زمان. اندازه نقاط = تعداد پست. بالای صفر = امیدوار، زیر = خشمگین." sx={{ height: '100%' }}
    >
      <Box sx={{ height: 200, direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                <stop offset="50%" stopColor={theme.palette.grey[500]} stopOpacity={0.05} />
                <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="jalaliDate" 
              tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[-1, 1]} 
              tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
              ticks={[-1, -0.5, 0, 0.5, 1]}
              tickFormatter={(value) => {
                if (value === 1) return 'امیدوار';
                if (value === 0.5) return 'مثبت';
                if (value === 0) return 'خنثی';
                if (value === -0.5) return 'منفی';
                if (value === -1) return 'خشمگین';
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke={theme.palette.text.disabled} strokeDasharray="5 5" />
            <ReferenceLine y={0.5} stroke={theme.palette.success.light} strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={-0.5} stroke={theme.palette.error.light} strokeDasharray="3 3" opacity={0.3} />
            <Area 
              type="monotone" 
              dataKey="avg_sentiment" 
              stroke={theme.palette.primary.main} 
              fill="url(#sentGrad)" 
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (!payload) return null;
                const size = payload.bubbleSize || 3;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={theme.palette.primary.main}
                    stroke={theme.palette.background.paper}
                    strokeWidth={1.5}
                    opacity={0.8}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
