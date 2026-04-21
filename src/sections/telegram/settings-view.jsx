'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TelegramSettingsView() {
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [session, setSession] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to backend settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

        {saved && <Alert severity="success">تنظیمات ذخیره شد</Alert>}

        <Button variant="contained" onClick={handleSave} startIcon={<Iconify icon="solar:check-circle-bold" />} sx={{ alignSelf: 'flex-start' }}>
          ذخیره تنظیمات
        </Button>
      </Stack>
    </DashboardContent>
  );
}
