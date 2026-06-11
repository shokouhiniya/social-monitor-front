'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useClusters } from 'src/api/clusters';
import { useDefinitions } from 'src/api/definitions';
import { DashboardContent } from 'src/layouts/dashboard';
import { useMicroMediaList } from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

export function MonitorMicroMediaListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [clusterId, setClusterId] = useState('');
  const [identityTitle, setIdentityTitle] = useState('');

  const { data: clustersData } = useClusters();
  const { data: identities } = useDefinitions('identity');

  const params = {};
  if (search) params.search = search;
  if (clusterId) params.clusterId = clusterId;

  const { data, isLoading } = useMicroMediaList(params);
  const items = (data?.items ?? []).filter(
    (m) => !identityTitle || m.identity_title === identityTitle,
  );

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>پایش محتوا — میکرورسانه‌ها</Typography>

      <PageInfoBox
        title="پایش محتوا — میکرورسانه‌ها"
        icon="solar:users-group-rounded-bold-duotone"
        color="primary"
        shortDescription="روی هر میکرورسانه کلیک کنید تا تمام محتوای کراول‌شده یا وارد‌شده آن را با فیلتر پیشرفته ببینید."
        tips={[
          'محتوا شامل پست‌های همه سکوهای آن میکرورسانه است.',
          'می‌توانید بر اساس خوشه یا هویت فیلتر کنید.',
        ]}
      />

      {/* فیلترها */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="جستجو"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="خوشه"
            value={clusterId}
            onChange={(e) => setClusterId(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">همه خوشه‌ها</MenuItem>
            {(clustersData ?? []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="هویت"
            value={identityTitle}
            onChange={(e) => setIdentityTitle(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">همه هویت‌ها</MenuItem>
            {(identities ?? []).map((i) => (
              <MenuItem key={i.id} value={i.title}>{i.title}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Card>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:inbox-line-duotone" width={48} />
            <Typography sx={{ mt: 1 }}>میکرورسانه‌ای یافت نشد</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>هویت</TableCell>
                  <TableCell>خوشه</TableCell>
                  <TableCell>حوزه فعالیت</TableCell>
                  <TableCell align="center">سکوها</TableCell>
                  <TableCell align="right">محتوا</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(paths.dashboard.monitor.microMedia.content(m.id))}
                  >
                    <TableCell>
                      <Typography variant="subtitle2">{m.name}</Typography>
                    </TableCell>
                    <TableCell>
                      {m.identity_title ? (
                        <Chip size="small" label={m.identity_title} color="info" variant="soft" />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.topic_cluster_id ? (
                        <Chip
                          size="small"
                          label={(clustersData ?? []).find((c) => c.id === m.topic_cluster_id)?.name ?? `خوشه ${m.topic_cluster_id}`}
                          color="warning"
                          variant="soft"
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>{m.activity_domain || '—'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        variant="soft"
                        color={m.accountsCount > 0 ? 'info' : 'default'}
                        icon={<Iconify icon="solar:smartphone-2-bold" width={14} />}
                        label={m.accountsCount ?? 0}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(paths.dashboard.monitor.microMedia.content(m.id));
                        }}
                      >
                        مشاهده محتوا
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </DashboardContent>
  );
}
