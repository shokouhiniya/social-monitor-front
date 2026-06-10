'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useMicroMediaList, useSetMicroMediaRepresentative } from 'src/api/micro-media';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * دیالوگ مدیریت نمایندگان یک خوشه یا هویت (از میان میکرورسانه‌ها).
 *
 * props:
 *  - open, onClose
 *  - scope: 'cluster' | 'identity'
 *  - entity: { id, name | title }
 *  - label: عنوان نمایشی
 */
export function RepresentativeDialog({ open, onClose, scope, entity, label }) {
  const [search, setSearch] = useState('');

  const isCluster = scope === 'cluster';
  const repField = isCluster ? 'is_cluster_representative' : 'is_identity_representative';

  // فقط میکرورسانه‌هایی که متعلق به این خوشه/هویت هستند را بیاور
  const queryParams = useMemo(() => {
    if (!open) return null;
    if (isCluster) return { clusterId: entity?.id, limit: 500 };
    // برای هویت: همه را بیاور و بعد بر اساس identity_title فیلتر کن
    // (endpoint فیلتر identityTitle ندارد، پس client-side فیلتر می‌شود)
    return { limit: 500 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isCluster, entity?.id]);

  const { data: pageData, isLoading } = useMicroMediaList(queryParams);
  const setRep = useSetMicroMediaRepresentative();

  // فیلتر بر اساس تعلق به خوشه/هویت
  const belongingItems = useMemo(() => {
    const raw = pageData?.items ?? [];
    if (isCluster) return raw; // قبلاً با clusterId فیلتر شده
    if (!label) return raw;
    // هویت: فقط میکرورسانه‌هایی که identity_title با label مطابقت دارد
    const matched = raw.filter((m) => m.identity_title === label);
    return matched; // اگر خالی بود، همین را برمی‌گردانیم (نه همه)
  }, [pageData, isCluster, label]);

  const currentReps = useMemo(
    () => belongingItems.filter((m) => m[repField]),
    [belongingItems, repField],
  );

  const otherItems = useMemo(() => {
    const repIds = new Set(currentReps.map((m) => m.id));
    return belongingItems.filter((m) => !repIds.has(m.id));
  }, [belongingItems, currentReps]);

  const filteredReps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentReps;
    return currentReps.filter((m) => (m.name || '').toLowerCase().includes(q));
  }, [currentReps, search]);

  const filteredOthers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return otherItems;
    return otherItems.filter((m) => (m.name || '').toLowerCase().includes(q));
  }, [otherItems, search]);

  const handleToggle = async (media, makeRep) => {
    try {
      await setRep.mutateAsync({ id: media.id, scope, value: makeRep });
      toast.success(makeRep ? 'به‌عنوان نماینده انتخاب شد' : 'از نمایندگان حذف شد');
    } catch (err) {
      toast.error(err?.message || 'عملیات با خطا مواجه شد');
    }
  };

  const renderRow = (media, isRep) => (
    <Stack
      key={media.id}
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: isRep ? 'warning.main' : 'divider',
        bgcolor: (t) => (isRep ? `${t.palette.warning.main}0A` : 'transparent'),
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
            {media.name}
          </Typography>
      {/* نشان دادن خوشه یا هویت فعلی میکرورسانه */}
          {isCluster && media.topic_cluster_id === entity?.id && (
            <Chip size="small" label="این خوشه" variant="soft" color="info" sx={{ fontSize: 10 }} />
          )}
          {isCluster && media.topic_cluster_id != null && media.topic_cluster_id !== entity?.id && (
            <Chip size="small" label="خوشه دیگر" variant="soft" color="default" sx={{ fontSize: 10 }} />
          )}
          {!isCluster && media.identity_title === label && (
            <Chip size="small" label={label} variant="soft" color="info" sx={{ fontSize: 10 }} />
          )}
          {!isCluster && media.identity_title && media.identity_title !== label && (
            <Chip size="small" label={media.identity_title} variant="soft" color="default" sx={{ fontSize: 10 }} />
          )}
        </Stack>
        {media.activity_domain && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {media.activity_domain}
          </Typography>
        )}
      </Box>
      <Tooltip title={isRep ? 'حذف از نمایندگان' : 'انتخاب به‌عنوان نماینده'}>
        <span>
          <IconButton
            size="small"
            color="warning"
            disabled={setRep.isPending}
            onClick={() => handleToggle(media, !isRep)}
          >
            <Iconify icon={isRep ? 'solar:star-bold' : 'solar:star-line-duotone'} width={20} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        مدیریت نمایندگان
        <Typography variant="body2" color="text.secondary">
          {isCluster ? 'خوشه' : 'هویت'}: {label}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* توضیح */}
        <Alert severity="info" sx={{ mb: 2 }} icon={<Iconify icon="solar:star-bold-duotone" />}>
          {isCluster
            ? 'یک یا چند میکرورسانه را به‌عنوان نماینده این خوشه انتخاب کنید. نمایندگان در داشبورد برای فیلتر «نمایندگان خوشه» استفاده می‌شوند.'
            : 'یک یا چند میکرورسانه را به‌عنوان نماینده این هویت انتخاب کنید.'}
        </Alert>

        <TextField
          fullWidth
          size="small"
          placeholder="جستجوی میکرورسانه..."
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

        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : belongingItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:inbox-line-duotone" width={40} />
            <Typography sx={{ mt: 1 }}>
              {isCluster
                ? 'هیچ میکرورسانه‌ای در این خوشه نیست.'
                : `هیچ میکرورسانه‌ای با هویت «${label}» ثبت نشده است.`}
            </Typography>
            <Typography variant="caption">
              {isCluster
                ? 'ابتدا در صفحه جزئیات خوشه، میکرورسانه‌ها را به این خوشه اضافه کنید.'
                : 'ابتدا در بخش میکرورسانه‌ها، هویت رسانه‌ها را تنظیم کنید.'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* نمایندگان فعلی */}
            {filteredReps.length > 0 && (
              <Box>
                <Typography variant="overline" color="warning.main" sx={{ display: 'block', mb: 1 }}>
                  ★ نمایندگان ({filteredReps.length})
                </Typography>
                <Stack spacing={0.75}>
                  {filteredReps.map((m) => renderRow(m, true))}
                </Stack>
              </Box>
            )}

            {/* سایر میکرورسانه‌ها */}
            {filteredOthers.length > 0 && (
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  سایر میکرورسانه‌ها ({filteredOthers.length})
                </Typography>
                <Stack spacing={0.75}>
                  {filteredOthers.map((m) => renderRow(m, false))}
                </Stack>
              </Box>
            )}

            {filteredReps.length === 0 && filteredOthers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                نتیجه‌ای یافت نشد
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}
