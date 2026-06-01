'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// primitive حالت خالی (Requirement 14.4).
//
// یک empty state معنادار با راهنمای اقدام بعدی نمایش می‌دهد (نه صفحهٔ خالی
// بی‌توضیح). به‌صورت پیش‌فرض پیام «داده‌ای برای نمایش نیست» و امکان افزودن یک
// دکمهٔ اقدام (action) را فراهم می‌کند.
// ----------------------------------------------------------------------

/**
 * @param {object} props
 * @param {string} [props.title] عنوان فارسی (پیش‌فرض: «داده‌ای برای نمایش نیست»)
 * @param {string} [props.description] راهنمای اقدام بعدی به فارسی
 * @param {string} [props.icon] نام آیکن iconify (پیش‌فرض: solar:inbox-bold)
 * @param {string} [props.actionLabel] برچسب دکمهٔ اقدام
 * @param {() => void} [props.onAction] هندلر دکمهٔ اقدام
 * @param {React.ReactNode} [props.action] گرهٔ اقدام سفارشی (جایگزین actionLabel/onAction)
 * @param {number|string} [props.minHeight]
 */
export function EmptyState({
  title = 'داده‌ای برای نمایش نیست',
  description,
  icon = 'solar:inbox-bold',
  actionLabel,
  onAction,
  action,
  minHeight = 240,
  sx,
  ...other
}) {
  // اقدام سفارشی اولویت دارد؛ در غیر این صورت اگر برچسب و هندلر باشد دکمهٔ پیش‌فرض ساخته می‌شود.
  const renderedAction =
    action ??
    (actionLabel && typeof onAction === 'function' ? (
      <Button
        variant="contained"
        onClick={onAction}
        startIcon={<Iconify icon="solar:add-circle-bold" />}
        sx={{ mt: 1 }}
      >
        {actionLabel}
      </Button>
    ) : null);

  return (
    <Box
      sx={[
        {
          width: 1,
          minHeight,
          gap: 1.5,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon={icon} width={56} sx={{ color: 'text.disabled' }} />

      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>

      {description ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
          {description}
        </Typography>
      ) : null}

      {renderedAction}
    </Box>
  );
}
