'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
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

import { DashboardContent } from 'src/layouts/dashboard';
import { useCluster } from 'src/api/clusters';
import {
  useMicroMediaList,
  useUpdateMicroMedia,
  useSetMicroMediaRepresentative,
} from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * یک ردیف میکرورسانه در خوشه.
 */
function MediaRow({ media, isRepresentative, onToggleRep, onRemove, busy }) {
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
        bgcolor: (t) => (isRepresentative ? alpha(t.palette.warning.main, 0.04) : 'transparent'),
        '&:hover': { boxShadow: 4 },
      }}
    >
      {/* آیکون placeholder میکرورسانه */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'action.selected',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
        onClick={() => router.push(paths.dashboard.microMedia?.detail?.(media.id) ?? '#')}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {(media.name || '?')[0].toUpperCase()}
        </Typography>
      </Box>

      <Box
        sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }}
        onClick={() => router.push(paths.dashboard.microMedia?.detail?.(media.id) ?? '#')}
      >
        <Typography variant="subtitle2" noWrap>
          {media.name}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
          {media.identity_title && (
            <Chip size="small" label={media.identity_title} variant="soft" color="info" sx={{ fontSize: 10 }} />
          )}
          {media.activity_domain && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {media.activity_domain}
            </Typography>
          )}
        </Stack>
      </Box>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Tooltip title={isRepresentative ? 'لغو نماینده' : 'انتخاب به‌عنوان نماینده'}>
          <IconButton
            size="small"
            color="warning"
            disabled={busy}
            onClick={() => onToggleRep(media, !isRepresentative)}
          >
            <Iconify icon={isRepresentative ? 'solar:star-bold' : 'solar:star-line-duotone'} width={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="حذف از خوشه">
          <IconButton size="small" color="error" disabled={busy} onClick={() => onRemove(media)}>
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
  const { data: cluster, isLoading: clusterLoading } = useCluster(clusterId);

  // میکرورسانه‌های این خوشه (topic_cluster_id = clusterId)
  const { data: clusterMediaPage, isLoading: mediaLoading } = useMicroMediaList(
    clusterId ? { clusterId, limit: 500 } : null,
  );
  // همه میکرورسانه‌ها — برای دیالوگ افزودن
  const { data: allMediaPage } = useMicroMediaList({ limit: 500 });

  const updateMedia = useUpdateMicroMedia();
  const setRepMutation = useSetMicroMediaRepresentative();

  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [addSearch, setAddSearch] = useState('');

  const clusterMediaList = clusterMediaPage?.items ?? [];
  const allMediaList = allMediaPage?.items ?? [];

  const representatives = useMemo(
    () => clusterMediaList.filter((m) => m.is_cluster_representative),
    [clusterMediaList],
  );

  const filtered = useMemo(() => {
    if (!search) return clusterMediaList;
    const q = search.toLowerCase();
    return clusterMediaList.filter((m) => (m.name || '').toLowerCase().includes(q));
  }, [clusterMediaList, search]);

  const filteredReps = filtered.filter((m) => m.is_cluster_representative);
  const filteredOthers = filtered.filter((m) => !m.is_cluster_representative);

  // میکرورسانه‌هایی که هنوز در این خوشه نیستند (برای دیالوگ افزودن)
  const availableToAdd = useMemo(() => {
    const inCluster = new Set(clusterMediaList.map((m) => m.id));
    let list = allMediaList.filter((m) => !inCluster.has(m.id));
    if (addSearch) {
      const q = addSearch.toLowerCase();
      list = list.filter((m) => (m.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [allMediaList, clusterMediaList, addSearch]);

  // افزودن میکرورسانه‌ها به خوشه با آپدیت topic_cluster_id
  const handleAdd = async () => {
    if (!selectedToAdd.length) return;
    try {
      await Promise.all(
        selectedToAdd.map((id) =>
          updateMedia.mutateAsync({ id, data: { topic_cluster_id: Number(clusterId) } }),
        ),
      );
      setOpenAdd(false);
      setSelectedToAdd([]);
      setAddSearch('');
    } catch (err) {
      alert(err.message || 'خطا در اضافه کردن میکرورسانه‌ها');
    }
  };

  // حذف میکرورسانه از خوشه با null کردن topic_cluster_id
  const handleRemove = async (media) => {
    if (!window.confirm(`میکرورسانه «${media.name}» از این خوشه حذف شود؟`)) return;
    try {
      await updateMedia.mutateAsync({ id: media.id, data: { topic_cluster_id: null } });
    } catch (err) {
      alert(err.message || 'خطا در حذف');
    }
  };

  // toggle نماینده بودن
  const handleToggleRep = async (media, isRep) => {
    try {
      await setRepMutation.mutateAsync({ id: media.id, scope: 'cluster', value: isRep });
    } catch (err) {
      alert(err.message || 'خطا در تغییر وضعیت نماینده');
    }
  };

  const isLoading = clusterLoading || mediaLoading;

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

  const busy = updateMedia.isPending || setRepMutation.isPending;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
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
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {cluster.name}
              </Typography>
              {cluster.description && (
                <Typography variant="body2" color="text.secondary">
                  {cluster.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          onClick={() => {
            setSelectedToAdd([]);
            setAddSearch('');
            setOpenAdd(true);
          }}
        >
          افزودن میکرورسانه به خوشه
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Chip
          icon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
          label={`${clusterMediaList.length} میکرورسانه`}
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<Iconify icon="solar:star-bold-duotone" />}
          label={`${representatives.length} نماینده`}
          color="warning"
          variant={representatives.length > 0 ? 'filled' : 'outlined'}
        />
      </Stack>

      {representatives.length === 0 && clusterMediaList.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Iconify icon="solar:star-bold-duotone" />}>
          هنوز نماینده‌ای برای این خوشه انتخاب نکرده‌اید. با کلیک روی آیکون ستاره کنار هر
          میکرورسانه، آن را به‌عنوان نماینده مشخص کنید.
        </Alert>
      )}

      {/* Search */}
      {clusterMediaList.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="جستجو در میکرورسانه‌های این خوشه..."
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
      {clusterMediaList.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify
            icon="solar:user-plus-bold-duotone"
            width={64}
            sx={{ color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="h6">این خوشه هنوز خالی است</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}
          >
            با کلیک روی «افزودن میکرورسانه به خوشه» چند میکرورسانه را به این خوشه نسبت بدهید.
          </Typography>
        </Card>
      )}

      {/* Representatives */}
      {filteredReps.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Iconify icon="solar:star-bold-duotone" sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              نمایندگان خوشه ({filteredReps.length})
            </Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {filteredReps.map((m) => (
              <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <MediaRow
                  media={m}
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

      {/* Others */}
      {filteredOthers.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Iconify icon="solar:users-group-rounded-bold-duotone" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              سایر میکرورسانه‌های خوشه ({filteredOthers.length})
            </Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {filteredOthers.map((m) => (
              <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <MediaRow
                  media={m}
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

      {/* Add micro-media dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن میکرورسانه به خوشه «{cluster.name}»</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="جستجوی میکرورسانه..."
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 3 }}
            >
              {addSearch
                ? 'میکرورسانه‌ای با این مشخصات یافت نشد'
                : 'همه میکرورسانه‌ها قبلاً به خوشه‌ها نسبت داده شده‌اند'}
            </Typography>
          ) : (
            <Box
              sx={{
                maxHeight: 400,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {availableToAdd.map((m) => {
                const checked = selectedToAdd.includes(m.id);
                return (
                  <Box
                    key={m.id}
                    onClick={() =>
                      setSelectedToAdd((prev) =>
                        prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id],
                      )
                    }
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
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'action.selected',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {(m.name || '?')[0].toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {m.name}
                      </Typography>
                      {m.identity_title && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {m.identity_title}
                        </Typography>
                      )}
                    </Box>
                    {m.topic_cluster_id && m.topic_cluster_id !== Number(clusterId) && (
                      <Chip size="small" label="در خوشه دیگر" variant="outlined" />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
          {selectedToAdd.length > 0 && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ mt: 1, display: 'block' }}
            >
              {selectedToAdd.length} میکرورسانه برای افزودن انتخاب شده
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>انصراف</Button>
          <Button
            variant="contained"
            disabled={selectedToAdd.length === 0 || updateMedia.isPending}
            onClick={handleAdd}
          >
            {updateMedia.isPending ? '...' : `افزودن (${selectedToAdd.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
