'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useHubs, useAssignHubUser } from 'src/api/hubs';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const HUB_ROLES = [
  { value: 'manager', label: 'مدیر هاب' },
  { value: 'expert', label: 'کارشناس' },
  { value: 'viewer', label: 'بیننده' },
];

export function UserHubAccessDialog({ open, user, onClose }) {
  const { data: hubs } = useHubs();
  const assign = useAssignHubUser();
  const [hubId, setHubId] = useState('');
  const [roleInHub, setRoleInHub] = useState('expert');

  useEffect(() => {
    if (open) {
      setHubId('');
      setRoleInHub('expert');
    }
  }, [open]);

  const handleAssign = async () => {
    if (!hubId) return;
    try {
      await assign.mutateAsync({
        id: Number(hubId),
        data: { user_id: user.id, role_in_hub: roleInHub },
      });
      toast.success('دسترسی هاب اعطا شد');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'اعطای دسترسی با خطا مواجه شد');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>دسترسی هاب</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            اعطای دسترسی هاب به کاربر «{user?.name}»
          </Typography>
          <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
            نقش «مدیر هاب» و «کارشناس» فقط هاب‌هایی را می‌بینند که در آن‌ها عضو باشند.
          </Alert>
          <TextField select label="هاب" value={hubId} onChange={(e) => setHubId(e.target.value)} fullWidth>
            <MenuItem value="">— انتخاب هاب —</MenuItem>
            {(hubs ?? []).map((h) => (
              <MenuItem key={h.id} value={String(h.id)}>{h.name}</MenuItem>
            ))}
          </TextField>
          <TextField select label="نقش در هاب" value={roleInHub} onChange={(e) => setRoleInHub(e.target.value)} fullWidth>
            {HUB_ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleAssign} disabled={!hubId || assign.isPending}>
          اعطای دسترسی
        </Button>
      </DialogActions>
    </Dialog>
  );
}
