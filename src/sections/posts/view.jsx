'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { usePosts } from 'src/api/posts';
import { HighImpactFeed } from '../dashboard/components/high-impact-feed';
import { LatestPosts } from '../dashboard/components/latest-posts';

// ----------------------------------------------------------------------

const SENTIMENT_COLORS = {
  angry: 'error',
  hopeful: 'success',
  neutral: 'default',
  sad: 'info',
};

export function PostsListView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading } = usePosts({
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>پست‌ها</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>مدیریت و تحلیل پست‌های شبکه پایش</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}><HighImpactFeed /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><LatestPosts /></Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="جستجو در کپشن‌ها..."
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
                    <TableCell>کپشن</TableCell>
                    <TableCell>نوع</TableCell>
                    <TableCell>لحن</TableCell>
                    <TableCell>لایک</TableCell>
                    <TableCell>کامنت</TableCell>
                    <TableCell>تاریخ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap>{row.page?.name || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {row.caption || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.post_type || '—'}</TableCell>
                      <TableCell>
                        {row.sentiment_label && (
                          <Chip
                            label={row.sentiment_label}
                            size="small"
                            color={SENTIMENT_COLORS[row.sentiment_label] || 'default'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{row.likes_count?.toLocaleString()}</TableCell>
                      <TableCell>{row.comments_count?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {row.published_at ? new Date(row.published_at).toLocaleDateString('fa-IR') : '—'}
                        </Typography>
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
