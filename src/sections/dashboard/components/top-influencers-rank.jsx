'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { proxyImage } from 'src/utils/proxy-image';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

export function TopInfluencersRank({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="رتبه‌بندی نفوذ" icon="solar:crown-bold-duotone" info="پیج‌هایی که بیشترین تاثیر را بر شبکه دارند" sx={{ height: '100%' }}>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
      </ChartCard>
    );
  }

  const items = (data || []).slice(0, 10);
  const maxScore = items.length > 0 ? items[0].influence_score : 10;

  return (
    <ChartCard
      title="رتبه‌بندی نفوذ"
      icon="solar:crown-bold-duotone"
      info="پیج‌هایی با بیشترین ضریب نفوذ — بر اساس بازنشر، ارجاع و تعامل"
      sx={{ height: '100%' }}
    >
      <Stack spacing={0.75}>
        {items.map((item, index) => {
          const rank = index + 1;
          const barPercent = Math.round((item.influence_score / maxScore) * 100);
          const isTop3 = rank <= 3;

          return (
            <Tooltip key={item.id} title={`${item.followers_count?.toLocaleString()} فالوور • @${item.username}`} arrow>
              <Stack
                direction="row" alignItems="center" spacing={1}
                sx={(t) => ({
                  p: 0.75, borderRadius: 1, transition: 'all 0.2s',
                  bgcolor: isTop3 ? alpha(t.palette.warning.main, 0.04) : 'transparent',
                  '&:hover': { bgcolor: alpha(t.palette.grey[500], 0.08) },
                })}
              >
                <Typography variant="caption" sx={{ width: 18, textAlign: 'center', fontWeight: 700, color: isTop3 ? 'warning.main' : 'text.disabled', fontSize: isTop3 ? 12 : 11 }}>
                  {rank}
                </Typography>
                <Avatar src={proxyImage(item.profile_image_url)} sx={{ width: 30, height: 30, fontSize: 11, border: isTop3 ? '2px solid' : 'none', borderColor: 'warning.main' }}>
                  {item.name?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: 11 }} noWrap>
                    {item.name}
                  </Typography>
                  <LinearProgress
                    variant="determinate" value={barPercent}
                    sx={{
                      height: 4, borderRadius: 1, mt: 0.25,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '& .MuiLinearProgress-bar': { borderRadius: 1 },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isTop3 ? 'warning.main' : 'primary.main', fontSize: 11 }}>
                  {item.influence_score?.toFixed(1)}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
    </ChartCard>
  );
}
