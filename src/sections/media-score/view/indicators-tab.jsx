'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useScoreIndicators, useCreateIndicator, useUpdateIndicator } from 'src/api/media-score';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function IndicatorsTab() {
  const { data: indicators, isLoading } = useScoreIndicators(true);
  const updateIndicator = useUpdateIndicator();
  const createIndicator = useCreateIndicator();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ key: '', title: '', min_value: 0, max_value: 100, weight: 1 });

  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    await createIndicator.mutateAsync({
      key: form.key,
      title: form.title,
      min_value: Number(form.min_value),
      max_value: Number(form.max_value),
      weight: Number(form.weight),
    });
    setOpen(false);
    setForm({ key: '', title: '', min_value: 0, max_value: 100, weight: 1 });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          شاخص‌های ارزیابی انسانی. فعال/غیرفعال‌سازی و وزن‌دهی فقط برای مدیر کل مجاز است.
        </Typography>
        <Button variant="outlined" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpen(true)}>
          شاخص جدید
        </Button>
      </Stack>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>شاخص</TableCell>
                  <TableCell>کلید</TableCell>
                  <TableCell align="center">بازه</TableCell>
                  <TableCell align="center">وزن</TableCell>
                  <TableCell align="center">فعال</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(indicators ?? []).map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>{i.title}</TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{i.key}</Typography></TableCell>
                    <TableCell align="center">{i.min_value} – {i.max_value}</TableCell>
                    <TableCell align="center" sx={{ width: 120 }}>
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={i.weight}
                        onBlur={(e) => {
                          const w = Number(e.target.value);
                          if (w !== i.weight) updateIndicator.mutate({ id: i.id, data: { weight: w } });
                        }}
                        sx={{ width: 90 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={i.is_active}
                        onChange={(e) => updateIndicator.mutate({ id: i.id, data: { is_active: e.target.checked } })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>شاخص جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="عنوان (فارسی)" value={form.title} onChange={setF('title')} fullWidth />
            <TextField label="کلید (انگلیسی، یکتا)" value={form.key} onChange={setF('key')} fullWidth placeholder="e.g. reach_quality" />
            <Stack direction="row" spacing={2}>
              <TextField label="حداقل" type="number" value={form.min_value} onChange={setF('min_value')} fullWidth />
              <TextField label="حداکثر" type="number" value={form.max_value} onChange={setF('max_value')} fullWidth />
              <TextField label="وزن" type="number" value={form.weight} onChange={setF('weight')} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.key || !form.title || createIndicator.isPending}>ایجاد</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
