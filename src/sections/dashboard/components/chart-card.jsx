'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ChartCard({
  title,
  info,
  icon,
  children,
  timeRange,
  onTimeRangeChange,
  timeRangeOptions,
  action,
  sx,
}) {
  return (
    <Card sx={{ p: 3, ...sx }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && (
            <Iconify icon={icon} width={22} sx={{ color: 'text.secondary' }} />
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {info && (
            <Tooltip title={info} arrow placement="top">
              <IconButton size="small" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                <Iconify icon="solar:info-circle-line-duotone" width={16} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {timeRangeOptions && onTimeRangeChange && (
            <ToggleButtonGroup
              size="small"
              value={timeRange}
              exclusive
              onChange={(_, v) => { if (v) onTimeRangeChange(v); }}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.25,
                  fontSize: 11,
                  fontWeight: 600,
                },
              }}
            >
              {timeRangeOptions.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
          {action}
        </Stack>
      </Stack>

      <Box>{children}</Box>
    </Card>
  );
}
