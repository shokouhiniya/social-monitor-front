'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartCard } from '../../dashboard/components/chart-card';

// ----------------------------------------------------------------------

const CONTACT_TYPES = {
  direct: { label: 'دایرکت', icon: 'solar:chat-round-dots-bold', color: 'primary' },
  phone: { label: 'تماس تلفنی', icon: 'solar:phone-bold', color: 'info' },
  meeting: { label: 'جلسه', icon: 'solar:users-group-rounded-bold', color: 'success' },
  email: { label: 'ایمیل', icon: 'solar:letter-bold', color: 'warning' },
  comment: { label: 'کامنت', icon: 'solar:chat-line-bold', color: 'secondary' },
};

// Demo data — in production this would come from an API
const DEMO_INTERACTIONS = [
  { id: 1, date: '2026-04-08', type: 'direct', result: 'success', responsible: 'علی محمدی', note: 'ارسال محتوای پیشنهادی — پاسخ مثبت' },
  { id: 2, date: '2026-04-05', type: 'comment', result: 'success', responsible: 'سارا احمدی', note: 'لایک و ریپلای استوری — واکنش مثبت' },
  { id: 3, date: '2026-03-28', type: 'phone', result: 'failed', responsible: 'رضا حسینی', note: 'تماس بی‌پاسخ — پیگیری مجدد لازم' },
];

export function InteractionLedger({ pageId }) {
  const [open, setOpen] = useState(false);
  const [interactions] = useState(DEMO_INTERACTIONS);
  const [form, setForm] = useState({ type: 'direct', result: 'success', responsible: '', note: '' });

  return (
    <ChartCard
      title="دفترچه تعاملات"
      icon="solar:notebook-bold-duotone"
      info="سوابق تماس‌های مستقیم با ادمین پیج — حافظه تیم برای جلوگیری از سوءتفاهم"
      action={
        <Button size="small" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          ثبت تعامل
        </Button>
      }
    >
      <Stack spacing={1}>
        {interactions.map((item) => {
          const typeConf = CONTACT_TYPES[item.type] || CONTACT_TYPES.direct;
          return (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={(theme) => ({
                p: 1.5, borderRadius: 1,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 36, height: 36, borderRadius: 1, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: alpha(theme.palette[typeConf.color].main, 0.1),
                })}
              >
                <Iconify icon={typeConf.icon} width={18} sx={{ color: `${typeConf.color}.main` }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{typeConf.label}</Typography>
                  <Chip
                    label={item.result === 'success' ? 'موفق' : 'ناموفق'}
                    size="small"
                    color={item.result === 'success' ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ height: 18, fontSize: 9 }}
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {item.responsible}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {item.note}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, flexShrink: 0 }}>
                {new Date(item.date).toLocaleDateString('fa-IR')}
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ثبت تعامل جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth size="small" label="نوع تماس" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(CONTACT_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="نتیجه" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}>
              <MenuItem value="success">موفق</MenuItem>
              <MenuItem value="failed">ناموفق</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="مسئول" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            <TextField fullWidth size="small" label="یادداشت" multiline rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>ثبت</Button>
        </DialogActions>
      </Dialog>
    </ChartCard>
  );
}
