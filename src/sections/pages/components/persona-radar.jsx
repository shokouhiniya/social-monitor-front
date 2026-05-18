'use client';

import { Radar, Tooltip, PolarGrid, RadarChart, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const DIMENSIONS = [
  { key: 'narrative_focus', label: 'تمرکز روایی' },
  { key: 'emotional_intensity', label: 'شدت احساسی' },
  { key: 'mobilization_power', label: 'توان بسیج' },
  { key: 'analytical_depth', label: 'عمق تحلیلی' },
  { key: 'institutional_tone', label: 'لحن نهادی' },
  { key: 'audience_closeness', label: 'نزدیکی مخاطب' },
];

// Legacy axes for backward compatibility with old data
const LEGACY_DIMENSIONS = [
  { key: 'aggressive_defensive', label: 'تهاجمی' },
  { key: 'producer_resharer', label: 'تولیدی' },
  { key: 'visual_textual', label: 'بصری' },
  { key: 'formal_informal', label: 'رسمی' },
  { key: 'local_global', label: 'محلی' },
  { key: 'interactive_oneway', label: 'تعاملی' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 12 }}>{d.label}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>امتیاز: {d.value}</Box>
    </Box>
  );
}

export function PersonaRadar({ data }) {
  const theme = useTheme();

  // Detect if data uses new axes (0-10) or legacy axes (0-100)
  const isNewFormat = data && ('narrative_focus' in data || 'emotional_intensity' in data);
  const dims = isNewFormat ? DIMENSIONS : LEGACY_DIMENSIONS;
  const maxValue = isNewFormat ? 10 : 100;

  const chartData = dims.map((dim) => ({
    label: dim.label,
    value: data?.[dim.key] ?? (isNewFormat ? 5 : 50),
    fullMark: maxValue,
  }));

  return (
    <ChartCard
      title="رادار شخصیت رسانه‌ای"
      icon="solar:user-id-bold-duotone"
      info="۶ بعد شخصیتی: تمرکز روایی، شدت احساسی، توان بسیج، عمق تحلیلی، لحن نهادی، نزدیکی مخاطب"
    >
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
            <PolarRadiusAxis angle={30} domain={[0, maxValue]} tick={{ fontSize: 9, fill: theme.palette.text.secondary }} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="شخصیت"
              dataKey="value"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
