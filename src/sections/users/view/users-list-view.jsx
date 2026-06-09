'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useUsers, useUpdateUser } from 'src/api/users';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { useAuthContext } from 'src/auth/hooks';

import { UserPasswordDialog } from './user-password-dialog';
import { ROLE_MAP, UserFormDialog } from './user-form-dialog';
import { UserHubAccessDialog } from './user-hub-access-dialog';

// ----------------------------------------------------------------------

const PRIVILEGED = ['super_admin', 'admin', 'operations_manager'];

export function UsersListView() {
  const { user: currentUser } = useAuthContext();
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();

  const [formDialog, setFormDialog] = useState({ open: false, user: null });
  const [pwdDialog, setPwdDialog] = useState({ open: false, user: null });
  const [hubDialog, setHubDialog] = useState({ open: false, user: null });

  const items = users ?? [];

  const isAllowed = !currentUser?.role || PRIVILEGED.includes(currentUser.role);

  if (!isAllowed) {
    return (
      <DashboardContent>
        <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
          <Iconify icon="solar:lock-keyhole-bold-duotone" width={48} />
          <Typography sx={{ mt: 1 }}>این بخش تنها برای مدیر کل سامانه در دسترس است.</Typography>
        </Box>
      </DashboardContent>
    );
  }

  const toggleActive = async (u) => {
    try {
      await updateUser.mutateAsync({ id: u.id, data: { is_active: !u.is_active } });
      toast.success(u.is_active ? 'کاربر غیرفعال شد' : 'کاربر فعال شد');
    } catch (err) {
      toast.error(err?.message || 'تغییر وضعیت ناموفق بود');
    }
  };

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">کاربران و دسترسی‌ها</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setFormDialog({ open: true, user: null })}
        >
          کاربر جدید
        </Button>
      </Stack>

      <PageInfoBox
        title="مدیریت کاربران"
        icon="solar:users-group-two-rounded-bold-duotone"
        color="primary"
        shortDescription="ساخت حساب کاربری، تعیین نقش و سطح دسترسی و مدیریت عضویت کاربران در هاب‌ها. این بخش مخصوص مدیر کل (super_admin) است."
        tips={[
          'نقش کاربر سطح دسترسی کلی او را تعیین می‌کند (مدیر کل، مدیر عملیات، مدیر هاب، کارشناس، بیننده).',
          'برای محدود کردن یک «مدیر هاب» یا «کارشناس» به هاب‌های مشخص، از دکمهٔ «دسترسی هاب» استفاده کنید.',
          'با غیرفعال‌کردن کاربر، امکان ورود او بسته می‌شود بدون آنکه داده‌اش حذف شود.',
        ]}
      />

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>کاربری یافت نشد</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>نام کاربری</TableCell>
                  <TableCell>نقش</TableCell>
                  <TableCell align="center">فعال</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((u) => {
                  const role = ROLE_MAP[u.role] ?? { label: u.role, color: 'default' };
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{u.name}</Typography>
                      </TableCell>
                      <TableCell>{u.username || '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="soft" color={role.color} label={role.label} />
                      </TableCell>
                      <TableCell align="center">
                        <Switch checked={!!u.is_active} onChange={() => toggleActive(u)} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="ویرایش">
                            <IconButton onClick={() => setFormDialog({ open: true, user: u })}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="دسترسی هاب">
                            <IconButton onClick={() => setHubDialog({ open: true, user: u })}>
                              <Iconify icon="solar:square-academic-cap-bold-duotone" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="بازنشانی رمز عبور">
                            <IconButton onClick={() => setPwdDialog({ open: true, user: u })}>
                              <Iconify icon="solar:key-bold-duotone" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <UserFormDialog
        open={formDialog.open}
        user={formDialog.user}
        onClose={() => setFormDialog({ open: false, user: null })}
      />
      <UserPasswordDialog
        open={pwdDialog.open}
        user={pwdDialog.user}
        onClose={() => setPwdDialog({ open: false, user: null })}
      />
      <UserHubAccessDialog
        open={hubDialog.open}
        user={hubDialog.user}
        onClose={() => setHubDialog({ open: false, user: null })}
      />
    </DashboardContent>
  );
}
