'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useDefinitions,
  useCreateDefinition,
  useDeleteDefinition,
  useUpdateDefinition,
} from 'src/api/definitions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const PRIVILEGED = ['super_admin', 'admin', 'operations_manager'];

const EMPTY_FORM = { name: '', key: '', description: '' };

export function PlatformsView() {
  const { user } = useAuthContext();
  const isAllowed = !user?.role || PRIVILEGED.includes(user.role);

  const { data, isLoading } = useDefinitions('platform');
  const create = useCreateDefinition();
  const update = useUpdateDefinition();
  const remove = useDeleteDefinition();

  const [dialog, setDialog] = useState({ open: false, item: null });
  const [form, setForm] = useState(EMPTY_FORM);

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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDialog({ open: true, item: null });
  };

  const openEdit = (item) => {
    setForm({ name: item.title ?? '', key: item.key ?? '', description: item.description ?? '' });
    setDialog({ open: true, item });
  };

  const close = () => setDialog({ open: false, item: null });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('عنوان را وارد کنید');
      return;
    }
    try {
      if (dialog.item) {
        await update.mutateAsync({
          id: dialog.item.id,
          data: { title: form.name, key: form.key.trim() || null, description: form.description },
        });
        toast.success('به‌روزرسانی شد');
      } else {
        await create.mutateAsync({
          type: 'platform',
          title: form.name,
          key: form.key.trim() || null,
          description: form.description,
        });
        toast.success('افزوده شد');
      }
      close();
    } catch (err) {
      toast.error(err?.message || 'عملیات با خطا مواجه شد');
    }
  };

  const handleRemove = async (item) => {
    try {
      await remove.mutateAsync({ id: item.id });
      toast.success('حذف شد');
    } catch (err) {
      toast.error(err?.message || 'حذف با خطا مواجه شد');
    }
  };

  const rows = data ?? [];
  const pending = create.isPending || update.isPending || remove.isPending;

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">سکوها (پلتفرم‌ها)</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          افزودن
        </Button>
      </Stack>

      <PageInfoBox
        title="سکوها (پلتفرم‌ها)"
        icon="solar:smartphone-bold-duotone"
        color="success"
        shortDescription="فهرست سکوهای انتشار محتوا (اینستاگرام، تلگرام، توئیتر، بله، ایتا، روبیکا، روبینو و ...). هر میکرورسانه یک یا چند سکو دارد."
        tips={[
          'هر میکرورسانه می‌تواند یک یا چند سکو داشته باشد.',
          'کلید (key) پلتفرم باید با مقدار ستون platform در جدول پیج‌ها تطابق داشته باشد (مثلاً: instagram، telegram، bale).',
          'سکوها در طول زمان قابل افزودن/ویرایش/حذف‌اند.',
        ]}
      />

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>موردی ثبت نشده است</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }}>#</TableCell>
                  <TableCell>عنوان</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      کلید (key)
                      <Tooltip title="مقدار ستون platform در جدول پیج‌ها — برای تطبیق با تحلیل‌ها استفاده می‌شود">
                        <Iconify icon="solar:info-circle-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>توضیحات</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item.title}</Typography>
                    </TableCell>
                    <TableCell>
                      {item.key ? (
                        <Chip
                          size="small"
                          label={item.key}
                          color="success"
                          variant="soft"
                          icon={<Iconify icon="solar:tag-bold-duotone" width={14} />}
                          sx={{ fontFamily: 'monospace', direction: 'ltr' }}
                        />
                      ) : (
                        <Tooltip title="کلید تنظیم نشده — برای فیلترهای تحلیل لازم است">
                          <Chip
                            size="small"
                            label="بدون کلید"
                            color="warning"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="ویرایش">
                        <IconButton onClick={() => openEdit(item)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton color="error" onClick={() => handleRemove(item)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.item ? 'ویرایش سکو' : 'افزودن سکو'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="عنوان *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              placeholder="مثلاً: اینستاگرام"
            />
            <TextField
              label="کلید (key)"
              value={form.key}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  key: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, ''),
                }))
              }
              fullWidth
              placeholder="مثلاً: instagram"
              helperText="فقط حروف انگلیسی کوچک، عدد، خط تیره و زیرخط — باید با مقدار ستون platform در پیج‌ها تطابق داشته باشد"
              inputProps={{ dir: 'ltr', style: { fontFamily: 'monospace' } }}
            />
            <TextField
              label="توضیحات"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={close}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={pending}>
            {dialog.item ? 'ذخیره' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
