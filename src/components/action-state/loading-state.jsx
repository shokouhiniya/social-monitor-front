'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------
// primitiveهای حالت loading برای بارگذاری صفحه/بخش (Requirement 14.2).
//
//   - <LoadingState />     : spinner مرکزی با پیام اختیاری فارسی.
//   - <LoadingSkeleton />  : چند خط skeleton برای placeholder لیست/کارت.
// ----------------------------------------------------------------------

/**
 * spinner مرکزی برای حالت بارگذاری یک بخش یا صفحه.
 *
 * @param {object} props
 * @param {string} [props.label] پیام فارسی زیر spinner
 * @param {number} [props.size] اندازهٔ spinner
 * @param {number|string} [props.minHeight] حداقل ارتفاع ناحیهٔ بارگذاری
 */
export function LoadingState({ label = 'در حال بارگذاری…', size = 40, minHeight = 240, sx, ...other }) {
  return (
    <Box
      sx={[
        {
          width: 1,
          minHeight,
          gap: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <CircularProgress size={size} />
      {label ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * چند ردیف skeleton به‌عنوان placeholder بارگذاری برای لیست‌ها/کارت‌ها.
 *
 * @param {object} props
 * @param {number} [props.rows] تعداد ردیف‌های skeleton
 * @param {number} [props.height] ارتفاع هر ردیف
 */
export function LoadingSkeleton({ rows = 4, height = 56, sx, ...other }) {
  return (
    <Stack
      spacing={1.5}
      sx={[{ width: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} animation="wave" />
      ))}
    </Stack>
  );
}
