'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { ChartCard } from './chart-card';

// ----------------------------------------------------------------------

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export function TopInfluencersRank({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <ChartCard title="رتبه‌بندی نفوذ" icon="solar:crown-bold-duotone" info="پیج‌هایی که بقیه از آن‌ها کپی می‌کنند">
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ChartCard>
    );
  }

  const items = data || [];

  return (
    <ChartCard
      title="رتبه‌بندی نفوذ"
      icon="solar:crown-bold-duotone"
      info="پیج‌های با بیشترین ضریب نفوذ در شبکه"
    >
      <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
        {items.slice(0, 10).map((item, index) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={(t) => ({
              p: 1,
              borderRadius: 1.5,
              bgcolor: index < 3 ? alpha(RANK_COLORS[index], 0.08) : 'transparent',
              border: index < 3 ? `1px solid ${alpha(RANK_COLORS[index], 0.2)}` : 'none',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha(t.palette.grey[500], 0.08) },
            })}
          >
            <Typography
              variant="caption"
              sx={{
                width: 20,
                textAlign: 'center',
                fontWeight: 700,
                color: index < 3 ? RANK_COLORS[index] : 'text.secondary',
                fontSize: index < 3 ? 14 : 12,
              }}
            >
              {index + 1}
            </Typography>

            <Avatar src={item.profile_image_url} sx={{ width: 30, height: 30, fontSize: 12 }}>
              {item.name?.[0]}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                {item.influence_score?.toFixed(1)}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
