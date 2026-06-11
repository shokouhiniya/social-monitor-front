'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useClusters } from 'src/api/clusters';
import { useDefinitions } from 'src/api/definitions';
import { useScopeContext } from 'src/contexts/scope-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * گروه‌بندی scope‌ها:
 *
 * گروه «خوشه»:
 *   cluster-representatives  → نمایندگان خوشه (پیش‌فرض)
 *   cluster                  → کل میکرورسانه‌های یک خوشه
 *
 * گروه «هویت»:
 *   identity-representatives → نمایندگان یک هویت
 *   identity                 → کل میکرورسانه‌های یک هویت
 *
 * گروه «کلان»:
 *   all                      → کل شبکه
 */
const SCOPE_GROUPS = [
  {
    group: 'خوشه',
    icon: 'solar:layers-bold-duotone',
    color: 'warning',
    options: [
      {
        value: 'cluster-representatives',
        label: 'نمایندگان خوشه',
        description: 'تحلیل نمایندگان انتخاب‌شده در خوشه‌ها',
        icon: 'solar:star-bold-duotone',
        color: 'warning',
        needsCluster: true,
        needsIdentity: false,
      },
      {
        value: 'cluster',
        label: 'کل خوشه',
        description: 'تحلیل همه میکرورسانه‌های یک خوشه',
        icon: 'solar:layers-bold-duotone',
        color: 'info',
        needsCluster: true,
        needsIdentity: false,
      },
    ],
  },
  {
    group: 'هویت',
    icon: 'solar:user-id-bold-duotone',
    color: 'info',
    options: [
      {
        value: 'identity-representatives',
        label: 'نمایندگان هویت',
        description: 'تحلیل نمایندگان انتخاب‌شده در یک هویت',
        icon: 'solar:star-bold-duotone',
        color: 'success',
        needsCluster: false,
        needsIdentity: true,
      },
      {
        value: 'identity',
        label: 'کل هویت',
        description: 'تحلیل همه میکرورسانه‌های یک هویت',
        icon: 'solar:user-id-bold-duotone',
        color: 'primary',
        needsCluster: false,
        needsIdentity: true,
      },
    ],
  },
  {
    group: 'کلان',
    icon: 'solar:global-bold-duotone',
    color: 'default',
    options: [
      {
        value: 'all',
        label: 'کل شبکه',
        description: 'تحلیل تمام میکرورسانه‌های پایش‌شده',
        icon: 'solar:global-bold-duotone',
        color: 'default',
        needsCluster: false,
        needsIdentity: false,
      },
    ],
  },
];

// flat list برای lookup
const ALL_SCOPE_OPTIONS = SCOPE_GROUPS.flatMap((g) => g.options);

export function ScopeSelector() {
  const router = useRouter();
  const { scope, clusterId, identityTitle, setScope } = useScopeContext();
  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const { data: identities, isLoading: identitiesLoading } = useDefinitions('identity');

  const activeOption = ALL_SCOPE_OPTIONS.find((o) => o.value === scope) ?? ALL_SCOPE_OPTIONS[0];
  const activeCluster = clusters?.find((c) => c.id === Number(clusterId));
  const activeIdentity = identityTitle;

  const handleScopeChange = (_, value) => {
    if (!value) return;
    const opt = ALL_SCOPE_OPTIONS.find((o) => o.value === value);
    if (!opt) return;

    if (opt.needsCluster) {
      const firstCluster = clusters?.[0];
      setScope(value, { clusterId: firstCluster?.id ?? null });
    } else if (opt.needsIdentity) {
      const firstIdentity = identities?.[0]?.title ?? null;
      setScope(value, { identityTitle: firstIdentity });
    } else {
      setScope(value);
    }
  };

  return (
    <Card sx={{ p: 2, mb: 2, bgcolor: (t) => t.palette.background.neutral }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ lg: 'center' }}
        justifyContent="space-between"
      >
        {/* آیکون و توضیح scope فعال */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <Iconify icon={activeOption.icon} width={28} sx={{ color: `${activeOption.color}.main` }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              دامنه تحلیل
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeOption.description}
            </Typography>
          </Box>
        </Stack>

        {/* کنترل‌ها */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {/* گروه‌های scope */}
          {SCOPE_GROUPS.map((group, gi) => (
            <Stack key={group.group} direction="row" spacing={0.5} alignItems="center">
              {gi > 0 && (
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              )}
              <ToggleButtonGroup
                value={scope}
                exclusive
                onChange={handleScopeChange}
                size="small"
                sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.75, fontSize: 12, fontWeight: 600 } }}
              >
                {group.options.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    color={opt.color !== 'default' ? opt.color : undefined}
                  >
                    <Iconify icon={opt.icon} width={16} sx={{ ml: 0.5 }} />
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ))}

          {/* dropdown خوشه */}
          {activeOption.needsCluster && (
            clustersLoading ? (
              <Skeleton variant="rounded" width={200} height={40} />
            ) : (
              <TextField
                select
                size="small"
                value={clusterId || ''}
                onChange={(e) => setScope(scope, { clusterId: Number(e.target.value) })}
                sx={{ minWidth: 200 }}
                label="خوشه"
              >
                {!clusters?.length && (
                  <MenuItem value="" disabled>خوشه‌ای ثبت نشده</MenuItem>
                )}
                {(clusters ?? []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color || 'primary.main', flexShrink: 0 }} />
                      <span>{c.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            )
          )}

          {/* dropdown هویت */}
          {activeOption.needsIdentity && (
            identitiesLoading ? (
              <Skeleton variant="rounded" width={200} height={40} />
            ) : (
              <TextField
                select
                size="small"
                value={identityTitle || ''}
                onChange={(e) => setScope(scope, { identityTitle: e.target.value })}
                sx={{ minWidth: 200 }}
                label="هویت"
              >
                {!identities?.length && (
                  <MenuItem value="" disabled>هویتی ثبت نشده</MenuItem>
                )}
                {(identities ?? []).map((i) => (
                  <MenuItem key={i.id} value={i.title}>
                    {i.title}
                  </MenuItem>
                ))}
              </TextField>
            )
          )}

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.definitions.clusters)}
            startIcon={<Iconify icon="solar:settings-bold-duotone" />}
          >
            مدیریت تعاریف
          </Button>
        </Stack>
      </Stack>

      {/* نوار اطلاعات scope فعال */}
      {(activeOption.needsCluster && activeCluster) && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: activeCluster.color || 'primary.main' }} />
            <Typography variant="caption" color="text.secondary">
              خوشه فعال: <b>{activeCluster.name}</b>
            </Typography>
            <Chip size="small" label={`${activeCluster.pages_count || 0} میکرورسانه`} variant="soft" color="info" sx={{ fontSize: 10 }} />
            <Chip size="small" label={`${activeCluster.representatives_count || 0} نماینده`} variant="soft" color="warning" sx={{ fontSize: 10 }} />
          </Stack>
        </Box>
      )}

      {(activeOption.needsIdentity && activeIdentity) && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            هویت فعال: <b>{activeIdentity}</b>
          </Typography>
        </Box>
      )}
    </Card>
  );
}
