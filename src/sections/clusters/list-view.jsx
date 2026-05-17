'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useClusters,
  useCreateCluster,
  useUpdateCluster,
  useDeleteCluster,
} from 'src/api/clusters';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from '../dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const PAGE_INFO = {
  title: 'مدیریت خوشه‌ها',
  icon: 'solar:atom-bold-duotone',
  color: 'secondary',
  shortDescription: 'گروه‌بندی منطقی پیج‌ها به خوشه‌ها — برای تحلیل سگمنتی شبکه، تخصیص نمایندگان و فیلتر کل سامانه',
  modules: [
    { name: 'ساخت خوشه', icon: 'solar:add-circle-bold-duotone', color: 'primary', description: 'هر خوشه شامل: نام، رنگ، آیکون، توضیحات. مثال: «رسانه مقاومت»، «بلاگرهای ایرانی»، «کانال‌های خبری بین‌المللی».' },
    { name: 'تخصیص پیج', icon: 'solar:link-bold-duotone', color: 'success', description: 'پیج‌ها را به خوشه اضافه کنید. هر پیج می‌تواند فقط در یک خوشه باشد. در صفحه detail خوشه می‌توانید چندتایی اضافه/حذف کنید.' },
    { name: 'تعیین نمایندگان', icon: 'solar:star-bold-duotone', color: 'warning', description: 'برخی پیج‌های مهم خوشه را به‌عنوان «نماینده» علامت بزنید. در داشبورد می‌توانید فقط نمایندگان را تحلیل کنید (سبک‌تر و دقیق‌تر).' },
    { name: 'فیلتر سامانه', icon: 'solar:filter-bold-duotone', color: 'info', description: 'با ScopeSelector در داشبورد، می‌توانید فقط داده‌های یک خوشه خاص را تحلیل کنید — بدون نیاز به ساخت داشبورد جدید.' },
  ],
  tips: [
    'برای حذف خوشه ابتدا باید پیج‌های آن را خالی کنید',
    'نمایندگان معمولاً ۱۰-۲۰٪ پیج‌های خوشه هستند (پرنفوذترین‌ها)',
    'رنگ خوشه در نمودارها و چارت‌های شبکه استفاده می‌شود',
  ],
};

const COLOR_PRESETS = [
  '#1976d2',
  '#0288d1',
  '#2e7d32',
  '#ed6c02',
  '#d32f2f',
  '#7b1fa2',
  '#5d4037',
  '#455a64',
  '#c2185b',
  '#00897b',
];

const ICON_PRESETS = [
  'solar:layers-bold-duotone',
  'solar:globe-bold-duotone',
  'solar:flag-bold-duotone',
  'solar:users-group-rounded-bold-duotone',
  'solar:star-bold-duotone',
  'solar:shield-keyhole-bold-duotone',
  'solar:hashtag-bold-duotone',
  'solar:fire-bold-duotone',
];

const EMPTY_FORM = { name: '', description: '', color: COLOR_PRESETS[0], icon: ICON_PRESETS[0] };

export function ClustersListView() {
  const router = useRouter();
  const { data: clusters, isLoading } = useClusters();
  const createMutation = useCreateCluster();
  const updateMutation = useUpdateCluster();
  const deleteMutation = useDeleteCluster();

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setOpenDialog(true);
  };

  const openEdit = (cluster, e) => {
    e?.stopPropagation();
    setEditing(cluster);
    setForm({
      name: cluster.name || '',
      description: cluster.description || '',
      color: cluster.color || COLOR_PRESETS[0],
      icon: cluster.icon || ICON_PRESETS[0],
    });
    setError('');
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name?.trim()) {
      setError('نام خوشه اجباری است');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setOpenDialog(false);
    } catch (err) {
      setError(err.message || 'خطا در ذخیره خوشه');
    }
  };

  const handleDelete = async (cluster, e) => {
    e?.stopPropagation();
    if (!window.confirm(`آیا از حذف خوشه «${cluster.name}» مطمئن هستید؟ پیج‌ها از خوشه جدا می‌شوند ولی حذف نمی‌گردند.`)) return;
    try {
      await deleteMutation.mutateAsync(cluster.id);
    } catch (err) {
      alert(err.message || 'خطا در حذف');
    }
  };

  const totalPages = (clusters || []).reduce((s, c) => s + (c.pages_count || 0), 0);
  const totalReps = (clusters || []).reduce((s, c) => s + (c.representatives_count || 0), 0);

  return (
    <DashboardContent maxWidth="xl">
      <PageInfoBox {...PAGE_INFO} />

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>خوشه‌ها</Typography>
          <Typography variant="body2" color="text.secondary">
            دسته‌بندی پیج‌ها به خوشه‌های منطقی برای تحلیل قسمتی از شبکه و انتخاب نمایندگان
          </Typography>
        </Box>
        <Button
          size="large"
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          onClick={openCreate}
        >
          خوشه جدید
        </Button>
      </Stack>

      {/* Summary chips */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Chip icon={<Iconify icon="solar:layers-bold-duotone" />} label={`${clusters?.length || 0} خوشه`} color="primary" variant="outlined" />
        <Chip icon={<Iconify icon="solar:users-group-rounded-bold-duotone" />} label={`${totalPages} پیج خوشه‌بندی‌شده`} color="info" variant="outlined" />
        <Chip icon={<Iconify icon="solar:star-bold-duotone" />} label={`${totalReps} نماینده`} color="warning" variant="outlined" />
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (clusters?.length || 0) === 0 && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:layers-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">هنوز خوشه‌ای ثبت نشده</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            برای شروع، چند خوشه (مثل: رسانه‌های مقاومت، فعالان فلسطین، رسانه‌های اقتصادی) بسازید
            و پیج‌های پایش‌شده را به آن‌ها نسبت بدهید.
          </Typography>
          <Button variant="contained" onClick={openCreate} startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}>
            ساخت اولین خوشه
          </Button>
        </Card>
      )}

      {/* Cluster cards grid */}
      <Grid container spacing={2.5}>
        {(clusters || []).map((cluster) => (
          <Grid key={cluster.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 8, borderColor: cluster.color || 'primary.main' },
              }}
            >
              <CardActionArea
                onClick={() => router.push(paths.dashboard.mynetwork.clusters.detail(cluster.id))}
                sx={{ p: 2.5 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    insetInlineStart: 0,
                    width: 6,
                    height: '100%',
                    bgcolor: cluster.color || 'primary.main',
                  }}
                />
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: alpha(cluster.color || '#1976d2', 0.12),
                      color: cluster.color || 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={cluster.icon || 'solar:layers-bold-duotone'} width={28} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                      {cluster.name}
                    </Typography>
                    {cluster.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 32,
                        }}
                      >
                        {cluster.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    icon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={14} />}
                    label={`${cluster.pages_count || 0} پیج`}
                    color="info"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<Iconify icon="solar:star-bold-duotone" width={14} />}
                    label={`${cluster.representatives_count || 0} نماینده`}
                    color="warning"
                    variant={(cluster.representatives_count || 0) > 0 ? 'filled' : 'outlined'}
                  />
                </Stack>
              </CardActionArea>

              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}>
                <IconButton size="small" onClick={(e) => openEdit(cluster, e)} aria-label="ویرایش">
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
                <IconButton size="small" color="error" onClick={(e) => handleDelete(cluster, e)} aria-label="حذف">
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create / Edit dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'ویرایش خوشه' : 'ساخت خوشه جدید'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="نام خوشه"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثلاً: رسانه‌های مقاومت"
            />
            <TextField
              label="توضیحات"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="معرفی کوتاه از این خوشه و معیار عضویت در آن"
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>رنگ خوشه</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {COLOR_PRESETS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: '3px solid',
                      borderColor: form.color === c ? 'common.white' : 'transparent',
                      outline: form.color === c ? `2px solid ${c}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              label="آیکون"
              select
              fullWidth
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            >
              {ICON_PRESETS.map((ic) => (
                <MenuItem key={ic} value={ic}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={ic} width={20} />
                    <Typography variant="body2">{ic}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) ? '...' : (editing ? 'ذخیره تغییرات' : 'ساخت خوشه')}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
