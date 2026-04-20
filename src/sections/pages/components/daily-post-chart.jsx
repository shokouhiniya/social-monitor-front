'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

// Dynamic import for Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
      <CircularProgress />
    </Box>
  )
});

export function DailyPostChart({ posts }) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!posts || posts.length === 0) {
      return { categories: [], data: [] };
    }

    // Get last 30 days
    const days = 30;
    const now = new Date();
    const dailyCounts = {};

    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      // Convert to Tehran timezone (+3:30)
      const tehranDate = new Date(date.getTime() + (3.5 * 60 * 60 * 1000));
      const dateKey = tehranDate.toISOString().split('T')[0];
      dailyCounts[dateKey] = 0;
    }

    // Count posts per day
    posts.forEach((post) => {
      if (!post.published_at) return;
      
      // Convert to Tehran timezone
      const postDate = new Date(post.published_at);
      const tehranDate = new Date(postDate.getTime() + (3.5 * 60 * 60 * 1000));
      const dateKey = tehranDate.toISOString().split('T')[0];
      
      if (dailyCounts[dateKey] !== undefined) {
        dailyCounts[dateKey]++;
      }
    });

    // Convert to arrays and format dates as Shamsi
    const sortedDates = Object.keys(dailyCounts).sort();
    const categories = sortedDates.map((dateStr) => {
      const date = new Date(dateStr);
      // Format as Shamsi date (e.g., "۱۴ فروردین")
      return moment(date).format('jD jMMMM');
    });
    const data = sortedDates.map((dateStr) => dailyCounts[dateStr]);

    return { categories, data };
  }, [posts]);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: '10px',
          colors: theme.palette.text.secondary,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
      title: {
        text: 'تعداد پست',
        style: {
          color: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    colors: [theme.palette.info.main],
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `${value} پست`,
      },
    },
  };

  const series = [
    {
      name: 'تعداد پست',
      data: chartData.data,
    },
  ];

  return (
    <Card>
      <CardHeader
        title="توزیع روزانه پست‌ها"
        subheader="۳۰ روز گذشته (تاریخ شمسی - منطقه زمانی تهران)"
        titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <Chart options={chartOptions} series={series} type="bar" height={280} />
    </Card>
  );
}
