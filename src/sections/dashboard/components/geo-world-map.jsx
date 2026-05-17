'use client';

import { memo } from 'react';
import { Marker, Geography, Geographies, ComposableMap } from 'react-simple-maps';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COUNTRY_COORDS = {
  'ایران': [53.6880, 32.4279], 'آمریکا': [-95.7129, 37.0902], 'بریتانیا': [-1.1743, 52.3555],
  'فلسطین': [35.2332, 31.9522], 'قطر': [51.1839, 25.3548], 'لبنان': [35.8623, 33.8547],
  'استرالیا': [133.7751, -25.2744], 'یمن': [48.5164, 15.5527], 'عراق': [43.6793, 33.2232],
  'ترکیه': [35.2433, 38.9637], 'مصر': [30.8025, 26.8206], 'پاکستان': [69.3451, 30.3753],
  'روسیه': [105.3188, 61.5240], 'چین': [104.1954, 35.8617],
};

const MapChart = memo(function MapChart({ items, maxCount, maxViews, theme }) {
  return (
    <ComposableMap
      projection="geoNaturalEarth1"
      projectionConfig={{ scale: 320, center: [30, 18] }}
      style={{ width: '100%', height: '100%' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo}
              fill={alpha(theme.palette.text.primary, 0.06)}
              stroke={alpha(theme.palette.text.primary, 0.12)}
              strokeWidth={0.5}
              style={{ default: { outline: 'none' }, hover: { fill: alpha(theme.palette.primary.main, 0.12), outline: 'none' }, pressed: { outline: 'none' } }}
            />
          ))
        }
      </Geographies>

      {items.map((item) => {
        const coords = COUNTRY_COORDS[item.country];
        if (!coords) return null;
        // Circle size = total post count
        const sizeRatio = maxCount > 0 ? item.count / maxCount : 0;
        const r = 6 + sizeRatio * 20;
        // Color intensity = views (engagement velocity)
        const viewRatio = maxViews > 0 ? (item.views || 0) / maxViews : 0;
        const hue = 120 - viewRatio * 120; // green(120) → red(0)
        const color = `hsl(${hue}, 70%, 50%)`;

        return (
          <Marker key={item.country} coordinates={coords}>
            <Tooltip title={`${item.country}: ${item.count} پست • ${(item.views || 0).toLocaleString()} بازدید`} arrow>
              <g>
                <circle r={r + 4} fill={alpha(color, 0.15)} />
                <circle r={r} fill={alpha(color, 0.6)} stroke={color} strokeWidth={1.5} />
                {r > 10 && (
                  <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={r > 14 ? 10 : 8} fontWeight={700}>
                    {item.count}
                  </text>
                )}
              </g>
            </Tooltip>
          </Marker>
        );
      })}
    </ComposableMap>
  );
});

export function GeoWorldMap({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="توزیع جغرافیایی" icon="solar:globe-bold-duotone" info="پراکندگی جغرافیایی پیج‌ها روی نقشه جهان">
        <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ country: item.country || 'نامشخص', count: Number(item.count), views: Number(item.views || 0) }))
    .sort((a, b) => b.count - a.count);
  const maxCount = items.length > 0 ? items[0].count : 1;
  const maxViews = Math.max(...items.map((i) => i.views || 0), 1);

  return (
    <ChartCard
      title="توزیع جغرافیایی"
      icon="solar:globe-bold-duotone"
      info="اندازه دایره = تعداد پست • رنگ = حجم بازدید (سبز=کم، قرمز=زیاد)"
    >
      <Box sx={{ height: 440, direction: 'ltr' }}>
        <MapChart items={items} maxCount={maxCount} maxViews={maxViews} theme={theme} />
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'hsl(120, 70%, 50%)' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>بازدید کم</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'hsl(60, 70%, 50%)' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>بازدید متوسط</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'hsl(0, 70%, 50%)' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>بازدید زیاد</Typography>
        </Stack>
      </Stack>
    </ChartCard>
  );
}
