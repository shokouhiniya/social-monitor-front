'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const MEDAL_CONFIG = [
  { icon: 'solar:crown-bold', color: '#FFD700', bg: '#FFD700', label: '🥇' },
  { icon: 'solar:medal-ribbon-bold', color: '#C0C0C0', bg: '#C0C0C0', label: '🥈' },
  { icon: 'solar:medal-ribbon-bold', color: '#CD7F32', bg: '#CD7F32', label: '🥉' },
];

const PLATFORM_ICONS = {
  instagram: 'mdi:instagram', twitter: 'mdi:twitter', telegram: 'mdi:telegram',
};

export function TopInfluencersRank({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="رتبه‌بندی نفوذ" icon="solar:crown-bold-duotone" info="پیج‌هایی که بیشترین تاثیر را بر شبکه دارند" sx={{ height: '100%' }}>
        <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = data || [];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3, 10);
  const maxScore = items.length > 0 ? items[0].influence_score : 10;

  return (
    <ChartCard
      title="رتبه‌بندی نفوذ"
      icon="solar:crown-bold-duotone"
      info="پیج‌هایی با بیشترین ضریب نفوذ — بر اساس بازنشر، ارجاع و تعامل"
      sx={{ height: '100%' }}
    >
      {/* Podium - Top 3 */}
      <Stack direction="row" alignItems="flex-end" justifyContent="center" spacing={1} sx={{ mb: 3, pt: 1 }}>
        {[1, 0, 2].map((podiumIdx) => {
          const item = top3[podiumIdx];
          if (!item) return <Box key={podiumIdx} sx={{ width: 80 }} />;
          const medal = MEDAL_CONFIG[podiumIdx];
          const isFirst = podiumIdx === 0;
          const height = isFirst ? 90 : podiumIdx === 1 ? 70 : 55;

          return (
            <Tooltip key={item.id} title={`${item.name} — نفوذ: ${item.influence_score?.toFixed(1)} — ${item.followers_count?.toLocaleString()} فالوور`} arrow>
              <Stack alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={item.profile_image_url}
                    sx={{
                      width: isFirst ? 56 : 44,
                      height: isFirst ? 56 : 44,
                      border: `3px solid ${medal.color}`,
                      boxShadow: `0 0 12px ${alpha(medal.color, 0.4)}`,
                    }}
                  >
                    {item.name?.[0]}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 16, lineHeight: 1,
                    }}
                  >
                    {medal.label}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, textAlign: 'center', maxWidth: 80 }} noWrap>
                  {item.name}
                </Typography>
                <Box
                  sx={{
                    width: isFirst ? 80 : 65,
                    height,
                    borderRadius: '8px 8px 0 0',
                    bgcolor: alpha(medal.color, 0.15),
                    border: `1px solid ${alpha(medal.color, 0.3)}`,
                    borderBottom: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: medal.color }}>
                    {item.influence_score?.toFixed(1)}
                  </Typography>
                </Box>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>

      {/* Rest of the list */}
      <Stack spacing={0.75}>
        {rest.map((item, index) => {
          const rank = index + 4;
          const barPercent = Math.round((item.influence_score / maxScore) * 100);

          return (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={(t) => ({
                p: 0.75,
                borderRadius: 1,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(t.palette.grey[500], 0.08) },
              })}
            >
              <Typography variant="caption" sx={{ width: 18, textAlign: 'center', fontWeight: 600, color: 'text.disabled' }}>
                {rank}
              </Typography>
              <Avatar src={item.profile_image_url} sx={{ width: 28, height: 28, fontSize: 11 }}>
                {item.name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: 11 }} noWrap>
                  {item.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={barPercent}
                  sx={{
                    height: 4, borderRadius: 1, mt: 0.25,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '& .MuiLinearProgress-bar': { borderRadius: 1 },
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 11 }}>
                {item.influence_score?.toFixed(1)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
