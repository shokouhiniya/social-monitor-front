'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

import { ChartCard } from '../../dashboard/components/chart-card';
import { useSentimentInfluenceMatrix } from 'src/api/analytics';

// ----------------------------------------------------------------------

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 3 }}>
      <Box sx={{ fontWeight: 700, fontSize: 12 }}>{d.name}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>نفوذ: {d.influence?.toFixed(1)}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>احساس: {d.sentiment?.toFixed(2)}</Box>
      <Box sx={{ fontSize: 11, color: 'text.secondary' }}>تعامل: {d.engagement?.toLocaleString()}</Box>
    </Box>
  );
}

export function SentimentInfluenceMatrix() {
  const theme = useTheme();
  const { data, isLoading } = useSentimentInfluenceMatrix();

  if (isLoading) {
    return (
      <ChartCard title="ماتریس نفوذ و احساس" icon="solar:chart-2-bold-duotone" info="آیا خشم توسط پیج‌های بزرگ پمپاژ می‌شود یا کوچک؟">
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).map((d) => ({ ...d, size: Math.max(Math.log(d.engagement + 1) * 3, 4) }));

  return (
    <ChartCard
      title="ماتریس نفوذ و احساس"
      icon="solar:chart-2-bold-duotone"
      info="هر نقطه یک پیج. محور افقی = نفوذ، عمودی = احساس. تجمع در ناحیه «نفوذ بالا + خشم» = بحران جدی"
    >
      <Box sx={{ height: 350, direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis type="number" dataKey="influence" name="نفوذ" domain={[0, 10]} tick={{ fontSize: 10, fill: theme.palette.text.secondary }} label={{ value: 'نفوذ →', position: 'insideBottomRight', fontSize: 10, fill: theme.palette.text.disabled }} />
            <YAxis type="number" dataKey="sentiment" name="احساس" domain={[-1, 1]} tick={{ fontSize: 10, fill: theme.palette.text.secondary }} label={{ value: '← احساس', position: 'insideTopLeft', fontSize: 10, fill: theme.palette.text.disabled }} />
            <ReferenceLine y={0} stroke={theme.palette.text.disabled} strokeDasharray="5 5" />
            <ReferenceArea x1={7} x2={10} y1={-1} y2={-0.3} fill={theme.palette.error.main} fillOpacity={0.06} />
            <ReferenceArea x1={7} x2={10} y1={0.3} y2={1} fill={theme.palette.success.main} fillOpacity={0.06} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={items} fill={theme.palette.primary.main} fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
}
