'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import {
  genderLabel,
  topicalLabel,
  identityLabel,
  ageRangeLabel,
  religionLabel,
} from '../constants';

// ----------------------------------------------------------------------

function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  if (typeof n !== 'number') return String(n);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('fa-IR');
}

function formatRate(rate) {
  if (rate === null || rate === undefined) return '—';
  if (rate < 0.01) return `${rate.toFixed(3)}٪`;
  return `${rate.toFixed(2)}٪`;
}

function MetricTile({ icon, label, value, hint, color = 'primary' }) {
  return (
    <Tooltip title={hint || ''} arrow disableHoverListener={!hint}>
      <Box
        sx={(theme) => ({
          p: 1.5,
          borderRadius: 1.5,
          height: '100%',
          bgcolor: alpha(theme.palette[color].main, 0.06),
          border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        })}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon={icon} width={14} sx={{ color: `${color}.main` }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600 }}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 13, color: `${color}.main` }}>
          {value}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function FactRow({ icon, label, value, color = 'text.primary' }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ py: 0.75 }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Iconify icon={icon} width={14} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12, color }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

export function PageIdentityCard({ page }) {
  if (!page) return null;

  const followers = page.followers_count || 0;
  const following = page.following_count || 0;
  const avgLikes = page.avg_likes || 0;
  const avgComments = page.avg_comments || 0;
  const engagementRate = page.engagement_rate || 0;
  const postsCount = page.posts_count || page.posts?.length || 0;

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:user-id-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          هویت و تعامل پیج
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {/* Bio */}
        {page.bio && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={(theme) => ({
                p: 1.25,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.grey[500], 0.06),
                borderRight: `3px solid ${theme.palette.primary.main}`,
              })}
            >
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block', mb: 0.5 }}>
                بیو
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7 }}>
                {page.bio}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Engagement metrics tiles */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:users-group-rounded-bold"
            label="فالوور"
            value={formatNumber(followers)}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:user-plus-bold"
            label="فالووینگ"
            value={formatNumber(following)}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:gallery-bold"
            label="تعداد پست"
            value={formatNumber(postsCount)}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:heart-bold"
            label="میانگین لایک"
            value={formatNumber(Math.round(avgLikes))}
            hint="میانگین لایک ۱۰ پست انتهایی"
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:chat-round-dots-bold"
            label="میانگین کامنت"
            value={formatNumber(Math.round(avgComments))}
            hint="میانگین کامنت ۱۰ پست انتهایی"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <MetricTile
            icon="solar:graph-up-bold"
            label="نرخ تعامل"
            value={formatRate(engagementRate)}
            hint="(میانگین لایک + میانگین کامنت) ÷ فالوور × ۱۰۰"
            color="success"
          />
        </Grid>

        {/* Demographics & content rows */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack
            divider={
              <Box sx={(theme) => ({ borderBottom: `1px dashed ${theme.palette.divider}` })} />
            }
            sx={(theme) => ({
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <FactRow icon="solar:planet-bold" label="ملیت" value={page.nationality} />
            <FactRow icon="solar:global-bold" label="کشور" value={page.country} />
            <FactRow
              icon="solar:translation-bold"
              label="زبان تولیدی"
              value={page.content_language || page.language}
            />
            <FactRow
              icon="solar:church-bold"
              label="دین و مذهب"
              value={religionLabel(page.religion)}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack
            divider={
              <Box sx={(theme) => ({ borderBottom: `1px dashed ${theme.palette.divider}` })} />
            }
            sx={(theme) => ({
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <FactRow icon="solar:user-bold" label="جنسیت" value={genderLabel(page.gender)} />
            <FactRow
              icon="solar:user-rounded-bold"
              label="رده سنی"
              value={ageRangeLabel(page.age_range)}
            />
            <FactRow
              icon="solar:bookmark-square-bold"
              label="خوشه موضوعی"
              value={topicalLabel(page.category)}
            />
            <FactRow
              icon="solar:user-id-bold"
              label="کیستی صفحه"
              value={identityLabel(page.identity_category)}
            />
          </Stack>
        </Grid>

        {/* Cluster + tags */}
        {(page.cluster || page.keywords?.length > 0) && (
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {page.cluster && (
                <Chip
                  label={`خوشه: ${page.cluster}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
              {(page.keywords || []).slice(0, 8).map((kw) => (
                <Chip key={kw} label={kw} size="small" variant="outlined" />
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
