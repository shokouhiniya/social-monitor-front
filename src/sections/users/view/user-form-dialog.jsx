'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { useCreateUser, useUpdateUser } from 'src/api/users';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'مدیر کل', color: 'error' },
  { value: 'operations_manager', label: 'مدیر عملیات', color: 'warning' },
  { value: 'hub_manager', label: 'مدیر هاب', color: 'info' },
  { value: 'hub_expert', label: 'کارشناس هاب', color: 'success' },
  { value: 'viewer', label: 'بیننده', color: 'default' },
  { value: 'admin', label: 'ادمین (قدیمی)', color: 'error' },
  { value: 'operator', label: 'اپراتور (قدیمی)', color: 'secondary' },
];

export const ROLE_MAP = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r]));

export function UserFormDialog({ open, user, onClose }) {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: user?.name ?? '',
      username: user?.username ?? '',
      password: '',
      role: user?.role ?? 'viewer',
      phone: '',
    });
    setShowPwd(false);
  }, [open, user]);

  if (!form) return null;

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const pending = createUser.isPending || updateUser.isPending;

  const canSubmit = isEdit
    ? !!form.name
    : !!form.name && form.username.length >= 3 && form.password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (isEdit) {
        await updateUser.mutateAsync({ id: user.id, data: { name: form.name, role: form.role } });
        toast.success('کاربر به‌روزرسانی شد');
      } else {
        await createUser.mutateAsync({
          name: form.name,
          username: form.username,
          password: form.password,
          role: form.role,
          phone: form.phone || undefined,
        });
        toast.success('کاربر ایجاد شد');
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || 'عملیات با خطا مواجه شد');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'ویرایش کاربر' : 'کاربر جدید'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="نام کامل *" value={form.name} onChange={setField('name')} fullWidth />
          {!isEdit && (
            <>
              <TextField label="نام کاربری *" value={form.username} onChange={setField('username')} fullWidth helperText="حداقل ۳ کاراکتر؛ برای ورود استفاده می‌شود" />
              <TextField
                label="رمز عبور *"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={setField('password')}
                fullWidth
                helperText="حداقل ۶ کاراکتر"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Iconify
                          icon={showPwd ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setShowPwd((s) => !s)}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField label="شماره تماس" value={form.phone} onChange={setField('phone')} fullWidth helperText="اختیاری" />
            </>
          )}
          <TextField select label="نقش" value={form.role} onChange={setField('role')} fullWidth>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || pending}>
          {isEdit ? 'ذخیره' : 'ایجاد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
