'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import {
  jalaliNow,
  JALALI_MONTHS,
  jalaliYearOptions,
  jalaliMonthToGregorianISO,
} from 'src/utils/format-jalali';

import { useBatchScore, useScoreIndicators } from 'src/api/media-score';
import { useMicroMediaList, useMicroMediaScores } from 'src/api/micro-media';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const isOutOfRange = (v, min, max) => {
  if (v === '' || v === undefined || v === null) return false;
  const n = Number(v);
  if (Number.isNaN(n)) return true;
  return n < min || n > max;
};

export function ScoringTab() {
  const { user } = useAuthContext();
  const { data: indicators } = useScoreIndicators(false);
  const { data: mediaPage } = useMicroMediaList({ pageSize: 100 });
  const batchScore = useBatchScore();

  const [media, setMedia] = useState(null);
  const now = jalaliNow();
  const [jYear, setJYear] = useState(now.jy);
  const [jMonth, setJMonth] = useState(now.jm);
  const [values, setValues] = useState({});

  const options = mediaPage?.items ?? [];
  const activeIndicators = indicators ?? [];
  const yearOptions = jalaliYearOptions();

  // امتیازهای فعلی میکرورسانهٔ انتخاب‌شده (برای پیش‌پرکردن).
  const { data: existingScores } = useMicroMediaScores(media?.id);

  useEffect(() => {
    if (!media) {
      setValues({});
      return;
    }
    const map = {};
    (existingScores ?? []).forEach((s) => {
      // آخرین مقدار هر شاخص (records مرتب بر period_start DESC است).
      if (map[s.indicator_id] === undefined) map[s.indicator_id] = Number(s.value);
    });
    setValues(map);
  }, [media, existingScores]);

  const setVal = (indicatorId, v) =>
    setValues((prev) => ({ ...prev, [indicatorId]: v }));

  const hasInvalid = activeIndicators.some((ind) =>
    isOutOfRange(values[ind.id], ind.min_value, ind.max_value)
  );

  const handleSave = async () => {
    const entered = activeIndicators.filter(
      (ind) => values[ind.id] !== undefined && values[ind.id] !== ''
    );
    if (entered.length === 0) {
      toast.error('حداقل یک امتیاز وارد کنید');
      return;
    }

    // اعتبارسنجی فرانت: هیچ مقداری نباید خارج از بازهٔ شاخص باشد.
    const invalid = entered.filter((ind) =>
      isOutOfRange(values[ind.id], ind.min_value, ind.max_value)
    );
    if (invalid.length > 0) {
      const names = invalid.map((ind) => `«${ind.title}»`).join('، ');
      toast.error(`مقدار شاخص ${names} خارج از بازهٔ مجاز است`);
      return;
    }

    const scores = entered.map((ind) => ({
      indicator_id: ind.id,
      value: Number(values[ind.id]),
    }));

    const period = jalaliMonthToGregorianISO(jYear, jMonth);
    try {
      const res = await batchScore.mutateAsync({
        micro_media_id: media.id,
        period_start: period,
        scored_by_user_id: user?.id ? Number(user.id) : undefined,
        scores,
      });
      toast.success(
        `امتیازها برای دورهٔ ${JALALI_MONTHS[jMonth - 1]} ${jYear} ثبت شد (${res?.saved ?? scores.length} شاخص)`
      );
    } catch (err) {
      toast.error(err?.message || 'ثبت امتیاز با خطا مواجه شد');
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={options}
            value={media}
            onChange={(_, v) => setMedia(v)}
            getOptionLabel={(o) => o?.name ?? ''}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(p) => (
              <TextField {...p} label="میکرورسانه *" placeholder="جستجو..." />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            select
            fullWidth
            label="ماه (دوره)"
            value={jMonth}
            onChange={(e) => setJMonth(Number(e.target.value))}
          >
            {JALALI_MONTHS.map((m, idx) => (
              <MenuItem key={m} value={idx + 1}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            select
            fullWidth
            label="سال"
            value={jYear}
            onChange={(e) => setJYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {!media ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          برای ثبت امتیاز، ابتدا یک میکرورسانه انتخاب کنید.
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {activeIndicators.map((ind) => (
              <Box key={ind.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle2">{ind.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    بازه: {ind.min_value} تا {ind.max_value} — وزن: {ind.weight}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Slider
                    value={Number(values[ind.id] ?? ind.min_value)}
                    min={ind.min_value}
                    max={ind.max_value}
                    onChange={(_, v) => setVal(ind.id, v)}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="number"
                    size="small"
                    value={values[ind.id] ?? ''}
                    onChange={(e) => setVal(ind.id, e.target.value)}
                    error={isOutOfRange(values[ind.id], ind.min_value, ind.max_value)}
                    helperText={
                      isOutOfRange(values[ind.id], ind.min_value, ind.max_value)
                        ? `باید بین ${ind.min_value} و ${ind.max_value} باشد`
                        : ' '
                    }
                    sx={{ width: 140 }}
                    slotProps={{
                      htmlInput: { min: ind.min_value, max: ind.max_value },
                      input: {
                        endAdornment: <InputAdornment position="end">امتیاز</InputAdornment>,
                      },
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave} disabled={batchScore.isPending || hasInvalid}>
              ذخیرهٔ امتیازها
            </Button>
          </Stack>
        </Box>
      )}
    </Card>
  );
}
