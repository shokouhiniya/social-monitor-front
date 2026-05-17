'use client';

import { useState } from 'react';
import { Bar, Cell, XAxis, YAxis, Tooltip, BarChart, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { RELIGIONS, TOPICAL_LABELS } from 'src/sections/pages/constants';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'category', label: 'دسته موضوعی', icon: 'solar:bookmark-square-bold-duotone', color: 'primary' },
  { value: 'cluster', label: 'خوشه‌ها', icon: 'solar:atom-bold-duotone', color: 'secondary' },
  { value: 'country', label: 'جغرافیا', icon: 'solar:globe-bold-duotone', color: 'info' },
  { value: 'language', label: 'زبان', icon: 'solar:translation-bold-duotone', color: 'success' },
  { value: 'religion', label: 'دین/مذهب', icon: 'solar:church-bold-duotone', color: 'warning' },
];

const COLORS = ['#1976d2', '#9c27b0', '#0288d1', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#5d4037', '#455a64', '#c2185b'];

function normalizeLabel(value, type) {
  if (!value) return 'نامشخص';
  if (type === 'category') return TOPICAL_LABELS[value] || value;
  if (type === 'cluster') return value;
  if (type === 'religion') return RELIGIONS[value] || value;
  return value;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{d.label}</Typography>
      <Typography variant="caption" color="primary.main">{d.count} پیج ({d.percent}٪)</Typography>
    </Box>
  );
}

export function ProfileDistributions({ data, loading }) {
  const [activeTab, setActiveTab] = useState('category');

  const buildData = (rawArr, key, type) => {
    if (!rawArr || !Array.isArray(rawArr)) return [];
    const total = rawArr.reduce((s, item) => s + Number(item.count), 0) || 1;
    return rawArr
      .map((item) => ({
        rawKey: item[key],
        label: normalizeLabel(item[key], type),
        count: Number(item.count),
        percent: Math.round((Number(item.count) / total) * 100),
      }))
      .filter((item) => item.label && item.label !== 'نامشخص')
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const chartData = (() => {
    if (!data) return [];
    switch (activeTab) {
      case 'category':
        return buildData(data.identity_distribution, 'category', 'category');
      case 'cluster':
        return buildData(data.cluster_distribution, 'cluster', 'cluster');
      case 'country':
        return buildData(data.geo_distribution, 'country', 'country');
      case 'language':
        return buildData(data.language_distribution, 'language', 'language');
      case 'religion':
        return buildData(data.religion_distribution, 'religion', 'religion');
      default:
        return [];
    }
  })();

  const activeConf = TABS.find((t) => t.value === activeTab) || TABS[0];

  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={(theme) => ({ px: 2.5, py: 1.75, borderBottom: `1px solid ${theme.palette.divider}` })}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={(theme) => ({ width: 36, height: 36, borderRadius: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[activeConf.color].main, 0.12) })}>
            <Iconify icon={activeConf.icon} width={20} sx={{ color: `${activeConf.color}.main` }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>توزیع پروفایل کنشگران</Typography>
            <Typography variant="caption" color="text.secondary">مانیتورینگ ترکیب شبکه — نمودار میله‌ای ۱۰ مورد برتر</Typography>
          </Box>
        </Stack>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={(theme) => ({ borderBottom: `1px solid ${theme.palette.divider}`, px: 1 })}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon={tab.icon} width={16} sx={{ color: `${tab.color}.main` }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{tab.label}</Typography>
              </Stack>
            }
            sx={{ minHeight: 48, textTransform: 'none' }}
          />
        ))}
      </Tabs>

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">در حال بارگذاری...</Typography>
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack alignItems="center" spacing={1}>
              <Iconify icon="solar:chart-2-bold-duotone" width={36} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">داده‌ای موجود نیست</Typography>
            </Stack>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(320, chartData.length * 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                width={140}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Card>
  );
}
