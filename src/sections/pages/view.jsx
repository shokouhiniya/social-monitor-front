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
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { usePages, useCreatePage } from 'src/api/pages';
import { GhostPagesCard } from '../macro/components/ghost-pages-card';

// ----------------------------------------------------------------------

const PLATFORM_ICONS = {
  instagram: 'mdi:instagram',
  twitter: 'mdi:twitter',
  telegram: 'mdi:telegram',
};

const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر',
};

const EMPTY_FORM = { name: '', username: '', platform: 'instagram', category: '', country: '', language: '', bio: '' };

export function PagesListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = usePages({
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const createMutation = useCreatePage();
  const rows = data?.data || [];
  const total = data?.total || 0;

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => { setOpen(false); setForm(EMPTY_FORM); },
    });
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>پیج‌ها</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت و تحلیل پیج‌های تحت پایش</Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpen(true)}>
          افزودن پیج
        </Button>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <GhostPagesCard />
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth size="small" placeholder="جستجوی پیج..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold-duotone" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
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
                    <TableCell>وضعیت</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(paths.dashboard.pages.profile(row.id))}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar src={row.profile_image_url} sx={{ width: 38, height: 38 }}>
                            {row.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{row.username}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon={PLATFORM_ICONS[row.platform] || 'mdi:web'} width={18} sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption">{row.platform}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={CATEGORY_LABELS[row.category] || row.category || '—'} size="small" variant="soft" />
                      </TableCell>
                      <TableCell><Typography variant="caption">{row.country || '—'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.followers_count?.toLocaleString()}</Typography></TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{row.influence_score?.toFixed(1)}</Typography>
                          <LinearProgress variant="determinate" value={Math.min(row.influence_score * 10, 100)} sx={{ height: 4, borderRadius: 1 }} color={row.influence_score > 7 ? 'success' : row.influence_score > 4 ? 'warning' : 'error'} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{row.credibility_score?.toFixed(1)}</Typography>
                          <LinearProgress variant="determinate" value={Math.min(row.credibility_score * 10, 100)} sx={{ height: 4, borderRadius: 1 }} color={row.credibility_score > 7 ? 'success' : row.credibility_score > 4 ? 'info' : 'error'} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {row.is_active ? (
                          <Chip label="فعال" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip label="غیرفعال" size="small" color="error" variant="outlined" icon={<Iconify icon="mdi:ghost" width={14} />} />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small"><Iconify icon="solar:arrow-left-bold" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage="تعداد:"
            />
          </>
        )}
      </Card>

      {/* Add Page Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن پیج جدید</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="نام پیج" value={form.name} onChange={set('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="یوزرنیم" value={form.username} onChange={set('username')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="پلتفرم" value={form.platform} onChange={set('platform')}>
                <MenuItem value="instagram">اینستاگرام</MenuItem>
                <MenuItem value="twitter">توییتر</MenuItem>
                <MenuItem value="telegram">تلگرام</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={form.category} onChange={set('category')}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="کشور" value={form.country} onChange={set('country')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="زبان" value={form.language} onChange={set('language')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="بیو" multiline rows={2} value={form.bio} onChange={set('bio')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.name || createMutation.isPending}>ثبت</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
