'use client';

import { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

export function DailyPostChart({ posts }) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    const days = 30;
    const now = new Date();
    const dailyCounts = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyCounts[dateKey] = 0;
    }

    posts.forEach((post) => {
      if (!post.published_at) return;
      const postDate = new Date(post.published_at);
      const dateKey = postDate.toISOString().split('T')[0];
      if (dailyCounts[dateKey] !== undefined) {
        dailyCounts[dateKey]++;
      }
    });

    return Object.keys(dailyCounts).sort().map((dateStr) => ({
      date: dayjs(dateStr).calendar('jalali').locale('fa').format('DD MMMM'),
      count: dailyCounts[dateStr],
    }));
  }, [posts]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader title="توزیع روزانه پست‌ها" titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }} />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="توزیع روزانه پست‌ها"
        subheader="۳۰ روز گذشته (تاریخ شمسی)"
        titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <Box sx={{ p: 2, pt: 0 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
              angle={-45}
              textAnchor="end"
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              label={{ value: 'تعداد پست', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: theme.palette.text.secondary } }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: theme.typography.fontFamily }}
              formatter={(value) => [`${value} پست`, 'تعداد']}
            />
            <Bar dataKey="count" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
