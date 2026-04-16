'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { useCrisisCorridor } from 'src/api/analytics';

// ----------------------------------------------------------------------

export function CrisisCorridor() {
  const router = useRouter();
  const { data, isLoading } = useCrisisCorridor();

  if (isLoading) {
    return (
      <Box sx={{ p: 1, textAlign: 'center' }}><CircularProgress size={16} /></Box>
    );
  }

  const items = data || [];
  if (items.length === 0) return null;

  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        left: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.15)}`,
      })}
    >
      <Tooltip title="کریدور بحران" placement="right">
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
          <Iconify icon="solar:danger-triangle-bold-duotone" width={18} sx={{ color: 'error.main' }} />
        </Box>
      </Tooltip>

      {items.slice(0, 6).map((page) => (
        <Tooltip key={page.id} title={`${page.name} — بحران`} placement="right" arrow>
          <Avatar
            src={page.profile_image_url}
            onClick={() => router.push(paths.dashboard.pages.profile(page.id))}
            sx={(theme) => ({
              width: 36,
              height: 36,
              cursor: 'pointer',
              border: `2px solid ${theme.palette.error.main}`,
              animation: 'crisisPulse 1.5s infinite',
              '@keyframes crisisPulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.5)}` },
                '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
              },
              '&:hover': { transform: 'scale(1.15)' },
              transition: 'transform 0.2s',
            })}
          >
            {page.name?.[0]}
          </Avatar>
        </Tooltip>
      ))}
    </Box>
  );
}
