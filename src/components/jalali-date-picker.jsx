'use client';

import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import {
  jalaliNow,
  JALALI_MONTHS,
  jalaliYearOptions,
  jalaliDaysInMonth,
  dateToJalaliParts,
  jalaliToGregorianISO,
} from 'src/utils/format-jalali';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Date picker شمسی ساده (بدون popup calendar) — ۳ dropdown: سال/ماه/روز.
 *
 * props:
 *  - value: ISO date string (YYYY-MM-DD) — مقدار میلادی ذخیره‌شده
 *  - onChange: (isoDate: string) => void — مقدار میلادی جدید
 *  - label: عنوان (اختیاری)
 *  - size: 'small' | 'medium' (پیش‌فرض: small)
 *  - fullWidth: boolean
 *  - yearSpan: تعداد سال‌ها برای dropdown (پیش‌فرض: 6)
 */
export function JalaliDatePicker({ value, onChange, label, size = 'small', fullWidth, yearSpan = 6 }) {
  const years = useMemo(() => jalaliYearOptions(yearSpan), [yearSpan]);
  const { jy: nowJy, jm: nowJm } = jalaliNow();

  const [jy, setJy] = useState(nowJy);
  const [jm, setJm] = useState(nowJm);
  const [jd, setJd] = useState(1);

  // Sync from external value
  useEffect(() => {
    if (value) {
      const parts = dateToJalaliParts(value);
      setJy(parts.jy);
      setJm(parts.jm);
      setJd(parts.jd);
    }
  }, [value]);

  const daysInMonth = jalaliDaysInMonth(jy, jm);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const handleChange = (newJy, newJm, newJd) => {
    const clamped = Math.min(newJd, jalaliDaysInMonth(newJy, newJm));
    setJy(newJy);
    setJm(newJm);
    setJd(clamped);
    const iso = jalaliToGregorianISO(newJy, newJm, clamped);
    if (iso) onChange?.(iso);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && null /* label handled by wrapper if needed */}
      <TextField
        select
        size={size}
        label={label || 'سال'}
        value={jy}
        onChange={(e) => handleChange(Number(e.target.value), jm, jd)}
        sx={{ minWidth: 90 }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>{y}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size={size}
        label="ماه"
        value={jm}
        onChange={(e) => handleChange(jy, Number(e.target.value), jd)}
        sx={{ minWidth: 100 }}
      >
        {JALALI_MONTHS.map((m, i) => (
          <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size={size}
        label="روز"
        value={jd}
        onChange={(e) => handleChange(jy, jm, Number(e.target.value))}
        sx={{ minWidth: 70 }}
      >
        {days.map((d) => (
          <MenuItem key={d} value={d}>{d}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
