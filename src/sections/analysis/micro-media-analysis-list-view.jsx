'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

export function MicroMediaAnalysisListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useMicroMediaList({ pageSize: 200, search: search || undefined });

  const items = data?.items ?? [];

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>تحلیل میکرورسانه‌ها</Typography>

      <PageInfoBox
        title="تحلیل میکرورسانه‌ها"
        icon="solar:user-id-bold-duotone"
        color="primary"
        shortDescription="فهرست همهٔ میکرورسانه‌ها؛ روی هر کدام بزنید تا داشبورد تحلیلی همان میکرورسانه (کل و به تفکیک هر سکو) باز شود."
        tips={['داشبورد هر میکرورسانه، محتوای همهٔ سکوهای آن را با هم و نیز جداگانه تحلیل می‌کند.']}
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="جستجوی میکرورسانه..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Card>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>میکرورسانه‌ای یافت نشد</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>حوزهٔ فعالیت</TableCell>
                  <TableCell align="center">سکوها</TableCell>
                  <TableCell align="center">تعاملات</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((m) => (
                  <TableRow
                    key={m.id}
                    hover
                    onClick={() => router.push(paths.dashboard.analysis.microMedia.detail(m.id))}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell><Typography variant="subtitle2">{m.name}</Typography></TableCell>
                    <TableCell>{m.activity_domain || '—'}</TableCell>
                    <TableCell align="center">{m.accountsCount ?? 0}</TableCell>
                    <TableCell align="center">{m.interactionsCount ?? 0}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="soft" label={m.status === 'active' ? 'فعال' : m.status} color={m.status === 'active' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Iconify icon="eva:arrow-ios-back-fill" sx={{ color: 'text.disabled' }} />
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
