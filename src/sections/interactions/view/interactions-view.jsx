'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useAssignableUsers } from 'src/api/hubs';
import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';
import { useInteractions, useCreateInteraction, useInteractionsOverview } from 'src/api/interactions';

import { Iconify } from 'src/components/iconify';
import { ShamsiDatePicker } from 'src/components/shamsi-date-picker';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const TYPES = {
  call: 'تماس',
  meeting: 'جلسه',
  message: 'پیام',
  service: 'خدمت',
  operation: 'عملیات',
  follow_up: 'پیگیری',
  other: 'سایر',
};

const TYPE_COLOR = {
  call: 'info',
  meeting: 'primary',
  message: 'secondary',
  service: 'success',
  operation: 'warning',
  follow_up: 'warning',
  other: 'default',
};

export function InteractionsView() {
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const params = type ? { type } : {};
  const { data, isLoading } = useInteractions(params);
  const { data: overview } = useInteractionsOverview();
  const items = data?.items ?? [];

  const stats = [
    { label: 'کل تعاملات', value: overview?.total ?? 0, icon: 'solar:chat-round-dots-bold-duotone', color: 'primary.main' },
    { label: '۳۰ روز اخیر', value: overview?.last30Days ?? 0, icon: 'solar:calendar-bold-duotone', color: 'success.main' },
    { label: 'رسانه‌های فعال (۶ ماه)', value: overview?.activeMediaLast6Months ?? 0, icon: 'solar:users-group-rounded-bold-duotone', color: 'info.main' },
  ];

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">تعاملات</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpen(true)}>
          ثبت تعامل
        </Button>
      </Stack>

      <PageInfoBox
        title="تعاملات"
        icon="solar:chat-round-dots-bold-duotone"
        color="success"
        shortDescription="ثبت و مرور همهٔ تعاملات انسانی با میکرورسانه‌ها (تماس، جلسه، پیام، خدمت...). معیار «فعال بودن» رسانه از همین تعاملات محاسبه می‌شود."
        tips={[
          'با دکمهٔ «ثبت تعامل» می‌توانید مستقیماً برای هر میکرورسانه تعامل ثبت کنید.',
          'رسانه‌ای که در ۶ ماه اخیر تعامل نداشته، نیازمند پیگیری است.',
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon={s.icon} width={36} sx={{ color: s.color }} />
                <Box>
                  <Typography variant="h4">{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField select label="نوع تعامل" value={type} onChange={(e) => setType(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="">همه</MenuItem>
          {Object.entries(TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
        </TextField>
      </Card>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:chat-round-line-duotone" width={48} />
            <Typography sx={{ mt: 1 }}>تعاملی یافت نشد</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نوع</TableCell>
                  <TableCell>میکرورسانه</TableCell>
                  <TableCell>مسئول</TableCell>
                  <TableCell>خلاصه</TableCell>
                  <TableCell>نتیجه</TableCell>
                  <TableCell>تاریخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(it)}>
                    <TableCell>
                      <Chip size="small" label={TYPES[it.type] ?? it.type} color={TYPE_COLOR[it.type] ?? 'default'} />
                    </TableCell>
                    <TableCell>{it.micro_media_name || (it.micro_media_id ? `#${it.micro_media_id}` : '—')}</TableCell>
                    <TableCell>
                      {it.owner_name ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Iconify icon="solar:user-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">{it.owner_name}</Typography>
                        </Stack>
                      ) : '—'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap>{it.summary || it.note || '—'}</Typography>
                    </TableCell>
                    <TableCell>{resultLabel(it.result)}</TableCell>
                    <TableCell>{it.interaction_date ? new Date(it.interaction_date).toLocaleDateString('fa-IR') : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <RegisterInteractionDialog open={open} onClose={() => setOpen(false)} />
      <InteractionDetailDialog interaction={selected} onClose={() => setSelected(null)} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function resultLabel(result) {
  const map = { success: 'موفق', pending: 'در جریان', failed: 'ناموفق' };
  return map[result] ?? result ?? '—';
}

function InteractionDetailDialog({ interaction, onClose }) {
  const it = interaction;
  const rows = it
    ? [
        ['میکرورسانه', it.micro_media_name || (it.micro_media_id ? `#${it.micro_media_id}` : '—')],
        ['نوع', TYPES[it.type] ?? it.type],
        ['مسئول (ثبت‌کننده)', it.owner_name || '—'],
        ['تاریخ', it.interaction_date ? new Date(it.interaction_date).toLocaleString('fa-IR') : '—'],
        ['نتیجه', resultLabel(it.result)],
        ['خلاصه', it.summary || it.note || '—'],
        ['اقدام بعدی', it.next_action || '—'],
      ]
    : [];

  return (
    <Dialog open={!!it} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>جزئیات تعامل</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {rows.map(([label, val]) => (
            <Stack key={label} direction="row" spacing={2} alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130, flexShrink: 0 }}>{label}</Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>{val}</Typography>
            </Stack>
          ))}
          {it?.tags?.length ? (
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>برچسب‌ها</Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {it.tags.map((t) => <Chip key={t} size="small" label={t} />)}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function RegisterInteractionDialog({ open, onClose }) {
  const { user } = useAuthContext();
  const { data: mediaPage } = useMicroMediaList({ pageSize: 100 });
  const { data: users } = useAssignableUsers();
  const createInteraction = useCreateInteraction();

  const [media, setMedia] = useState(null);
  const [type, setType] = useState('call');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState('');
  const [result, setResult] = useState('success');
  const [nextAction, setNextAction] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const options = mediaPage?.items ?? [];
  const userOptions = users ?? [];
  // پیش‌فرض مسئول = کاربر واردشده
  const effectiveOwner = ownerId || user?.id || '';

  const reset = () => {
    setMedia(null); setType('call'); setSummary(''); setResult('success'); setNextAction(''); setOwnerId('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async () => {
    await createInteraction.mutateAsync({
      micro_media_id: media.id,
      interaction_type: type,
      interaction_date: date ? new Date(date).toISOString() : undefined,
      summary: summary || undefined,
      result: result || undefined,
      next_action: nextAction || undefined,
      owner_user_id: effectiveOwner ? Number(effectiveOwner) : undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>ثبت تعامل</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Autocomplete
            options={options}
            value={media}
            onChange={(_, v) => setMedia(v)}
            getOptionLabel={(o) => o?.name ?? ''}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(p) => <TextField {...p} label="میکرورسانه *" placeholder="جستجو..." />}
          />
          <TextField select label="مسئول (ثبت‌کننده)" value={effectiveOwner} onChange={(e) => setOwnerId(e.target.value)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {userOptions.map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.name} {u.username ? `(${u.username})` : ''}</MenuItem>
            ))}
          </TextField>
          <TextField select label="نوع تعامل" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
            {Object.entries(TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
          <ShamsiDatePicker label="تاریخ" value={date} onChange={(iso) => setDate(iso)} />
          <TextField label="خلاصه" value={summary} onChange={(e) => setSummary(e.target.value)} fullWidth multiline rows={2} />
          <TextField select label="نتیجه" value={result} onChange={(e) => setResult(e.target.value)} fullWidth>
            <MenuItem value="success">موفق</MenuItem>
            <MenuItem value="pending">در جریان</MenuItem>
            <MenuItem value="failed">ناموفق</MenuItem>
          </TextField>
          <TextField label="اقدام بعدی" value={nextAction} onChange={(e) => setNextAction(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!media || createInteraction.isPending}>ثبت</Button>
      </DialogActions>
    </Dialog>
  );
}
