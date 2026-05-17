'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useActorsSceneReport } from 'src/api/analytics';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ActorsSceneReport() {
  const { data, isLoading, isFetching, refetch } = useActorsSceneReport();

  return (
    <Card
      sx={(theme) => ({
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Box sx={(theme) => ({ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.05) })} />

      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2, position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={(theme) => ({ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.14) })}>
            <Iconify icon="solar:document-medicine-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>گزارش وضعیت صحنه کنشگران</Typography>
            <Typography variant="caption" color="text.secondary">
              تحلیل روایی ۳۰۰-۴۰۰ کلمه‌ای از ترکیب، پراکندگی و چهره‌های شاخص شبکه
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={isFetching ? <CircularProgress size={14} /> : <Iconify icon="solar:refresh-bold" />}
          onClick={() => refetch()}
          disabled={isFetching}
          sx={{ fontSize: 11, height: 28 }}
        >
          {isFetching ? 'در حال تولید...' : 'تولید مجدد'}
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <CircularProgress size={32} />
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5 }} color="text.secondary">
            در حال تولید گزارش با هوش مصنوعی...
          </Typography>
        </Box>
      ) : data?.report ? (
        <Box>
          {data.headline && (
            <Box sx={(theme) => ({ p: 1.5, mb: 2, borderRadius: 1.25, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRight: `3px solid ${theme.palette.primary.main}` })}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {data.headline}
              </Typography>
            </Box>
          )}

          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.6), backdropFilter: 'blur(8px)' })}>
            <Typography variant="body2" sx={{ lineHeight: 2.2, textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {data.report}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
            {data.total_pages !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:users-group-rounded-bold" width={14} sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{data.total_pages} پیج</Typography>
              </Stack>
            )}
            {data.alignment_index !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:graph-new-bold" width={14} sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">هم‌گرایی: {data.alignment_index}٪</Typography>
              </Stack>
            )}
            {data.generated_at && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto' }}>
                <Iconify icon="solar:clock-circle-bold" width={14} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  {new Date(data.generated_at).toLocaleString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            گزارشی موجود نیست — روی «تولید مجدد» کلیک کنید
          </Typography>
        </Box>
      )}
    </Card>
  );
}
