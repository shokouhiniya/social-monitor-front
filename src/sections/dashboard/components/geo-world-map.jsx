'use client';

import { memo } from 'react';
import { Marker, Geography, Geographies, ComposableMap } from 'react-simple-maps';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COUNTRY_COORDS = {
  'ایران': [53.6880, 32.4279],
  'آمریکا': [-95.7129, 37.0902],
  'بریتانیا': [-1.1743, 52.3555],
  'فلسطین': [35.2332, 31.9522],
  'قطر': [51.1839, 25.3548],
  'لبنان': [35.8623, 33.8547],
  'استرالیا': [133.7751, -25.2744],
  'یمن': [48.5164, 15.5527],
  'عراق': [43.6793, 33.2232],
  'ترکیه': [35.2433, 38.9637],
  'مصر': [30.8025, 26.8206],
  'پاکستان': [69.3451, 30.3753],
  'روسیه': [105.3188, 61.5240],
  'چین': [104.1954, 35.8617],
};

const COUNTRY_COLORS = {
  'ایران': '#00A76F', 'آمریکا': '#2065D1', 'بریتانیا': '#8E33FF', 'فلسطین': '#FF5630',
  'قطر': '#FFAB00', 'لبنان': '#00B8D9', 'استرالیا': '#FF6C40', 'یمن': '#36B37E',
};

const COUNTRY_FLAGS = {
  'ایران': '🇮🇷', 'آمریکا': '🇺🇸', 'بریتانیا': '🇬🇧', 'فلسطین': '🇵🇸', 'قطر': '🇶🇦',
  'لبنان': '🇱🇧', 'استرالیا': '🇦🇺', 'یمن': '🇾🇪',
};

const MapChart = memo(function MapChart({ items, maxCount, total, theme }) {
  return (
    <ComposableMap
      projection="geoNaturalEarth1"
      projectionConfig={{ scale: 320, center: [30, 18] }}
      style={{ width: '100%', height: '100%' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={alpha(theme.palette.text.primary, 0.06)}
              stroke={alpha(theme.palette.text.primary, 0.12)}
              strokeWidth={0.5}
              style={{
                default: { outline: 'none' },
                hover: { fill: alpha(theme.palette.primary.main, 0.12), outline: 'none' },
                pressed: { outline: 'none' },
              }}
            />
          ))
        }
      </Geographies>

      {items.map((item) => {
        const coords = COUNTRY_COORDS[item.country];
        if (!coords) return null;
        const ratio = item.count / maxCount;
        const r = 5 + ratio * 18;
        const color = COUNTRY_COLORS[item.country] || theme.palette.primary.main;

        return (
          <Marker key={item.country} coordinates={coords}>
            <circle r={r + 4} fill={alpha(color, 0.15)} />
            <circle r={r} fill={alpha(color, 0.6)} stroke={color} strokeWidth={1.5} />
            {r > 10 && (
              <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={r > 14 ? 10 : 8} fontWeight={700}>
                {item.count}
              </text>
            )}
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
      <ChartCard title="توزیع جغرافیایی" icon="solar:globe-bold-duotone" info="پراکندگی جغرافیایی پیج‌ها روی نقشه جهان" sx={{ height: '100%' }}>
        <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || [])
    .map((item) => ({ country: item.country || 'نامشخص', count: Number(item.count) }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);
  const maxCount = items.length > 0 ? items[0].count : 1;

  return (
    <ChartCard
      title="توزیع جغرافیایی"
      icon="solar:globe-bold-duotone"
      info="نقشه پراکندگی جغرافیایی پیج‌ها — اندازه نقطه = تعداد پیج"
      sx={{ height: '100%' }}
    >
      {/* Map */}
      <Box sx={{ height: 440, direction: 'ltr' }}>
        <MapChart items={items} maxCount={maxCount} total={total} theme={theme} />
      </Box>

      {/* Legend */}
      <Stack spacing={0.75} sx={{ mt: 1, maxHeight: 140, overflow: 'auto' }}>
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const barPercent = Math.round((item.count / maxCount) * 100);
          const color = COUNTRY_COLORS[item.country] || theme.palette.grey[500];
          const flag = COUNTRY_FLAGS[item.country] || '🌍';

          return (
            <Stack key={item.country} direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, width: 22, textAlign: 'center' }}>{flag}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 55 }}>{item.country}</Typography>
              <Box sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: alpha(color, 0.1), overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${barPercent}%`, borderRadius: 1, bgcolor: color, transition: 'width 0.5s ease' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color, minWidth: 40, textAlign: 'left', fontSize: 11 }}>
                {item.count} ({percent}%)
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
