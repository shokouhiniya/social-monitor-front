'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { getErrorMessage, isRetryableErrorCode } from 'src/lib/error-messages';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// primitive حالت خطا (Requirement 14.3).
//
// یک پیام خطای فارسی مبتنی بر `error.code` نمایش می‌دهد و در عملیات قابل‌تکرار
// دکمهٔ «تلاش دوباره» ارائه می‌کند. ورودی می‌تواند:
//   - یک ApiError نرمال‌شده ({ code, message, retryable, ... }) از extractApiError، یا
//   - یک کد نمادین خام (string)، یا
//   - یک Error غنی‌شده توسط interceptor (دارای فیلد code).
// باشد.
// ----------------------------------------------------------------------

/**
 * ApiError را از ورودی‌های گوناگون نرمال می‌کند.
 *
 * @param {import('src/lib/envelope').ApiError | Error | string | null | undefined} error
 * @returns {{ code: string | undefined, message: string, retryable: boolean }}
 */
function normalizeError(error) {
  if (!error) {
    return { code: undefined, message: getErrorMessage(undefined), retryable: false };
  }

  // رشتهٔ کد نمادین
  if (typeof error === 'string') {
    return {
      code: error,
      message: getErrorMessage(error),
      retryable: isRetryableErrorCode(error),
    };
  }

  // ApiError نرمال‌شده یا Error غنی‌شده
  const code = error.code;
  const message = error.message && error.uiMessage ? error.uiMessage : error.message;
  return {
    code,
    // برای ApiError فیلد message همان پیام فارسی است؛ برای Error خام از uiMessage
    // یا نگاشت کد استفاده می‌کنیم تا پیام انگلیسی سرور نمایش داده نشود.
    message: error.uiMessage || (code ? getErrorMessage(code) : message) || getErrorMessage(undefined),
    retryable:
      typeof error.retryable === 'boolean' ? error.retryable : isRetryableErrorCode(code),
  };
}

/**
 * @param {object} props
 * @param {import('src/lib/envelope').ApiError | Error | string} props.error خطای رخ‌داده
 * @param {() => void} [props.onRetry] هندلر تلاش دوباره (در صورت وجود و قابل‌تکرار بودن، دکمه نمایش داده می‌شود)
 * @param {boolean} [props.retrying] آیا در حال تلاش دوباره است (برای disable کردن دکمه)
 * @param {string} [props.title] عنوان اختیاری بالای پیام
 * @param {number|string} [props.minHeight]
 */
export function ErrorState({
  error,
  onRetry,
  retrying = false,
  title = 'خطایی رخ داد',
  minHeight = 240,
  sx,
  ...other
}) {
  const { message, retryable } = normalizeError(error);
  // فقط وقتی دکمهٔ retry را نشان می‌دهیم که هندلر داده شده و خطا قابل‌تکرار باشد.
  const showRetry = typeof onRetry === 'function' && retryable;

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
      <Iconify icon="solar:danger-bold" width={48} sx={{ color: 'error.main' }} />

      {title ? (
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
      ) : null}

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
        {message}
      </Typography>

      {showRetry ? (
        <Button
          variant="outlined"
          color="error"
          disabled={retrying}
          onClick={onRetry}
          startIcon={<Iconify icon="solar:restart-bold" />}
          sx={{ mt: 1 }}
        >
          تلاش دوباره
        </Button>
      ) : null}
    </Box>
  );
}
