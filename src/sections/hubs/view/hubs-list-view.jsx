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
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useHubsStats, useCreateHub, useUpdateHub, useAssignableUsers } from 'src/api/hubs';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

export function HubsListView() {
  const router = useRouter();
  const { data: hubs, isLoading } = useHubsStats();
  const { data: users } = useAssignableUsers();
  const createHub = useCreateHub();
  const updateHub = useUpdateHub();

  const [open, setOpen] = useState(false);
  const [editHub, setEditHub] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const openCreate = () => {
    setEditHub(null);
    setName('');
    setDescription('');
    setManagerId('');
    setOpen(true);
  };

  const openEdit = (hub, e) => {
    e?.stopPropagation();
    setEditHub(hub);
    setName(hub.name || '');
    setDescription(hub.description || '');
    setManagerId(hub.manager_user_id ? String(hub.manager_user_id) : '');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name,
      description: description || undefined,
      manager_user_id: managerId ? Number(managerId) : undefined,
    };
    if (editHub) {
      await updateHub.mutateAsync({ id: editHub.id, data: payload });
    } else {
      await createHub.mutateAsync(payload);
    }
    setOpen(false);
    setEditHub(null);
    setName('');
    setDescription('');
    setManagerId('');
  };

  const handleDeactivate = async (hub, e) => {
    e?.stopPropagation();
    if (!window.confirm(`هاب «${hub.name}» غیرفعال شود؟`)) return;
    await updateHub.mutateAsync({ id: hub.id, data: { is_active: false } });
  };

  const list = hubs ?? [];

  // فیلترهای client-side
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredList = list.filter((h) => {
    // پیش‌فرض فقط فعال‌ها
    if (!showInactive && h.is_active === false) return false;
    // سرچ
    if (search) {
      const q = search.toLowerCase();
      return (h.name || '').toLowerCase().includes(q) || (h.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">هاب‌ها</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
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

      {/* Search & filter */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            fullWidth
            placeholder="جستجوی نام هاب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
            }}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <Chip
              label="فعال‌ها"
              size="small"
              variant={!showInactive ? 'filled' : 'outlined'}
              color={!showInactive ? 'success' : 'default'}
              onClick={() => setShowInactive(false)}
            />
            <Chip
              label="همه (شامل غیرفعال)"
              size="small"
              variant={showInactive ? 'filled' : 'outlined'}
              color={showInactive ? 'default' : 'default'}
              onClick={() => setShowInactive(true)}
            />
          </Stack>
        </Stack>
      </Card>

      {isLoading ? (
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : filteredList.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:folder-bold-duotone" width={56} sx={{ color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {list.length === 0 ? 'هنوز هابی ساخته نشده' : 'هابی مطابق فیلتر یافت نشد'}
          </Typography>
          {list.length === 0 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                برای سازمان‌دهی میکرورسانه‌ها، اولین هاب را بسازید.
              </Typography>
              <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
                ساخت اولین هاب
              </Button>
            </>
          )}
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filteredList.map((h) => (
            <Grid key={h.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <HubCard
                hub={h}
                onClick={() => router.push(paths.dashboard.hubs.detail(h.id))}
                onEdit={(e) => openEdit(h, e)}
                onDeactivate={(e) => handleDeactivate(h, e)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateHubDialog
        open={open}
        onClose={() => { setOpen(false); setEditHub(null); }}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        managerId={managerId}
        setManagerId={setManagerId}
        users={users ?? []}
        onCreate={handleSubmit}
        busy={createHub.isPending || updateHub.isPending}
        isEdit={!!editHub}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function HubCard({ hub, onClick, onEdit, onDeactivate }) {
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
          <Stack direction="row" spacing={0.5} alignItems="center">
            {!hub.is_active && <Chip size="small" label="غیرفعال" color="default" />}
            <Tooltip title="ویرایش">
              <IconButton size="small" onClick={onEdit}>
                <Iconify icon="solar:pen-bold" width={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="غیرفعال‌سازی">
              <IconButton size="small" color="error" onClick={onDeactivate}>
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>
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
  managerId, setManagerId, users, onCreate, busy, isEdit,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'ویرایش هاب' : 'هاب جدید'}</DialogTitle>
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
        <Button variant="contained" onClick={onCreate} disabled={!name || busy}>{isEdit ? 'ذخیره' : 'ایجاد'}</Button>
      </DialogActions>
    </Dialog>
  );
}
