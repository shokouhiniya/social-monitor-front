'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTelegramChannels, useSyncTelegramChannel } from 'src/api/telegram';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CATEGORY_LABELS = {
  official: 'رسمی',
  news_agency: 'خبرگزاری',
  fan_pages: 'هواداری',
  news_pages: 'خبری',
  local_sources: 'محلی',
  opposition_sources: 'ضدنظام',
  foreign_sources: 'خارجی',
};

export function TelegramChannelsView() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', pageCategory: 'official', clientKeywords: '', messageLimit: 50 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { data, isLoading } = useTelegramChannels({ page: 1, limit: 100 });
  const syncMutation = useSyncTelegramChannel();

  const channels = data?.data || [];

  const handleSync = () => {
    setError(null);
    setSuccess(null);
    const keywords = form.clientKeywords ? form.clientKeywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined;
    syncMutation.mutate(
      { username: form.username.replace('@', ''), messageLimit: form.messageLimit, pageCategory: form.pageCategory, clientKeywords: keywords },
      {
        onSuccess: (result) => {
          setSuccess(result?.message || 'کانال با موفقیت همگام‌سازی شد');
          setTimeout(() => { setOpen(false); setForm({ username: '', pageCategory: 'official', clientKeywords: '', messageLimit: 50 }); setSuccess(null); }, 2000);
        },
        onError: (err) => setError(err.message || 'خطا در همگام‌سازی'),
      }
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>کانال‌های تلگرام</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت و رصد {channels.length} کانال</Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          افزودن کانال
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : channels.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon="mdi:telegram" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">هنوز کانالی اضافه نشده</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>اولین کانال تلگرام خود را اضافه کنید</Typography>
          <Button variant="contained" onClick={() => setOpen(true)} startIcon={<Iconify icon="solar:add-circle-bold" />}>
            افزودن کانال
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {channels.map((ch) => (
            <Card
              key={ch.id}
              sx={(theme) => ({ p: 2.5, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: theme.shadows[4], borderColor: alpha(theme.palette.info.main, 0.3) } })}
              onClick={() => router.push(paths.dashboard.telegram.channel(ch.id))}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={ch.profile_image_url} sx={{ width: 48, height: 48, bgcolor: alpha('#0088cc', 0.12) }}>
                  <Iconify icon="mdi:telegram" width={24} sx={{ color: '#0088cc' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{ch.name}</Typography>
                  <Typography variant="caption" color="text.secondary">@{ch.username}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {ch.page_category && <Chip label={CATEGORY_LABELS[ch.page_category] || ch.page_category} size="small" variant="outlined" />}
                  <Chip label={`${ch.followers_count?.toLocaleString() || 0} عضو`} size="small" color="info" variant="outlined" />
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add Channel Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:telegram" width={24} sx={{ color: '#0088cc' }} />
            <span>افزودن کانال تلگرام</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth size="small" label="یوزرنیم کانال" placeholder="channel_username"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>@</Typography> }}
            />
            <TextField select fullWidth size="small" label="نوع منبع" value={form.pageCategory} onChange={(e) => setForm({ ...form, pageCategory: e.target.value })}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </TextField>
            {form.pageCategory !== 'official' && (
              <TextField fullWidth size="small" label="کلمات کلیدی (با کاما جدا کنید)" placeholder="مثال: قالیباف, شهردار"
                value={form.clientKeywords} onChange={(e) => setForm({ ...form, clientKeywords: e.target.value })}
                helperText="فقط پست‌هایی که حاوی این کلمات هستند ذخیره می‌شوند"
              />
            )}
            <TextField fullWidth size="small" label="تعداد پیام اولیه" type="number" value={form.messageLimit} onChange={(e) => setForm({ ...form, messageLimit: Number(e.target.value) })} />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSync} disabled={!form.username || syncMutation.isPending}
            startIcon={syncMutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="mdi:sync" />}
          >
            {syncMutation.isPending ? 'در حال همگام‌سازی...' : 'همگام‌سازی'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
