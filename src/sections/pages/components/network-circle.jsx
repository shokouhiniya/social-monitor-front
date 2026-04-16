'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

export function NetworkCircle({ page, relatedPages }) {
  const theme = useTheme();
  const router = useRouter();

  // Use reshared posts to find related pages, or fallback to same-cluster pages
  const connections = (relatedPages || []).slice(0, 8);

  if (!page || connections.length === 0) {
    return (
      <ChartCard title="حلقه نزدیکان" icon="solar:users-group-two-rounded-bold-duotone" info="پیج‌هایی که بیشترین تعامل را با این پیج دارند">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">داده تعامل کافی موجود نیست</Typography>
        </Box>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="حلقه نزدیکان"
      icon="solar:users-group-two-rounded-bold-duotone"
      info="پیج اصلی در مرکز و پیج‌های مرتبط در اطراف. برای اثرگذاری از طریق «دوست» در شبکه اقدام کنید."
    >
      <Box sx={{ position: 'relative', width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Center node */}
        <Tooltip title={page.name} arrow>
          <Avatar
            src={page.profile_image_url}
            sx={{
              width: 56, height: 56, position: 'absolute', zIndex: 2,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {page.name?.[0]}
          </Avatar>
        </Tooltip>

        {/* Connection lines + nodes */}
        {connections.map((conn, idx) => {
          const angle = (idx / connections.length) * 360;
          const distance = 100;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * distance;
          const y = Math.sin(rad) * distance;
          const strength = 1 - idx * 0.1;

          return (
            <Box key={conn.id}>
              {/* Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  width: distance,
                  height: 2 + strength * 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1 + strength * 0.2),
                  borderRadius: 1,
                  transformOrigin: '0 50%',
                  transform: `rotate(${angle}deg)`,
                  zIndex: 0,
                }}
              />
              {/* Node */}
              <Tooltip title={`${conn.name} • ${conn.category || '—'}`} arrow>
                <Avatar
                  src={conn.profile_image_url}
                  onClick={() => router.push(paths.dashboard.pages.profile(conn.id))}
                  sx={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    width: 36, height: 36,
                    cursor: 'pointer',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3 + strength * 0.4)}`,
                    zIndex: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  {conn.name?.[0]}
                </Avatar>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {connections.slice(0, 5).map((conn) => (
          <Stack key={conn.id} direction="row" alignItems="center" spacing={1}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, borderRadius: 0.5 }}
            onClick={() => router.push(paths.dashboard.pages.profile(conn.id))}
          >
            <Avatar src={conn.profile_image_url} sx={{ width: 24, height: 24, fontSize: 10 }}>{conn.name?.[0]}</Avatar>
            <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }} noWrap>{conn.name}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{conn.cluster || '—'}</Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  );
}
