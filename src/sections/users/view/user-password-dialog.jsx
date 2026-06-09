'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useSetUserPassword } from 'src/api/users';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function UserPasswordDialog({ open, user, onClose }) {
  const setPassword = useSetUserPassword();
  const [password, setPwd] = useState('');

  useEffect(() => {
    if (open) setPwd('');
  }, [open]);

  const handleSubmit = async () => {
    if (password.length < 6) return;
    try {
      await setPassword.mutateAsync({ id: user.id, password });
      toast.success('رمز عبور بازنشانی شد');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'بازنشانی رمز با خطا مواجه شد');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>بازنشانی رمز عبور</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            رمز عبور جدید برای کاربر «{user?.name}»
          </Typography>
          <TextField
            label="رمز عبور جدید"
            type="password"
            value={password}
            onChange={(e) => setPwd(e.target.value)}
            fullWidth
            helperText="حداقل ۶ کاراکتر"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={password.length < 6 || setPassword.isPending}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
