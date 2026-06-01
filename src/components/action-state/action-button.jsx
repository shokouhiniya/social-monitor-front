'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------
// دکمهٔ آگاه به حالت loading (Requirement 14.2).
//
// در حین اجرای action، دکمه disable می‌شود و یک spinner نمایش داده می‌شود تا از
// ارسال دوگانه جلوگیری شود. روی MUI Button استاندارد ساخته شده تا با تم Minimals
// و RTL سازگار بماند.
// ----------------------------------------------------------------------

/**
 * @param {object} props
 * @param {boolean} [props.loading] آیا action در حال اجراست
 * @param {boolean} [props.disabled] غیرفعال‌سازی مستقل از loading
 * @param {React.ReactNode} [props.startIcon] آیکن ابتدای دکمه (در حالت loading جای خود را به spinner می‌دهد)
 * @param {React.ReactNode} props.children محتوای دکمه
 */
export function ActionButton({
  loading = false,
  disabled = false,
  startIcon,
  children,
  sx,
  ...other
}) {
  return (
    <Button
      disabled={loading || disabled}
      startIcon={
        loading ? <CircularProgress size={18} thickness={4} color="inherit" /> : startIcon
      }
      sx={[
        // عرض دکمه در حالت loading حفظ می‌شود تا پرش layout رخ ندهد.
        { position: 'relative' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Button>
  );
}
