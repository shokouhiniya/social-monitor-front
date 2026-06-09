import { useMemo } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  jalaliNow,
  JALALI_MONTHS,
  dateToJalaliParts,
  jalaliDaysInMonth,
  jalaliYearOptions,
  jalaliToGregorianISO,
} from 'src/utils/format-jalali';

// ----------------------------------------------------------------------
// انتخاب‌گر تاریخ شمسی (سال/ماه/روز).
// مقدار ورودی و خروجی به‌صورت رشتهٔ میلادی ISO `YYYY-MM-DD` است تا با بک‌اند سازگار بماند.
// ----------------------------------------------------------------------

export function ShamsiDatePicker({ label = 'تاریخ', value, onChange, yearSpan = 8, fullWidth = true }) {
  const { jy, jm, jd } = useMemo(() => {
    if (value) return dateToJalaliParts(value);
    const now = jalaliNow();
    return { jy: now.jy, jm: now.jm, jd: dateToJalaliParts(new Date()).jd };
  }, [value]);

  const years = useMemo(() => jalaliYearOptions(yearSpan), [yearSpan]);
  const daysInMonth = useMemo(() => jalaliDaysInMonth(jy, jm), [jy, jm]);
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const emit = (nextY, nextM, nextD) => {
    const clampedDay = Math.min(nextD, jalaliDaysInMonth(nextY, nextM));
    const iso = jalaliToGregorianISO(nextY, nextM, clampedDay);
    onChange?.(iso);
  };

  return (
    <Stack spacing={0.75} sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label ? (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      ) : null}
      <Stack direction="row" spacing={1}>
        <TextField
          select
          size="small"
          label="روز"
          value={jd}
          onChange={(e) => emit(jy, jm, Number(e.target.value))}
          sx={{ minWidth: 80 }}
        >
          {days.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="ماه"
          value={jm}
          onChange={(e) => emit(jy, Number(e.target.value), jd)}
          sx={{ flex: 1, minWidth: 120 }}
        >
          {JALALI_MONTHS.map((name, idx) => (
            <MenuItem key={name} value={idx + 1}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="سال"
          value={jy}
          onChange={(e) => emit(Number(e.target.value), jm, jd)}
          sx={{ minWidth: 90 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  );
}
