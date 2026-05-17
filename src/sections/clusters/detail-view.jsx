'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { proxyImage } from 'src/utils/proxy-image';

import { usePages } from 'src/api/pages';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useCluster,
  useAssignPagesToCluster,
  useRemovePagesFromCluster,
  useTogglePageRepresentative,
} from 'src/api/clusters';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function PageRow({ page, isRepresentative, onToggleRep, onRemove, busy }) {
  const router = useRouter();
  return (
    <Card
      sx={{
        p: 1.75,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.2s',
        border: '1px solid',
        borderColor: isRepresentative ? 'warning.main' : 'divider',
        bgcolor: (t) => isRepresentative ? alpha(t.palette.warning.main, 0.04) : 'transparent',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <Avatar
        src={proxyImage(page.profile_image_url)}
        alt={page.name}
        sx={{ width: 40, height: 40 }}
      >
        {page.name?.[0]}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => router.push(paths.dashboard.mynetwork.pages.profile(page.id))}>
        <Typography variant="subtitle2" noWrap>{page.name}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
          <Typography variant="caption" color="text.secondary" noWrap>@{page.username}</Typography>
          {page.platform && (
            <Iconify icon={page.platform === 'telegram' ? 'mdi:telegram' : page.platform === 'twitter' ? 'mdi:twitter' : 'mdi:instagram'} width={14} sx={{ color: 'text.disabled' }} />
          )}
          {(page.followers_count || 0) > 0 && (
            <Typography variant="caption" color="text.secondary">· {Number(page.followers_count).toLocaleString()} فالوور</Typography>
          )}
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Tooltip title={isRepresentative ? 'لغو نماینده' : 'انتخاب به‌عنوان نماینده'}>
          <IconButton
            size="small"
            color="warning"
            disabled={busy}
            onClick={() => onToggleRep(page, !isRepresentative)}
          >
            <Iconify icon={isRepresentative ? 'solar:star-bold' : 'solar:star-line-duotone'} width={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="حذف از خوشه">
          <IconButton size="small" color="error" disabled={busy} onClick={() => onRemove(page)}>
            <Iconify icon="solar:close-circle-bold" width={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function ClusterDetailView({ clusterId }) {
  const router = useRouter();
  const { data: cluster, isLoading } = useCluster(clusterId);
  const { data: allPagesResp } = usePages({ page: 1, limit: 500 });

  const assignMutation = useAssignPagesToCluster();
  const removeMutation = useRemovePagesFromCluster();
  const toggleRepMutation = useTogglePageRepresentative();

  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [addSearch, setAddSearch] = useState('');

  const pages = useMemo(() => cluster?.pages || [], [cluster]);
  const representatives = useMemo(() => pages.filter((p) => p.is_representative), [pages]);
  const allPagesList = useMemo(() => allPagesResp?.data || [], [allPagesResp]);

  const filtered = useMemo(() => {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q),
    );
  }, [pages, search]);

  const filteredReps = filtered.filter((p) => p.is_representative);
  const filteredOthers = filtered.filter((p) => !p.is_representative);

  // Pages not yet in this cluster (for add dialog)
  const availableToAdd = useMemo(() => {
    if (!allPagesList?.length) return [];
    const inCluster = new Set(pages.map((p) => p.id));
    let list = allPagesList.filter((p) => !inCluster.has(p.id));
    if (addSearch) {
      const q = addSearch.toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allPagesList, pages, addSearch]);

  const handleAdd = async () => {
    if (!selectedToAdd.length) return;
    try {
      await assignMutation.mutateAsync({ id: clusterId, pageIds: selectedToAdd });
      setOpenAdd(false);
      setSelectedToAdd([]);
      setAddSearch('');
    } catch (err) {
      alert(err.message || 'خطا در اضافه کردن پیج‌ها');
    }
  };

  const handleRemove = async (page) => {
    if (!window.confirm(`پیج «${page.name}» از این خوشه حذف شود؟`)) return;
    try {
      await removeMutation.mutateAsync({ id: clusterId, pageIds: [page.id] });
    } catch (err) {
      alert(err.message || 'خطا در حذف');
    }
  };

  const handleToggleRep = async (page, isRep) => {
    try {
      await toggleRepMutation.mutateAsync({ clusterId, pageId: page.id, isRepresentative: isRep });
    } catch (err) {
      alert(err.message || 'خطا در تغییر وضعیت نماینده');
    }
  };

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!cluster) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error">خوشه یافت نشد.</Alert>
      </DashboardContent>
    );
  }

  const busy = assignMutation.isPending || removeMutation.isPending || toggleRepMutation.isPending;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          onClick={() => router.push(paths.dashboard.mynetwork.clusters.root)}
        >
          بازگشت به لیست
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: alpha(cluster.color || '#1976d2', 0.12),
                color: cluster.color || 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon={cluster.icon || 'solar:layers-bold-duotone'} width={26} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{cluster.name}</Typography>
              {cluster.description && (
                <Typography variant="body2" color="text.secondary">{cluster.description}</Typography>
              )}
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          onClick={() => { setSelectedToAdd([]); setAddSearch(''); setOpenAdd(true); }}
        >
          افزودن پیج به خوشه
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Chip icon={<Iconify icon="solar:users-group-rounded-bold-duotone" />} label={`${pages.length} پیج`} color="primary" variant="outlined" />
        <Chip icon={<Iconify icon="solar:star-bold-duotone" />} label={`${representatives.length} نماینده`} color="warning" variant={representatives.length > 0 ? 'filled' : 'outlined'} />
      </Stack>

      {representatives.length === 0 && pages.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Iconify icon="solar:star-bold-duotone" />}>
          هنوز نماینده‌ای برای این خوشه انتخاب نکرده‌اید. با کلیک روی آیکون ستاره کنار هر پیج،
          آن را به‌عنوان نماینده مشخص کنید. نمایندگان در داشبورد روی دامنه «نمایندگان شبکه» محاسبه می‌شوند.
        </Alert>
      )}

      {/* Search */}
      {pages.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="جستجو در پیج‌های این خوشه..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Empty state */}
      {pages.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:user-plus-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">این خوشه هنوز خالی است</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            با کلیک روی «افزودن پیج به خوشه» چند پیج را به این خوشه نسبت بدهید
            تا تحلیل‌های مخصوص این خوشه فعال شوند.
          </Typography>
        </Card>
      )}

      {/* Representatives section */}
      {filteredReps.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Iconify icon="solar:star-bold-duotone" sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>نمایندگان خوشه ({filteredReps.length})</Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {filteredReps.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <PageRow
                  page={p}
                  isRepresentative
                  onToggleRep={handleToggleRep}
                  onRemove={handleRemove}
                  busy={busy}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Other pages section */}
      {filteredOthers.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Iconify icon="solar:users-group-rounded-bold-duotone" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>سایر پیج‌های خوشه ({filteredOthers.length})</Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {filteredOthers.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <PageRow
                  page={p}
                  isRepresentative={false}
                  onToggleRep={handleToggleRep}
                  onRemove={handleRemove}
                  busy={busy}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Add pages dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن پیج به خوشه «{cluster.name}»</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="جستجو در پیج‌های قابل اضافه..."
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />
          {availableToAdd.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              {addSearch ? 'پیجی با این مشخصات یافت نشد' : 'همه پیج‌ها قبلاً به خوشه‌ها نسبت داده شده‌اند'}
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {availableToAdd.map((p) => {
                const checked = selectedToAdd.includes(p.id);
                return (
                  <Box
                    key={p.id}
                    onClick={() => {
                      setSelectedToAdd((prev) =>
                        prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                      );
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-of-type': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Checkbox checked={checked} onChange={() => {}} />
                    <Avatar src={proxyImage(p.profile_image_url)} sx={{ width: 32, height: 32 }}>
                      {p.name?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>@{p.username}</Typography>
                    </Box>
                    {p.cluster_id && (
                      <Chip size="small" label="در خوشه دیگر" variant="outlined" />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
          {selectedToAdd.length > 0 && (
            <Typography variant="caption" color="primary.main" sx={{ mt: 1, display: 'block' }}>
              {selectedToAdd.length} پیج برای افزودن انتخاب شده
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>انصراف</Button>
          <Button
            variant="contained"
            disabled={selectedToAdd.length === 0 || assignMutation.isPending}
            onClick={handleAdd}
          >
            {assignMutation.isPending ? '...' : `افزودن (${selectedToAdd.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
