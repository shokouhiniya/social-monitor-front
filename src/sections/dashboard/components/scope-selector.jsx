'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useClusters } from 'src/api/clusters';
import { useScopeContext } from 'src/contexts/scope-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SCOPE_OPTIONS = [
  {
    value: 'representatives',
    label: 'نمایندگان شبکه',
    description: 'تحلیل بر اساس پیج‌های انتخاب‌شده به‌عنوان نماینده هر خوشه',
    icon: 'solar:star-bold-duotone',
    color: 'warning',
  },
  {
    value: 'cluster',
    label: 'خوشه',
    description: 'تحلیل پیج‌های یک خوشه مشخص',
    icon: 'solar:layers-bold-duotone',
    color: 'info',
  },
  {
    value: 'all',
    label: 'کل شبکه',
    description: 'تحلیل تمام پیج‌های پایش‌شده',
    icon: 'solar:global-bold-duotone',
    color: 'primary',
  },
];

export function ScopeSelector() {
  const router = useRouter();
  const { scope, clusterId, setScope } = useScopeContext();
  const { data: clusters, isLoading } = useClusters();

  const activeOption = SCOPE_OPTIONS.find((o) => o.value === scope) || SCOPE_OPTIONS[0];
  const activeCluster = clusters?.find((c) => c.id === Number(clusterId));

  const handleScopeChange = (_, value) => {
    if (!value) return;
    if (value === 'cluster') {
      const firstCluster = clusters?.[0];
      setScope('cluster', firstCluster?.id || null);
    } else {
      setScope(value);
    }
  };

  return (
    <Card sx={{ p: 2, mb: 2, bgcolor: (t) => t.palette.background.neutral }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <Iconify icon={activeOption.icon} width={28} sx={{ color: `${activeOption.color}.main` }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>دامنه تحلیل</Typography>
            <Typography variant="caption" color="text.secondary">{activeOption.description}</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <ToggleButtonGroup
            value={scope}
            exclusive
            onChange={handleScopeChange}
            size="small"
            sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.75, fontSize: 13, fontWeight: 600 } }}
          >
            {SCOPE_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                <Iconify icon={opt.icon} width={18} sx={{ ml: 0.75 }} />
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {scope === 'cluster' && (
            isLoading ? (
              <Skeleton variant="rounded" width={220} height={40} />
            ) : (
              <TextField
                select
                size="small"
                value={clusterId || ''}
                onChange={(e) => setScope('cluster', Number(e.target.value))}
                sx={{ minWidth: 220 }}
                placeholder="انتخاب خوشه"
              >
                {!clusters?.length && (
                  <MenuItem value="" disabled>
                    خوشه‌ای ثبت نشده
                  </MenuItem>
                )}
                {clusters?.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color || 'primary.main' }} />
                      <span>{c.name}</span>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto !important' }}>
                        {c.pages_count || 0} پیج
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            )
          )}

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.mynetwork.clusters.root)}
            startIcon={<Iconify icon="solar:settings-bold-duotone" />}
          >
            مدیریت خوشه‌ها
          </Button>
        </Stack>
      </Stack>

      {scope === 'cluster' && activeCluster && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            خوشه فعال: <b style={{ color: activeCluster.color || 'inherit' }}>{activeCluster.name}</b>
            {' '}· {activeCluster.pages_count || 0} پیج · {activeCluster.representatives_count || 0} نماینده
          </Typography>
        </Box>
      )}
    </Card>
  );
}
