'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import {
  jalaliNow,
  JALALI_MONTHS,
  jalaliYearOptions,
  jalaliMonthToGregorianISO,
} from 'src/utils/format-jalali';

import { useBatchScore, useScoreIndicators } from 'src/api/media-score';
import { useMicroMediaList, useMicroMediaScores } from 'src/api/micro-media';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

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
    <>
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

      {/* ─── ایمپورت گروهی ─── */}
      <BulkScoreImport indicators={activeIndicators} mediaOptions={options} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else { cur += ch; }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function BulkScoreImport({ indicators, mediaOptions }) {
  const fileRef = useRef(null);
  const { user } = useAuthContext();
  const batchScore = useBatchScore();
  const now = jalaliNow();
  const [jYear, setJYear] = useState(now.jy);
  const [jMonth, setJMonth] = useState(now.jm);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const yearOptions = jalaliYearOptions();

  // ساخت template CSV: ستون‌ها = id, name, [هر شاخص]
  const handleDownloadTemplate = () => {
    const headers = ['id', 'name', ...indicators.map((i) => i.title)];
    const rows = mediaOptions.map((m) =>
      [m.id, m.name, ...indicators.map(() => '')].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `score_template_${jYear}_${jMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== 'string') return;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { setPreview(null); return; }
      const headers = parseCsvLine(lines[0]);
      // شاخص‌ها بر اساس عنوان match می‌شوند
      const indicatorCols = indicators.map((ind) => ({
        ind,
        colIdx: headers.findIndex((h) => h === ind.title),
      })).filter((x) => x.colIdx >= 0);

      const idColIdx = headers.findIndex((h) => h.toLowerCase() === 'id');

      const parsed = [];
      for (let r = 1; r < lines.length; r += 1) {
        const vals = parseCsvLine(lines[r]);
        const mmId = Number(vals[idColIdx]);
        if (!mmId) continue;
        const scores = [];
        for (const { ind, colIdx } of indicatorCols) {
          const v = vals[colIdx];
          if (v !== '' && v !== undefined) {
            scores.push({ indicator_id: ind.id, value: Number(v), title: ind.title });
          }
        }
        if (scores.length > 0) {
          const name = mediaOptions.find((m) => m.id === mmId)?.name ?? `#${mmId}`;
          parsed.push({ micro_media_id: mmId, name, scores });
        }
      }
      setPreview(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!preview?.length) return;
    setImporting(true);
    const period = jalaliMonthToGregorianISO(jYear, jMonth);
    let successCount = 0;
    let errorCount = 0;
    for (const row of preview) {
      try {
        await batchScore.mutateAsync({
          micro_media_id: row.micro_media_id,
          period_start: period,
          scored_by_user_id: user?.id ? Number(user.id) : undefined,
          scores: row.scores.map((s) => ({ indicator_id: s.indicator_id, value: s.value })),
        });
        successCount += 1;
      } catch {
        errorCount += 1;
      }
    }
    setImporting(false);
    setResult({ success: successCount, error: errorCount });
    setPreview(null);
    toast.success(`${successCount} میکرورسانه ثبت شد`);
  };

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Iconify icon="solar:upload-bold-duotone" width={22} sx={{ color: 'info.main' }} />
        <Typography variant="subtitle1">ثبت گروهی امتیاز از CSV</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField select size="small" label="ماه (دوره)" value={jMonth} onChange={(e) => setJMonth(Number(e.target.value))} sx={{ minWidth: 120 }}>
          {JALALI_MONTHS.map((m, idx) => <MenuItem key={m} value={idx + 1}>{m}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="سال" value={jYear} onChange={(e) => setJYear(Number(e.target.value))} sx={{ minWidth: 90 }}>
          {yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:file-download-bold" />}
          onClick={handleDownloadTemplate}
        >
          دانلود قالب CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFileUpload} />
        <Button
          variant="outlined"
          color="info"
          startIcon={<Iconify icon="solar:upload-bold" />}
          onClick={() => fileRef.current?.click()}
        >
          بارگذاری فایل
        </Button>
      </Stack>

      {preview && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            {preview.length} میکرورسانه با امتیاز شناسایی شد — دوره: {JALALI_MONTHS[jMonth - 1]} {jYear}
          </Alert>
          <Stack spacing={0.5} sx={{ maxHeight: 200, overflow: 'auto' }}>
            {preview.slice(0, 10).map((r) => (
              <Typography key={r.micro_media_id} variant="caption">
                {r.name}: {r.scores.map((s) => `${s.title}=${s.value}`).join(' | ')}
              </Typography>
            ))}
            {preview.length > 10 && (
              <Typography variant="caption" color="text.disabled">و {preview.length - 10} مورد دیگر...</Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleConfirmImport}
              disabled={importing}
              startIcon={importing ? <CircularProgress size={16} /> : <Iconify icon="solar:check-circle-bold" />}
            >
              {importing ? 'در حال ثبت...' : `ثبت ${preview.length} مورد`}
            </Button>
            <Button color="inherit" onClick={() => setPreview(null)}>انصراف</Button>
          </Stack>
        </Box>
      )}

      {result && (
        <Alert severity="success" onClose={() => setResult(null)}>
          {result.success} میکرورسانه با موفقیت ثبت شد{result.error > 0 ? ` — ${result.error} خطا` : ''}
        </Alert>
      )}
    </Card>
  );
}
