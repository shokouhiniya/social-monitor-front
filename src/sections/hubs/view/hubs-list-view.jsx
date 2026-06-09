'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
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
import { useHubsStats, useCreateHub, useAssignableUsers } from 'src/api/hubs';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

export function HubsListView() {
  const router = useRouter();
  const { data: hubs, isLoading } = useHubsStats();
  const { data: users } = useAssignableUsers();
  const createHub = useCreateHub();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const handleCreate = async () => {
    await createHub.mutateAsync({
      name,
      description: description || undefined,
      manager_user_id: managerId || undefined,
    });
    setOpen(false);
    setName('');
    setDescription('');
    setManagerId('');
  };

  const list = hubs ?? [];

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">هاب‌ها</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpen(true)}>
          هاب جدید
        </Button>
      </Stack>

      <PageInfoBox
        title="هاب‌ها"
        icon="solar:folder-bold-duotone"
        color="primary"
        shortDescription="هاب، واحد سازمانی مدیریت میکرورسانه‌هاست. هر میکرورسانه به یک هاب تعلق دارد و نقش‌ها/دسترسی‌ها حول هاب تعریف می‌شوند."
        tips={[
          'برای هر تیم یا حوزهٔ مدیریتی یک هاب بسازید و یک مدیر برایش تعیین کنید.',
          'مدیر و کارشناسان هاب فقط به داده‌های هاب خودشان دسترسی خواهند داشت (هنگام فعال‌سازی کنترل دسترسی).',
          'روی هر کارت کلیک کنید تا وضعیت کامل هاب را ببینید.',
        ]}
      />

      {isLoading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : list.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:folder-bold-duotone" width={56} sx={{ color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>هنوز هابی ساخته نشده</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            برای سازمان‌دهی میکرورسانه‌ها، اولین هاب را بسازید.
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpen(true)}>
            ساخت اولین هاب
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {list.map((h) => (
            <Grid key={h.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <HubCard hub={h} onClick={() => router.push(paths.dashboard.hubs.detail(h.id))} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateHubDialog
        open={open}
        onClose={() => setOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        managerId={managerId}
        setManagerId={setManagerId}
        users={users ?? []}
        onCreate={handleCreate}
        busy={createHub.isPending}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function HubCard({ hub, onClick }) {
  const stats = [
    { label: 'میکرورسانه', value: hub.total_media, icon: 'solar:users-group-rounded-bold-duotone', color: 'primary' },
    { label: 'فعال', value: hub.active_media, icon: 'solar:chat-round-dots-bold-duotone', color: 'success' },
    { label: 'تسک باز', value: hub.open_tasks, icon: 'solar:checklist-minimalistic-bold-duotone', color: 'warning' },
    { label: 'اعضا', value: hub.member_count, icon: 'solar:users-group-two-rounded-bold-duotone', color: 'info' },
  ];

  return (
    <Card
      onClick={onClick}
      sx={{ p: 0, cursor: 'pointer', height: '100%', transition: 'box-shadow .2s', '&:hover': { boxShadow: 8 } }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            })}
          >
            <Iconify icon="solar:folder-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{hub.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {hub.manager_name ? `مدیر: ${hub.manager_name}` : 'بدون مدیر'}
            </Typography>
          </Box>
          {!hub.is_active && <Chip size="small" label="غیرفعال" color="default" />}
        </Stack>
        {hub.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }} noWrap>
            {hub.description}
          </Typography>
        ) : null}
      </Box>

      <Divider />

      <Grid container>
        {stats.map((s, i) => (
          <Grid
            key={s.label}
            size={{ xs: 3 }}
            sx={{ p: 1.5, textAlign: 'center', borderLeft: i < 3 ? '1px solid' : 'none', borderColor: 'divider' }}
          >
            <Iconify icon={s.icon} width={18} sx={{ color: `${s.color}.main`, mb: 0.5 }} />
            <Typography variant="h6" sx={{ lineHeight: 1 }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{s.label}</Typography>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

// ----------------------------------------------------------------------

function CreateHubDialog({
  open, onClose, name, setName, description, setDescription,
  managerId, setManagerId, users, onCreate, busy,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>هاب جدید</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="نام هاب" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="توضیح" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} />
          <TextField select label="مدیر هاب (اختیاری)" value={managerId} onChange={(e) => setManagerId(e.target.value)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.name} {u.username ? `(${u.username})` : ''}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={onCreate} disabled={!name || busy}>ایجاد</Button>
      </DialogActions>
    </Dialog>
  );
}
