'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { usePages } from 'src/api/pages';

// ----------------------------------------------------------------------

export function PagesListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading } = usePages({
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        پیج‌ها
      </Typography>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="جستجوی پیج..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>پیج</TableCell>
                    <TableCell>پلتفرم</TableCell>
                    <TableCell>دسته‌بندی</TableCell>
                    <TableCell>کشور</TableCell>
                    <TableCell>فالوور</TableCell>
                    <TableCell>نفوذ</TableCell>
                    <TableCell>اعتبار</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(paths.dashboard.pages.profile(row.id))}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={row.profile_image_url} sx={{ width: 36, height: 36 }}>
                            {row.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" noWrap>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{row.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{row.platform || '—'}</TableCell>
                      <TableCell>
                        <Chip label={row.category || '—'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{row.country || '—'}</TableCell>
                      <TableCell>{row.followers_count?.toLocaleString()}</TableCell>
                      <TableCell>{row.influence_score?.toFixed(1)}</TableCell>
                      <TableCell>{row.credibility_score?.toFixed(1)}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Iconify icon="eva:arrow-ios-forward-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage="تعداد در صفحه:"
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
}
