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
import { toJalali } from 'src/utils/format-jalali';

// ----------------------------------------------------------------------

const CONTACT_TYPES = {
  direct: { label: 'دایرکت', icon: 'solar:chat-round-dots-bold', color: 'primary' },
  phone: { label: 'تماس تلفنی', icon: 'solar:phone-bold', color: 'info' },
  meeting: { label: 'جلسه', icon: 'solar:users-group-rounded-bold', color: 'success' },
  email: { label: 'ایمیل', icon: 'solar:letter-bold', color: 'warning' },
  comment: { label: 'کامنت', icon: 'solar:chat-line-bold', color: 'secondary' },
};

const DEMO_INTERACTIONS = [
  { id: 1, date: '2026-04-08', type: 'direct', result: 'success', responsible: 'علی محمدی', note: 'ارسال محتوای پیشنهادی — پاسخ مثبت' },
  { id: 2, date: '2026-04-05', type: 'comment', result: 'success', responsible: 'سارا احمدی', note: 'لایک و ریپلای استوری — واکنش مثبت' },
  { id: 3, date: '2026-03-28', type: 'phone', result: 'failed', responsible: 'رضا حسینی', note: 'تماس بی‌پاسخ — پیگیری مجدد لازم' },
  { id: 4, date: '2026-03-20', type: 'meeting', result: 'success', responsible: 'علی محمدی', note: 'جلسه حضوری — توافق اولیه' },
  { id: 5, date: '2026-03-15', type: 'direct', result: 'failed', responsible: 'سارا احمدی', note: 'پیام دایرکت — بدون پاسخ' },
];

function InteractionRow({ item }) {
  const typeConf = CONTACT_TYPES[item.type] || CONTACT_TYPES.direct;
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}
      sx={(theme) => ({
        p: 1.5, borderRadius: 1,
        bgcolor: alpha(theme.palette.grey[500], 0.04),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
      })}
    >
      <Box sx={(theme) => ({ width: 32, height: 32, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[typeConf.color].main, 0.1) })}>
        <Iconify icon={typeConf.icon} width={16} sx={{ color: `${typeConf.color}.main` }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>{typeConf.label}</Typography>
          <Chip label={item.result === 'success' ? 'موفق' : 'ناموفق'} size="small"
            color={item.result === 'success' ? 'success' : 'error'} variant="outlined" sx={{ height: 18, fontSize: 9 }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{item.responsible}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{item.note}</Typography>
      </Box>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, flexShrink: 0 }}>{toJalali(item.date)}</Typography>
    </Stack>
  );
}

export function InteractionLedger({ pageId }) {
  const [addOpen, setAddOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [interactions] = useState(DEMO_INTERACTIONS);
  const [form, setForm] = useState({ type: 'direct', result: 'success', responsible: '', note: '' });

  const recent = interactions.slice(0, 3);
  const archived = interactions.slice(3);

  return (
    <ChartCard
      title="دفترچه تعاملات"
      icon="solar:notebook-bold-duotone"
      info="سوابق تماس‌های مستقیم — حافظه تیم"
      action={
        <Stack direction="row" spacing={0.5}>
          {archived.length > 0 && (
            <Button size="small" variant="outlined" onClick={() => setArchiveOpen(true)} sx={{ fontSize: 10 }}
              startIcon={<Iconify icon="solar:archive-bold" width={14} />}
            >
              آرشیو ({archived.length})
            </Button>
          )}
          <Button size="small" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setAddOpen(true)} sx={{ fontSize: 10 }}>
            ثبت
          </Button>
        </Stack>
      }
      sx={{ height: '100%' }}
    >
      <Stack spacing={1} sx={{ maxHeight: 240, overflow: 'auto' }}>
        {recent.map((item) => <InteractionRow key={item.id} item={item} />)}
        {recent.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>تعاملی ثبت نشده</Typography>}
      </Stack>

      {/* Archive Dialog */}
      <Dialog open={archiveOpen} onClose={() => setArchiveOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>آرشیو تعاملات</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {archived.map((item) => <InteractionRow key={item.id} item={item} />)}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setArchiveOpen(false)}>بستن</Button></DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>ثبت تعامل جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth size="small" label="نوع تماس" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(CONTACT_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="نتیجه" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}>
              <MenuItem value="success">موفق</MenuItem><MenuItem value="failed">ناموفق</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="مسئول" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            <TextField fullWidth size="small" label="یادداشت" multiline rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>ثبت</Button>
        </DialogActions>
      </Dialog>
    </ChartCard>
  );
}
