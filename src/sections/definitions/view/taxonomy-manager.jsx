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

import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

import { useAuthContext } from 'src/auth/hooks';

import { RepresentativeDialog } from './representative-dialog';

// ----------------------------------------------------------------------

const PRIVILEGED = ['super_admin', 'admin', 'operations_manager'];

/**
 * مدیریت عمومی یک «تعریف» (خوشه/هویت/سکو): جدول + افزودن/ویرایش/حذف.
 *
 * props:
 *  - title, description, icon, color, infoTips
 *  - nameField: 'title' | 'name' (کلید عنوان در آیتم‌ها)
 *  - items, isLoading
 *  - onCreate(payload), onUpdate(id, payload), onRemove(id)  → باید Promise برگردانند
 *  - pending: boolean
 *  - buildPayload(form) → بدنهٔ ارسالی به API (برای تفاوت title/name)
 */
export function TaxonomyManager({
  title,
  description,
  icon,
  color = 'primary',
  infoTips = [],
  nameField,
  items,
  isLoading,
  onCreate,
  onUpdate,
  onRemove,
  pending,
  representativeScope,
}) {
  const { user } = useAuthContext();
  const isAllowed = !user?.role || PRIVILEGED.includes(user.role);

  const [dialog, setDialog] = useState({ open: false, item: null });
  const [form, setForm] = useState({ name: '', description: '' });
  const [repDialog, setRepDialog] = useState({ open: false, item: null });

  // نمایندگان (تنها وقتی این قابلیت فعال است) — از لیست کامل میکرورسانه‌ها فیلتر می‌شود
  const hasReps = !!representativeScope;
  const { data: mmData } = useMicroMediaList(hasReps ? { limit: 500 } : null);
  const allMicroMedia = mmData?.items ?? [];

  const repsFor = (item) => {
    if (!hasReps) return [];
    if (representativeScope === 'cluster') {
      return allMicroMedia.filter(
        (m) => m.is_cluster_representative && m.topic_cluster_id === item.id,
      );
    }
    // هویت: بر اساس identity_title
    return allMicroMedia.filter(
      (m) => m.is_identity_representative && m.identity_title === item[nameField],
    );
  };

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
    setForm({ name: '', description: '' });
    setDialog({ open: true, item: null });
  };

  const openEdit = (item) => {
    setForm({ name: item[nameField] ?? '', description: item.description ?? '' });
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
        await onUpdate(dialog.item.id, { name: form.name, description: form.description });
        toast.success('به‌روزرسانی شد');
      } else {
        await onCreate({ name: form.name, description: form.description });
        toast.success('افزوده شد');
      }
      close();
    } catch (err) {
      toast.error(err?.message || 'عملیات با خطا مواجه شد');
    }
  };

  const handleRemove = async (item) => {
    try {
      await onRemove(item.id);
      toast.success('حذف شد');
    } catch (err) {
      toast.error(err?.message || 'حذف با خطا مواجه شد (ممکن است در حال استفاده باشد)');
    }
  };

  const rows = items ?? [];

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          افزودن
        </Button>
      </Stack>

      <PageInfoBox title={title} icon={icon} color={color} shortDescription={description} tips={infoTips} />

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>موردی ثبت نشده است</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64 }}>#</TableCell>
                  <TableCell>عنوان</TableCell>
                  <TableCell>توضیحات</TableCell>
                  {hasReps && <TableCell>نمایندگان</TableCell>}
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item, idx) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item[nameField]}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description || '—'}
                      </Typography>
                    </TableCell>
                    {hasReps && (
                      <TableCell>
                        {repsFor(item).length === 0 ? (
                          <Typography variant="caption" color="text.disabled">
                            بدون نماینده
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {repsFor(item).map((m) => (
                              <Chip
                                key={m.id}
                                size="small"
                                color="warning"
                                variant="soft"
                                icon={<Iconify icon="solar:star-bold" width={14} />}
                                label={m.name}
                              />
                            ))}
                          </Stack>
                        )}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      {hasReps && (
                        <Tooltip title="مدیریت نمایندگان">
                          <IconButton color="warning" onClick={() => setRepDialog({ open: true, item })}>
                            <Iconify icon="solar:star-bold-duotone" />
                          </IconButton>
                        </Tooltip>
                      )}
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

      <Dialog open={dialog.open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.item ? 'ویرایش' : 'افزودن'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="عنوان *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
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

      {hasReps && repDialog.item && (
        <RepresentativeDialog
          open={repDialog.open}
          onClose={() => setRepDialog({ open: false, item: null })}
          scope={representativeScope}
          entity={repDialog.item}
          label={repDialog.item[nameField]}
        />
      )}
    </DashboardContent>
  );
}
