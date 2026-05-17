'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TelegramSettingsView() {
  const queryClient = useQueryClient();
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [session, setSession] = useState('');

  // Load existing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'telegram'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.settings.byCategory('tokens'));
      return res.data?.data;
    },
  });

  // Populate form from loaded settings
  useEffect(() => {
    if (settings) {
      const findVal = (key) => settings.find((s) => s.key === key)?.value || '';
      setApiId(findVal('telegram_api_id'));
      setApiHash(findVal('telegram_api_hash'));
      setSession(findVal('telegram_session'));
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { key: 'telegram_api_id', value: apiId, category: 'tokens', label: 'Telegram API ID' },
        { key: 'telegram_api_hash', value: apiHash, category: 'tokens', label: 'Telegram API Hash' },
        { key: 'telegram_session', value: session, category: 'tokens', label: 'Telegram Session String' },
      ];
      const res = await axiosInstance.post(endpoints.settings.update, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardContent maxWidth="lg">
        <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            <Iconify icon="mdi:telegram" width={28} sx={{ mr: 1, verticalAlign: 'middle', color: '#0088cc' }} />
            تنظیمات تلگرام
          </Typography>
          <Typography variant="body2" color="text.secondary">
            پیکربندی اتصال به API تلگرام
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Connection Settings */}
        <Card sx={(theme) => ({ p: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`, borderRadius: 2 })}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.12) })}>
              <Iconify icon="solar:key-bold-duotone" width={22} sx={{ color: 'info.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>اطلاعات اتصال</Typography>
              <Typography variant="caption" color="text.secondary">API ID و Hash از my.telegram.org دریافت می‌شود</Typography>
            </Box>
          </Stack>

          <Stack spacing={2.5}>
            <TextField fullWidth size="small" label="Telegram API ID" value={apiId} onChange={(e) => setApiId(e.target.value)} placeholder="12345678" helperText="از my.telegram.org → API Development Tools" />
            <TextField fullWidth size="small" label="Telegram API Hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} placeholder="abcdef1234567890" type="password" />
            <TextField fullWidth size="small" label="Session String" value={session} onChange={(e) => setSession(e.target.value)} placeholder="Session string از telegram-auth.js" multiline rows={3}
              helperText="با اجرای node telegram-auth.js در بک‌اند، session string دریافت کنید"
            />
          </Stack>
        </Card>

        {/* Instructions */}
        <Card sx={(theme) => ({ p: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`, borderRadius: 2 })}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.12) })}>
              <Iconify icon="solar:info-circle-bold-duotone" width={22} sx={{ color: 'warning.main' }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>راهنمای اتصال</Typography>
          </Stack>

          <Stack spacing={1.5}>
            {[
              'به my.telegram.org بروید و با شماره تلفن خود وارد شوید',
              'از بخش API Development Tools، API ID و API Hash را دریافت کنید',
              'در سرور بک‌اند، دستور node telegram-auth.js را اجرا کنید',
              'کد تأیید ارسال شده به تلگرام را وارد کنید',
              'Session String تولید شده را در فیلد بالا وارد کنید',
              'مطمئن شوید VPN خاموش است (تلگرام نیاز به اتصال مستقیم دارد)',
            ].map((step, idx) => (
              <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={(theme) => ({ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.12), flexShrink: 0 })}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main' }}>{idx + 1}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{step}</Typography>
              </Stack>
            ))}
          </Stack>
        </Card>

        {saveMutation.isSuccess && <Alert severity="success">تنظیمات با موفقیت ذخیره شد</Alert>}
        {saveMutation.isError && <Alert severity="error">خطا در ذخیره تنظیمات: {saveMutation.error?.message}</Alert>}

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          startIcon={saveMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {saveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </Button>
      </Stack>
    </DashboardContent>
  );
}
