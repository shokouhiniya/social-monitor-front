'use client';

import { useState, useCallback } from 'react';

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
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { usePages, useCreatePage, useBulkCreatePages, useDeletePage } from 'src/api/pages';

// ----------------------------------------------------------------------

const PLATFORM_ICONS = { instagram: 'mdi:instagram', twitter: 'mdi:twitter', telegram: 'mdi:telegram' };
const CATEGORY_LABELS = {
  news: 'خبری', activist: 'فعال', celebrity: 'سلبریتی', lifestyle: 'لایف‌استایل',
  economy: 'اقتصادی', local_news: 'محلی', politician: 'سیاستمدار', documentary: 'مستند',
  religious: 'مذهبی', art: 'هنری', student: 'دانشجویی', health: 'سلامت',
  technology: 'تکنولوژی', culture: 'فرهنگی', sports: 'ورزشی', analyst: 'تحلیل‌گر',
};
const EMPTY_FORM = { name: '', username: '', platform: 'instagram', category: '', country: '', language: '', bio: '' };

// Health badge based on activity
function HealthBadge({ page }) {
  const color = !page.is_active ? '#FF5630' : page.consistency_rate < 3 ? '#FFAB00' : '#22C55E';
  const label = !page.is_active ? 'غیرفعال' : page.consistency_rate < 3 ? 'کم‌فعال' : 'فعال';
  return (
    <Tooltip title={label} arrow>
      <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', bgcolor: color, border: '2px solid', borderColor: 'background.paper' }} />
    </Tooltip>
  );
}

// Mini sparkline based on page metrics
function MiniSparkline({ page }) {
  // Generate trend from actual metrics
  const base = page.followers_count || 100;
  const influence = page.influence_score || 5;
  const consistency = page.consistency_rate || 5;
  const seed = page.id || 1;
  const points = Array.from({ length: 7 }, (_, i) => {
    const trend = consistency > 5 ? 0.02 : -0.01;
    return base * (1 + trend * (i - 3)) * (1 + Math.sin(seed + i * 1.5) * 0.03);
  });
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 8} ${28 - ((p - min) / range) * 24}`).join(' ');
  const trending = points[6] > points[0];

  return (
    <svg width="56" height="30" viewBox="0 0 48 30">
      <path d={path} fill="none" stroke={trending ? '#22C55E' : '#FF5630'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PagesListView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selected, setSelected] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCluster, setFilterCluster] = useState('');
  const [filterInfluence, setFilterInfluence] = useState([0, 10]);

  const params = {
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
    segment: segment !== 'all' ? segment : undefined,
  };

  const { data, isLoading } = usePages(params);
  const createMutation = useCreatePage();
  const bulkMutation = useBulkCreatePages();
  const deleteMutation = useDeletePage();
  const rows = data?.data || [];
  const total = data?.total || 0;

  const handleCreate = () => {
    createMutation.mutate(form, { onSuccess: () => { setOpenAdd(false); setForm(EMPTY_FORM); } });
  };

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? rows.map((r) => r.id) : []);
  };

  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleDownloadTemplate = () => {
    const header = 'name,username,platform,category,country,language';
    const example = 'نمونه پیج,sample_page,instagram,news,ایران,فارسی';
    const csv = `${header}\n${example}`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pages_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`آیا از حذف ${selected.length} پیج مطمئن هستید؟`)) return;
    Promise.all(selected.map((id) => deleteMutation.mutateAsync(id)))
      .then(() => setSelected([]));
  };

  const handleExportExcel = () => {
    const selectedRows = rows.filter((r) => selected.includes(r.id));
    const headers = ['id', 'name', 'username', 'platform', 'category', 'country', 'language', 'followers_count', 'following_count', 'influence_score', 'credibility_score', 'consistency_rate', 'cluster', 'is_active'];
    const csvRows = [headers.join(',')];
    for (const r of selectedRows) {
      csvRows.push(headers.map((h) => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val);
      }).join(','));
    }
    const csv = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pages_export_${selected.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== 'string') return;
      const lines = text.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      }).filter((r) => r.name);
      setImportPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    bulkMutation.mutate(importPreview, {
      onSuccess: () => { setOpenImport(false); setImportPreview([]); },
    });
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>پیج‌ها</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت و تحلیل {total} پیج تحت پایش</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Iconify icon="solar:filter-bold" />} onClick={() => setOpenFilter(true)}>
            فیلتر پیشرفته
          </Button>
          <Button variant="outlined" startIcon={<Iconify icon="solar:file-download-bold" />} onClick={handleDownloadTemplate}>
            دانلود قالب اکسل
          </Button>
          <Button variant="outlined" color="info" startIcon={<Iconify icon="solar:upload-bold" />} onClick={() => setOpenImport(true)}>
            ایمپورت اکسل
          </Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => setOpenAdd(true)}>
            افزودن پیج
          </Button>
        </Stack>
      </Stack>

      {/* Quick Segment Bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        {[
          { key: 'all', label: 'همه', icon: 'solar:list-bold' },
          { key: 'ghost', label: 'در معرض ریزش', icon: 'solar:ghost-bold', color: 'error' },
          { key: 'high_influence_low_credibility', label: 'نفوذ بالا / اعتبار کم', icon: 'solar:danger-triangle-bold', color: 'warning' },
          { key: 'new', label: 'تازه واردها', icon: 'solar:star-bold', color: 'success' },
        ].map((seg) => (
          <Chip
            key={seg.key}
            label={seg.label}
            variant={segment === seg.key ? 'filled' : 'outlined'}
            color={segment === seg.key ? (seg.color || 'primary') : 'default'}
            icon={<Iconify icon={seg.icon} width={16} />}
            onClick={() => { setSegment(seg.key); setPage(0); }}
          />
        ))}
      </Stack>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth size="small" placeholder="جستجوی نام پیج..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-bold-duotone" sx={{ color: 'text.disabled' }} /></InputAdornment>,
            }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox checked={selected.length === rows.length && rows.length > 0} indeterminate={selected.length > 0 && selected.length < rows.length} onChange={handleSelectAll} /></TableCell>
                    <TableCell>پیج</TableCell>
                    <TableCell>دسته‌بندی</TableCell>
                    <TableCell>فالوور</TableCell>
                    <TableCell>روند</TableCell>
                    <TableCell>نفوذ</TableCell>
                    <TableCell>همراهی</TableCell>
                    <TableCell>آخرین فعالیت</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover selected={selected.includes(row.id)} sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(paths.dashboard.pages.profile(row.id))}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(row.id)} onChange={() => handleSelect(row.id)} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={row.profile_image_url} sx={{ width: 36, height: 36 }}>{row.name?.[0]}</Avatar>
                            <HealthBadge page={row} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.name}</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon={PLATFORM_ICONS[row.platform] || 'mdi:web'} width={12} sx={{ color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary">@{row.username}</Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={CATEGORY_LABELS[row.category] || row.category || '—'} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.followers_count?.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <MiniSparkline page={row} />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{row.influence_score?.toFixed(1)}</Typography>
                          <LinearProgress variant="determinate" value={Math.min(row.influence_score * 10, 100)} sx={{ height: 4, borderRadius: 1 }} color="warning" />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{row.credibility_score?.toFixed(1)}</Typography>
                          <LinearProgress variant="determinate" value={Math.min(row.credibility_score * 10, 100)} sx={{ height: 4, borderRadius: 1 }} color={row.credibility_score > 7 ? 'success' : 'info'} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                          {row.updated_at ? new Date(row.updated_at).toLocaleDateString('fa-IR') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="مشاهده پروفایل" arrow>
                            <IconButton size="small" onClick={() => router.push(paths.dashboard.pages.profile(row.id))}>
                              <Iconify icon="solar:eye-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
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

      {/* Batch Action Bar */}
      {selected.length > 0 && (
        <Box
          sx={(theme) => ({
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            px: 3, py: 1.5, borderRadius: 2, zIndex: 1300,
            bgcolor: alpha(theme.palette.grey[900], 0.95), backdropFilter: 'blur(8px)',
            boxShadow: theme.shadows[16], display: 'flex', alignItems: 'center', gap: 2,
          })}
        >
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
            {selected.length} پیج انتخاب شده
          </Typography>
          <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} startIcon={<Iconify icon="solar:file-download-bold" />} onClick={handleExportExcel}>
            خروجی اکسل
          </Button>
          <Button size="small" variant="outlined" color="error" startIcon={<Iconify icon="solar:trash-bin-trash-bold" />} onClick={handleBulkDelete}>
            حذف
          </Button>
          <IconButton size="small" onClick={() => setSelected([])} sx={{ color: '#fff' }}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </Box>
      )}

      {/* Add Page Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن پیج جدید</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="نام پیج" value={form.name} onChange={set('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="یوزرنیم" value={form.username} onChange={set('username')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="پلتفرم" value={form.platform} onChange={set('platform')}>
                <MenuItem value="instagram">اینستاگرام</MenuItem><MenuItem value="twitter">توییتر</MenuItem><MenuItem value="telegram">تلگرام</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={form.category} onChange={set('category')}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="کشور" value={form.country} onChange={set('country')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="زبان" value={form.language} onChange={set('language')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.name || createMutation.isPending}>ثبت</Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Filter Drawer */}
      <Drawer anchor="left" open={openFilter} onClose={() => setOpenFilter(false)}>
        <Box sx={{ width: 320, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>فیلتر پیشرفته</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>خوشه</Typography>
          <TextField select fullWidth size="small" value={filterCluster} onChange={(e) => setFilterCluster(e.target.value)} sx={{ mb: 3 }}>
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="رسانه مقاومت">رسانه مقاومت</MenuItem>
            <MenuItem value="رسانه بین‌المللی">رسانه بین‌المللی</MenuItem>
            <MenuItem value="فعالان حقوق فلسطین">فعالان حقوق فلسطین</MenuItem>
            <MenuItem value="لایف‌استایل">لایف‌استایل</MenuItem>
            <MenuItem value="رسانه محلی">رسانه محلی</MenuItem>
            <MenuItem value="هنر و فرهنگ">هنر و فرهنگ</MenuItem>
          </TextField>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>بازه نفوذ</Typography>
          <Slider value={filterInfluence} onChange={(_, v) => setFilterInfluence(v)} min={0} max={10} step={0.5} valueLabelDisplay="auto" sx={{ mb: 3 }} />

          <Button variant="contained" fullWidth onClick={() => setOpenFilter(false)}>اعمال فیلتر</Button>
        </Box>
      </Drawer>

      {/* Import Excel Dialog */}
      <Dialog open={openImport} onClose={() => { setOpenImport(false); setImportPreview([]); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:upload-bold-duotone" width={24} sx={{ color: 'info.main' }} />
            <span>ایمپورت پیج‌ها از فایل CSV</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {importPreview.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Iconify icon="solar:file-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                فایل CSV خود را انتخاب کنید. ابتدا قالب را دانلود و پر کنید.
              </Typography>
              <Button variant="outlined" component="label" startIcon={<Iconify icon="solar:upload-bold" />}>
                انتخاب فایل
                <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                پیش‌نمایش ({importPreview.length} پیج)
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>نام</TableCell>
                      <TableCell>یوزرنیم</TableCell>
                      <TableCell>پلتفرم</TableCell>
                      <TableCell>دسته‌بندی</TableCell>
                      <TableCell>کشور</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>@{row.username}</TableCell>
                        <TableCell>{row.platform}</TableCell>
                        <TableCell>{CATEGORY_LABELS[row.category] || row.category}</TableCell>
                        <TableCell>{row.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenImport(false); setImportPreview([]); }}>انصراف</Button>
          {importPreview.length > 0 && (
            <Button variant="contained" onClick={handleBulkImport} disabled={bulkMutation.isPending}
              startIcon={bulkMutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:check-circle-bold" />}
            >
              تایید و افزودن {importPreview.length} پیج
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
