'use client';

import { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { proxyImage } from 'src/utils/proxy-image';

import { DashboardContent } from 'src/layouts/dashboard';
import { usePages, useCreatePage, useUpdatePage, useDeletePage, useBulkCreatePages, useFetchPageData, useProcessPageData, usePageProgress } from 'src/api/pages';
import { usePulseByPage } from 'src/api/posts';

import { Iconify } from 'src/components/iconify';

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

// Pulse mini bar — shows daily post count for last 7 days
function PulseMiniBar({ data }) {
  const items = data || [];
  if (items.length === 0) {
    return <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>—</Typography>;
  }
  const maxCount = Math.max(...items.map((i) => Number(i.count)), 1);
  const total = items.reduce((s, i) => s + Number(i.count), 0);

  return (
    <Tooltip title={`${total} پست در ۷ روز`} arrow>
      <Stack direction="row" alignItems="flex-end" spacing="2px" sx={{ height: 24 }}>
        {items.map((item, idx) => {
          const h = (Number(item.count) / maxCount) * 20;
          return (
            <Box key={idx} sx={{ width: 5, minHeight: 2, height: Math.max(h, 2), bgcolor: h > 15 ? 'error.main' : h > 8 ? 'warning.main' : 'success.main', borderRadius: 0.5, transition: 'height 0.3s' }} />
          );
        })}
      </Stack>
    </Tooltip>
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
  const [orderBy, setOrderBy] = useState('influence_score');
  const [order, setOrder] = useState('desc');
  const [quickEditRow, setQuickEditRow] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState(EMPTY_FORM);

  const params = {
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
    segment: segment !== 'all' ? segment : undefined,
  };

  const { data, isLoading } = usePages(params);
  const { data: pulseData } = usePulseByPage(7);
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const bulkMutation = useBulkCreatePages();
  const deleteMutation = useDeletePage();
  const fetchMutation = useFetchPageData();
  const processMutation = useProcessPageData();

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const sortedRows = [...(data?.data || [])].sort((a, b) => {
    const aVal = a[orderBy] ?? 0;
    const bVal = b[orderBy] ?? 0;
    if (typeof aVal === 'string') return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const rows = sortedRows;
  const total = data?.total || 0;

  // --- Batch operations state ---
  const [batchRunning, setBatchRunning] = useState(false); // true when any batch op is running
  const [batchType, setBatchType] = useState(''); // 'fetch' or 'process'
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentPage: '', currentPageId: null });
  const [batchResults, setBatchResults] = useState(null);
  const [batchCancelled, setBatchCancelled] = useState(false);
  const cancelRef = useRef(false);

  // Process options dialog
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processDialogTarget, setProcessDialogTarget] = useState([]); // page IDs to process
  const [processOptions, setProcessOptions] = useState({
    transcription: true, ocr: true, translation: true, analysis: true, force: false,
  });

  // Poll per-page progress
  const { data: currentBatchPageProgress } = usePageProgress(
    batchProgress.currentPageId,
    batchRunning && !!batchProgress.currentPageId,
  );
  const activeBatchProgress = Array.isArray(currentBatchPageProgress)
    ? currentBatchPageProgress.find((p) => p.operation === batchType && p.status === 'running')
    : currentBatchPageProgress?.status === 'running' ? currentBatchPageProgress : null;

  // Fetch ALL page IDs (not just current page) for batch operations
  const { data: allPagesData } = usePages({ page: 1, limit: 9999 });
  const allPageRows = [...(allPagesData?.data || [])].sort((a, b) => {
    const aVal = a[orderBy] ?? 0;
    const bVal = b[orderBy] ?? 0;
    if (typeof aVal === 'string') return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const runBatchFetch = async (targetRows) => {
    setBatchRunning(true);
    setBatchType('fetch');
    cancelRef.current = false;
    setBatchCancelled(false);
    setBatchProgress({ current: 0, total: targetRows.length, currentPage: '', currentPageId: null });
    const results = { success: [], failed: [], skipped: [] };

    for (let i = 0; i < targetRows.length; i++) {
      if (cancelRef.current) { results.skipped.push(...targetRows.slice(i).map((r) => r.name)); break; }
      const row = targetRows[i];
      setBatchProgress({ current: i + 1, total: targetRows.length, currentPage: row.name, currentPageId: row.id });
      try {
        await fetchMutation.mutateAsync(row.id);
        results.success.push(row.name);
      } catch (err) {
        results.failed.push({ name: row.name, error: err.message || 'خطا' });
      }
    }

    setBatchRunning(false);
    setBatchProgress({ current: 0, total: 0, currentPage: '', currentPageId: null });
    setBatchResults({ type: 'fetch', ...results });
  };

  const runBatchProcess = async (targetRows) => {
    const services = Object.entries(processOptions).filter(([k, v]) => v && k !== 'force').map(([k]) => k);
    const force = processOptions.force;

    setBatchRunning(true);
    setBatchType('process');
    cancelRef.current = false;
    setBatchCancelled(false);
    setBatchProgress({ current: 0, total: targetRows.length, currentPage: '', currentPageId: null });
    const results = { success: [], skipped: [], failed: [] };

    for (let i = 0; i < targetRows.length; i++) {
      if (cancelRef.current) { results.skipped.push(...targetRows.slice(i).map((r) => r.name)); break; }
      const row = targetRows[i];
      setBatchProgress({ current: i + 1, total: targetRows.length, currentPage: row.name, currentPageId: row.id });
      try {
        const result = await processMutation.mutateAsync({ id: row.id, timeRange: '1w', services, force });
        if (result?.status === 'skipped') { results.skipped.push(row.name); }
        else { results.success.push(row.name); }
      } catch (err) {
        results.failed.push({ name: row.name, error: err.message || 'خطا' });
      }
    }

    setBatchRunning(false);
    setBatchProgress({ current: 0, total: 0, currentPage: '', currentPageId: null });
    setBatchResults({ type: 'process', ...results });
  };

  const handleFetchAll = () => runBatchFetch(allPageRows);
  const handleProcessAll = () => {
    setProcessDialogTarget(allPageRows);
    setProcessDialogOpen(true);
  };
  const handleFetchSelected = () => runBatchFetch(rows.filter((r) => selected.includes(r.id)));
  const handleProcessSelected = () => {
    setProcessDialogTarget(rows.filter((r) => selected.includes(r.id)));
    setProcessDialogOpen(true);
  };
  const handleCancelBatch = () => { cancelRef.current = true; setBatchCancelled(true); };
  const handleSkipCurrent = () => { /* The current request can't be cancelled, but we skip the next */ };

  const handleStartProcess = () => {
    setProcessDialogOpen(false);
    runBatchProcess(processDialogTarget);
  };

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => { setOpenAdd(false); setForm(EMPTY_FORM); },
    });
  };

  const handleQuickEdit = (row) => {
    setQuickEditRow(row);
    setQuickEditForm({
      name: row.name || '', username: row.username || '', platform: row.platform || 'instagram',
      category: row.category || '', country: row.country || '', language: row.language || '', bio: row.bio || '',
    });
  };

  const handleQuickEditSave = () => {
    updateMutation.mutate({ id: quickEditRow.id, data: quickEditForm }, {
      onSuccess: () => setQuickEditRow(null),
    });
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
      const lrows = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      }).filter((r) => r.name || r.username);
      setImportPreview(lrows);
    };
    reader.readAsText(file);
  };

  const [importResult, setImportResult] = useState(null);

  const handleBulkImport = () => {
    bulkMutation.mutate(importPreview, {
      onSuccess: (data) => {
        setOpenImport(false);
        setImportPreview([]);
        if (data?.skipped?.length > 0) {
          setImportResult(data);
        }
      },
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
          <Button variant="contained" color="warning"
            startIcon={batchRunning && batchType === 'fetch' ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:download-bold" />}
            onClick={handleFetchAll} disabled={batchRunning}
          >
            {batchRunning && batchType === 'fetch' ? `بارگیری ${batchProgress.current}/${batchProgress.total}` : `بارگیری همه (${allPagesData?.total || 0})`}
          </Button>
          <Button variant="contained" color="secondary"
            startIcon={batchRunning && batchType === 'process' ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:cpu-bolt-bold" />}
            onClick={handleProcessAll} disabled={batchRunning}
          >
            {batchRunning && batchType === 'process' ? `تحلیل ${batchProgress.current}/${batchProgress.total}` : `تحلیل همه (${allPagesData?.total || 0})`}
          </Button>
          {batchRunning && (
            <Button variant="outlined" color="error" startIcon={<Iconify icon="solar:stop-bold" />} onClick={handleCancelBatch}>
              {batchCancelled ? 'در حال توقف...' : 'لغو'}
            </Button>
          )}
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

      {/* Batch Progress */}
      {batchRunning && (
        <Card sx={{ p: 2, mb: 2, bgcolor: (theme) => alpha(theme.palette[batchType === 'fetch' ? 'warning' : 'secondary'].main, 0.08) }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress size={20} color={batchType === 'fetch' ? 'warning' : 'secondary'} />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {batchType === 'fetch' ? 'بارگیری' : 'تحلیل'}: {batchProgress.currentPage} ({batchProgress.current}/{batchProgress.total})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0} color={batchType === 'fetch' ? 'warning' : 'secondary'} sx={{ mt: 0.5, height: 6, borderRadius: 1 }} />
              </Box>
              <Button size="small" variant="outlined" color="error" onClick={handleCancelBatch} disabled={batchCancelled}>
                {batchCancelled ? 'توقف...' : 'لغو'}
              </Button>
            </Stack>
            {activeBatchProgress && (
              <Box sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <CircularProgress size={12} color="info" thickness={5} />
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, flex: 1 }} color="info.main">{activeBatchProgress.step}</Typography>
                  {activeBatchProgress.detail && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>{activeBatchProgress.detail}</Typography>}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }} color="info.main">{activeBatchProgress.percent}%</Typography>
                </Stack>
                <LinearProgress variant={activeBatchProgress.percent === 0 ? 'indeterminate' : 'determinate'} value={activeBatchProgress.percent} color="info" sx={{ height: 4, borderRadius: 1 }} />
              </Box>
            )}
          </Stack>
        </Card>
      )}

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
                    <TableCell><TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}>پیج</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={orderBy === 'category'} direction={orderBy === 'category' ? order : 'asc'} onClick={() => handleSort('category')}>دسته‌بندی</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={orderBy === 'followers_count'} direction={orderBy === 'followers_count' ? order : 'asc'} onClick={() => handleSort('followers_count')}>فالوور</TableSortLabel></TableCell>
                    <TableCell>ضربان ۷ روز</TableCell>
                    <TableCell><TableSortLabel active={orderBy === 'influence_score'} direction={orderBy === 'influence_score' ? order : 'asc'} onClick={() => handleSort('influence_score')}>نفوذ</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={orderBy === 'credibility_score'} direction={orderBy === 'credibility_score' ? order : 'asc'} onClick={() => handleSort('credibility_score')}>همراهی</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={orderBy === 'updated_at'} direction={orderBy === 'updated_at' ? order : 'asc'} onClick={() => handleSort('updated_at')}>آخرین فعالیت</TableSortLabel></TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover selected={selected.includes(row.id)} sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(paths.dashboard.instagram.pages.profile(row.id))}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(row.id)} onChange={() => handleSelect(row.id)} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={proxyImage(row.profile_image_url)} sx={{ width: 36, height: 36 }}>{row.name?.[0]}</Avatar>
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
                        <Chip
                          label={CATEGORY_LABELS[row.category] || row.category || '—'}
                          size="small"
                          variant={row.category_source === 'ai' ? 'filled' : 'outlined'}
                          color={row.category_source === 'ai' ? 'secondary' : 'default'}
                          sx={{
                            fontSize: 11,
                            ...(row.category_source === 'manual' && { borderColor: 'warning.main', borderWidth: 2 }),
                            ...(!row.category_source && !row.category && { opacity: 0.5 }),
                          }}
                          icon={row.category_source === 'ai' ? <Iconify icon="solar:cpu-bolt-bold" width={12} /> : row.category_source === 'manual' ? <Iconify icon="solar:pen-bold" width={12} /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.followers_count?.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <PulseMiniBar data={pulseData?.[row.id]} />
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
                          <Tooltip title="ویرایش سریع" arrow>
                            <IconButton size="small" onClick={() => handleQuickEdit(row)}>
                              <Iconify icon="solar:pen-bold" width={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="مشاهده پروفایل" arrow>
                            <IconButton size="small" onClick={() => router.push(paths.dashboard.instagram.pages.profile(row.id))}>
                              <Iconify icon="solar:eye-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="باز کردن در شبکه اجتماعی" arrow>
                            <IconButton size="small" component="a" target="_blank" rel="noopener noreferrer"
                              href={row.platform === 'telegram' ? `https://t.me/${row.username}` : row.platform === 'twitter' ? `https://x.com/${row.username}` : `https://instagram.com/${row.username}`}
                            >
                              <Iconify icon={PLATFORM_ICONS[row.platform] || 'mdi:web'} width={16} />
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
          <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} startIcon={<Iconify icon="solar:download-bold" />}
            onClick={handleFetchSelected} disabled={batchRunning}>
            بارگیری
          </Button>
          <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} startIcon={<Iconify icon="solar:cpu-bolt-bold" />}
            onClick={handleProcessSelected} disabled={batchRunning}>
            تحلیل
          </Button>
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
          {createMutation.isError && (
            <Typography variant="caption" color="error.main" sx={{ flex: 1, px: 2 }}>
              {createMutation.error?.message || 'خطا در ثبت پیج'}
            </Typography>
          )}
          <Button onClick={() => { setOpenAdd(false); createMutation.reset(); }}>انصراف</Button>
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

      {/* Batch Results Dialog */}
      <Dialog open={!!batchResults} onClose={() => setBatchResults(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={batchResults?.type === 'fetch' ? 'solar:download-bold-duotone' : 'solar:cpu-bolt-bold-duotone'} width={24} sx={{ color: batchResults?.type === 'fetch' ? 'warning.main' : 'secondary.main' }} />
            <span>{batchResults?.type === 'fetch' ? 'نتیجه بارگیری' : 'نتیجه تحلیل'}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {batchResults && (
            <Stack spacing={2}>
              {batchResults.success?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>✅ موفق ({batchResults.success.length})</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {batchResults.success.map((name, i) => <Chip key={i} label={name} size="small" color="success" variant="outlined" />)}
                  </Stack>
                </Box>
              )}
              {batchResults.skipped?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>⏭️ رد شد ({batchResults.skipped.length})</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {batchResults.skipped.map((name, i) => <Chip key={i} label={name} size="small" variant="outlined" />)}
                  </Stack>
                </Box>
              )}
              {batchResults.failed?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>❌ ناموفق ({batchResults.failed.length})</Typography>
                  <Stack spacing={0.5}>
                    {batchResults.failed.map((item, i) => <Chip key={i} label={`${item.name}: ${item.error}`} size="small" color="error" variant="outlined" />)}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchResults(null)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Process Options Dialog */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:cpu-bolt-bold-duotone" width={22} sx={{ color: 'secondary.main' }} />
            <span>تنظیمات تحلیل ({processDialogTarget.length} پیج)</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>سرویس‌هایی که می‌خواهید اجرا شوند را انتخاب کنید:</Typography>
          <Stack spacing={0.5}>
            <FormControlLabel control={<Checkbox checked={processOptions.transcription} onChange={(e) => setProcessOptions({ ...processOptions, transcription: e.target.checked })} />} label="🎙️ رونوشت‌برداری صوتی (Soniox)" />
            <FormControlLabel control={<Checkbox checked={processOptions.ocr} onChange={(e) => setProcessOptions({ ...processOptions, ocr: e.target.checked })} />} label="📝 استخراج متن تصویر (OCR)" />
            <FormControlLabel control={<Checkbox checked={processOptions.translation} onChange={(e) => setProcessOptions({ ...processOptions, translation: e.target.checked })} />} label="🔤 ترجمه فارسی" />
            <FormControlLabel control={<Checkbox checked={processOptions.analysis} onChange={(e) => setProcessOptions({ ...processOptions, analysis: e.target.checked })} />} label="🤖 تحلیل هوشمند (LLM)" />
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <FormControlLabel control={<Checkbox checked={processOptions.force} onChange={(e) => setProcessOptions({ ...processOptions, force: e.target.checked })} color="warning" />}
                label={<Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>⚠️ پردازش مجدد (بازنویسی نتایج قبلی)</Typography>} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" color="secondary" onClick={handleStartProcess}
            disabled={!processOptions.transcription && !processOptions.ocr && !processOptions.translation && !processOptions.analysis}>
            شروع تحلیل
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Result Dialog */}
      <Dialog open={!!importResult} onClose={() => setImportResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:upload-bold-duotone" width={24} sx={{ color: 'info.main' }} />
            <span>نتیجه ایمپورت</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {importResult && (
            <Stack spacing={2}>
              {importResult.created?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>✅ اضافه شد ({importResult.created.length})</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {importResult.created.map((p, i) => (
                      <Chip key={i} label={`@${p.username}`} size="small" color="success" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
              {importResult.skipped?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>⏭️ تکراری — رد شد ({importResult.skipped.length})</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {importResult.skipped.map((p, i) => (
                      <Chip key={i} label={`@${p.username} (${p.platform})`} size="small" color="warning" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportResult(null)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Edit Dialog */}
      <Dialog open={!!quickEditRow} onClose={() => setQuickEditRow(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:pen-bold-duotone" width={22} sx={{ color: 'warning.main' }} />
            <span>ویرایش سریع {quickEditRow?.name}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="نام پیج" value={quickEditForm.name} onChange={(e) => setQuickEditForm({ ...quickEditForm, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="یوزرنیم" value={quickEditForm.username} onChange={(e) => setQuickEditForm({ ...quickEditForm, username: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="پلتفرم" value={quickEditForm.platform} onChange={(e) => setQuickEditForm({ ...quickEditForm, platform: e.target.value })}>
                <MenuItem value="instagram">اینستاگرام</MenuItem><MenuItem value="twitter">توییتر</MenuItem><MenuItem value="telegram">تلگرام</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth size="small" label="دسته‌بندی" value={quickEditForm.category} onChange={(e) => setQuickEditForm({ ...quickEditForm, category: e.target.value })}>
                <MenuItem value="">— بدون دسته‌بندی —</MenuItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="کشور" value={quickEditForm.country} onChange={(e) => setQuickEditForm({ ...quickEditForm, country: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="زبان" value={quickEditForm.language} onChange={(e) => setQuickEditForm({ ...quickEditForm, language: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickEditRow(null)}>انصراف</Button>
          <Button variant="contained" color="warning" onClick={handleQuickEditSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
