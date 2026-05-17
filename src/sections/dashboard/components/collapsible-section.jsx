'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * A collapsible section card. Defaults to closed.
 *
 * Props:
 * - title: section title
 * - icon: solar icon name
 * - color: theme color key
 * - subtitle: short description
 * - badge: optional small label (e.g., count)
 * - defaultOpen: defaults to false
 * - children: any content
 */
export function CollapsibleSection({
  title,
  icon = 'solar:layers-bold-duotone',
  color = 'primary',
  subtitle,
  badge,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card
      sx={(theme) => ({
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
        overflow: 'hidden',
      })}
    >
      <Box
        onClick={() => setOpen(!open)}
        sx={(theme) => ({
          px: 2.5,
          py: 1.75,
          cursor: 'pointer',
          bgcolor: alpha(theme.palette[color].main, 0.04),
          borderBottom: open ? `1px solid ${alpha(theme.palette[color].main, 0.1)}` : 'none',
          transition: 'background 0.2s',
          '&:hover': { bgcolor: alpha(theme.palette[color].main, 0.08) },
        })}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 36,
              height: 36,
              borderRadius: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette[color].main, 0.12),
              flexShrink: 0,
            })}
          >
            <Iconify icon={icon} width={20} sx={{ color: `${color}.main` }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {badge !== undefined && badge !== null && (
                <Box
                  sx={(theme) => ({
                    px: 1,
                    py: 0.25,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette[color].main, 0.12),
                    color: `${color}.main`,
                    fontSize: 10,
                    fontWeight: 700,
                  })}
                >
                  {badge}
                </Box>
              )}
            </Stack>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton size="small">
            <Iconify
              icon={open ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
              width={20}
              sx={{ color: `${color}.main`, transition: 'transform 0.2s' }}
            />
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2.5 }}>{children}</Box>
      </Collapse>
    </Card>
  );
}
