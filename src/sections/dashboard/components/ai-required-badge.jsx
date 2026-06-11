'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * یک wrapper که روی کامپوننت‌های وابسته به AI می‌پیچد.
 * محتوا را با یک overlay خاکستری نیمه‌شفاف پوشش می‌دهد و یک
 * badge «نیاز به AI» نمایش می‌دهد.
 *
 * props:
 *   - children: کامپوننت اصلی
 *   - title: عنوان ماژول (اختیاری)
 */
export function AiRequiredBadge({ children, title }) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* محتوای اصلی — با opacity کمتر */}
      <Box sx={{ opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </Box>

      {/* Overlay */}
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.75),
          backdropFilter: 'blur(4px)',
          border: `1px dashed ${alpha(theme.palette.text.disabled, 0.3)}`,
          gap: 1,
          p: 3,
        })}
      >
        <Iconify
          icon="solar:cpu-bolt-bold-duotone"
          width={36}
          sx={{ color: 'text.disabled', mb: 0.5 }}
        />

        {title && (
          <Typography variant="subtitle2" color="text.secondary" textAlign="center">
            {title}
          </Typography>
        )}

        <Chip
          size="small"
          icon={<Iconify icon="solar:cpu-bolt-bold-duotone" width={14} />}
          label="نیاز به AI"
          color="default"
          variant="outlined"
          sx={{
            fontSize: 11,
            color: 'text.disabled',
            borderColor: 'divider',
          }}
        />

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon="solar:info-circle-bold-duotone" width={14} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled" textAlign="center">
            این ماژول برای تولید نتیجه به سرویس هوش مصنوعی وابسته است
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
