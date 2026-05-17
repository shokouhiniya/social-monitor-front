'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * A box that introduces what the page does, with an optional "more details" popup.
 *
 * Props:
 * - title: page title (shown in box and in the dialog)
 * - icon: solar icon name
 * - color: theme color key ('primary' | 'info' | 'warning' | 'error' | 'success' | 'secondary')
 * - shortDescription: 1-2 sentence summary shown inline
 * - modules: optional array of { name, icon, description } shown in the dialog
 * - tips: optional array of tip strings shown in the dialog
 */
export function PageInfoBox({ title, icon, color = 'primary', shortDescription, modules, tips }) {
  const [open, setOpen] = useState(false);
  const hasMore = (modules && modules.length > 0) || (tips && tips.length > 0);

  return (
    <>
      <Card
        sx={(theme) => ({
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.06)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
        })}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette[color].main, 0.14),
              flexShrink: 0,
            })}
          >
            <Iconify icon={icon} width={26} sx={{ color: `${color}.main` }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {shortDescription}
            </Typography>
          </Box>
          {hasMore && (
            <Button
              size="small"
              variant="outlined"
              color={color}
              startIcon={<Iconify icon="solar:info-circle-bold-duotone" width={16} />}
              onClick={() => setOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              توضیحات تکمیلی
            </Button>
          )}
        </Stack>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={(theme) => ({
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette[color].main, 0.12),
              })}
            >
              <Iconify icon={icon} width={22} sx={{ color: `${color}.main` }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
              <Typography variant="caption" color="text.secondary">{shortDescription}</Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Iconify icon="solar:close-circle-bold" width={22} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {modules && modules.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                <Iconify icon="solar:widget-bold-duotone" width={16} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                ماژول‌های این صفحه
              </Typography>
              <Stack spacing={1.25}>
                {modules.map((m, idx) => (
                  <Card
                    key={idx}
                    sx={(theme) => ({
                      p: 1.75,
                      border: `1px solid ${alpha(theme.palette[m.color || color].main, 0.15)}`,
                      bgcolor: alpha(theme.palette[m.color || color].main, 0.03),
                    })}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box
                        sx={(theme) => ({
                          width: 36,
                          height: 36,
                          borderRadius: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette[m.color || color].main, 0.12),
                          flexShrink: 0,
                        })}
                      >
                        <Iconify icon={m.icon} width={20} sx={{ color: `${m.color || color}.main` }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                          {m.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {tips && tips.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                <Iconify icon="solar:lightbulb-bold-duotone" width={16} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                نکات کاربردی
              </Typography>
              <Stack spacing={1}>
                {tips.map((tip, idx) => (
                  <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                    <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: 'success.main', mt: 0.5, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.8, fontSize: 13 }}>{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
