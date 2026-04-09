'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ComparisonSlider({ currentData, previousData }) {
  const [view, setView] = useState('current');

  const current = currentData || {};
  const previous = previousData || {};

  const metrics = [
    { key: 'credibility_score', label: 'اعتبار' },
    { key: 'influence_score', label: 'نفوذ' },
    { key: 'consistency_rate', label: 'پایداری' },
    { key: 'followers_count', label: 'فالوور', isCount: true },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">
          مقایسه زمانی (Pivot Tracker)
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={(_, v) => { if (v) setView(v); }}
        >
          <ToggleButton value="current">الان</ToggleButton>
          <ToggleButton value="compare">مقایسه</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {metrics.map((metric) => {
        const cur = Number(current[metric.key]) || 0;
        const prev = Number(previous[metric.key]) || 0;
        const diff = cur - prev;
        const diffPercent = prev > 0 ? Math.round((diff / prev) * 100) : 0;

        return (
          <Box key={metric.key} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{metric.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {metric.isCount ? cur.toLocaleString() : cur.toFixed(1)}
                </Typography>
                {view === 'compare' && diff !== 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify
                      icon={diff > 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                      sx={{ color: diff > 0 ? 'success.main' : 'error.main', width: 16 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: diff > 0 ? 'success.main' : 'error.main' }}
                    >
                      {diffPercent > 0 ? '+' : ''}{diffPercent}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {!metric.isCount && (
              <Box sx={{ position: 'relative' }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(cur * 10, 100)}
                  sx={{ height: 8, borderRadius: 1 }}
                  color={cur > 7 ? 'success' : cur > 4 ? 'warning' : 'error'}
                />
                {view === 'compare' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: `${Math.min(prev * 10, 100)}%`,
                      width: 2,
                      height: 8,
                      bgcolor: 'text.primary',
                      opacity: 0.5,
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        );
      })}

      {view === 'compare' && (
        <Typography variant="caption" color="text.secondary">
          خط عمودی = مقدار دوره قبل
        </Typography>
      )}
    </Card>
  );
}
