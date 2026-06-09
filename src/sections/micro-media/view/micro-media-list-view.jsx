'use client';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useHubs } from 'src/api/hubs';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useMicroMediaList,
  useDeleteMicroMedia,
  useBulkCreateMicroMedia,
} from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 180;

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

function isStale(value) {
  if (!value) return true;
  return Date.now() - new Date(value).getTime() > SIX_MONTHS_MS;
}

// ----------------------------------------------------------------------
// ایمپورت گروهی: قالب CSV با ستون‌های میکرورسانه + تا ۲ سکو (پلتفرم/یوزرنیم).
// ----------------------------------------------------------------------

const TEMPLATE_HEADERS = [
  'name',
  'activity_domain',
  'country',
  'language',
  'contact_name',
  'contact_phone',
  'tags',
  'account1_platform',
  'account1_username',
  'account2_platform',
  'account2_username',
];

function parseCsvLine(line) {
  // پشتیبانی ساده از مقادیر داخل گیومه که حاوی کاما هستند.
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function rowToPayload(obj) {
  const accounts = [];
  for (const n of [1, 2, 3]) {
    const username = obj[`account${n}_username`];
    const platform = obj[`account${n}_platform`];
    if (username || platform) {
      accounts.push({
        username: username || undefined,
        platform: platform || undefined,
        is_primary: n === 1,
      });
    }
  }
  const tags = obj.tags
    ? obj.tags.split(/[،;|]/).map((t) => t.trim()).filter(Boolean)
    : undefined;
  return {
    name: obj.name,
    activity_domain: obj.activity_domain || undefined,
    country: obj.country || undefined,
    language: obj.language || undefined,
    contact_name: obj.contact_name || undefined,
    contact_phone: obj.contact_phone || undefined,
    tags,
    accounts: accounts.length ? accounts : undefined,
  };
}

// ----------------------------------------------------------------------

export function MicroMediaListView() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [search, setSearch] = useState('');
  const [hubId, setHubId] = useState('');
  const [recent, setRecent] = useState('');

  const [openImport, setOpenImport] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = {};
  if (search) params.search = search;
  if (hubId) params.hubId = hubId;
  if (recent === 'active') params.hasRecentInteraction = 'true';
  if (recent === 'inactive') params.noInteractionSince = new Date(Date.now() - SIX_MONTHS_MS).toISOString();

  const { data, isLoading } = useMicroMediaList(params);
  const { data: hubs } = useHubs();
  const bulkMutation = useBulkCreateMicroMedia();
  const deleteMutation = useDeleteMicroMedia();

  const items = data?.items ?? [];

  // --- bulk import handlers ---

  const handleDownloadTemplate = () => {
    const header = TEMPLATE_HEADERS.join(',');
    const example = [
      'خبرگزاری نمونه',
      'خبری',
      'ایران',
      'فارسی',
      'علی رضایی',
      '09120000000',
      'خبر،سیاسی',
      'instagram',
      'sample_page',
      'telegram',
      'sample_channel',
    ].join(',');
    const csv = `${header}\n${example}`;
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'micro_media_template.csv';
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
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setImportPreview([]);
        return;
      }
      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map((line) => {
        const vals = parseCsvLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return rowToPayload(obj);
      }).filter((r) => r.name);
      setImportPreview(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    bulkMutation.mutate(importPreview, {
      onSuccess: (res) => {
        setOpenImport(false);
        setImportPreview([]);
        setImportResult(res);
      },
    });
  };

  const handleCloseImport = () => {
    setOpenImport(false);
    setImportPreview([]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }} flexWrap="wrap" gap={1}>
        <Typography variant="h4">میکرورسانه‌ها</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:file-download-bold" />}
            onClick={handleDownloadTemplate}
          >
            دانلود قالب
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<Iconify icon="solar:upload-bold" />}
            onClick={() => setOpenImport(true)}
          >
            ایمپورت گروهی
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.microMedia.new)}
          >
            میکرورسانه جدید
          </Button>
        </Stack>
      </Stack>

      <PageInfoBox
        title="میکرورسانه‌ها"
        icon="solar:users-group-rounded-bold-duotone"
        color="primary"
        shortDescription="واحد مرکزی سامانه. هر میکرورسانه می‌تواند چند حساب در سکوهای مختلف (اینستاگرام، تلگرام، ایتا، روبیکا...) داشته باشد و با امتیاز انسانی، تعاملات و عملیات مدیریت می‌شود."
        modules={[
          { name: 'ثبت و ویرایش', icon: 'solar:add-circle-bold-duotone', color: 'primary', description: 'میکرورسانه را با اطلاعات هویتی، تماس و هاب ثبت کنید و همان لحظه سکوها را تعریف کنید.' },
          { name: 'ایمپورت گروهی', icon: 'solar:upload-bold-duotone', color: 'info', description: 'با دانلود قالب CSV و پر کردن آن، چند میکرورسانه را همراه سکوهایشان یک‌جا اضافه کنید. قبل از ثبت پیش‌نمایش می‌بینید.' },
          { name: 'امتیاز رسانه', icon: 'solar:star-shine-bold-duotone', color: 'warning', description: 'شاخص‌های انسانی را دوره‌ای ثبت کنید؛ میانگین امتیاز در همین جدول دیده می‌شود.' },
          { name: 'تعاملات', icon: 'solar:chat-round-dots-bold-duotone', color: 'success', description: 'هر تماس/جلسه/خدمت را ثبت کنید. رسانه با حداقل یک تعامل در ۶ ماه، «فعال» محسوب می‌شود.' },
        ]}
        tips={[
          'ستون «آخرین تعامل» اگر قرمز باشد یعنی بیش از ۶ ماه تعاملی ثبت نشده.',
          'از منوی عملیات هر ردیف می‌توانید مشاهده، ویرایش یا حذف کنید.',
        ]}
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="جستجو (نام / تماس)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            select
            label="هاب"
            value={hubId}
            onChange={(e) => setHubId(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">همه</MenuItem>
            {(hubs ?? []).map((h) => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="تعامل"
            value={recent}
            onChange={(e) => setRecent(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="active">دارای تعامل اخیر</MenuItem>
            <MenuItem value="inactive">بدون تعامل ۶ ماه</MenuItem>
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
                  <TableCell>حوزه فعالیت</TableCell>
                  <TableCell align="center">سکوها</TableCell>
                  <TableCell align="center">امتیاز</TableCell>
                  <TableCell>آخرین تعامل</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>برچسب‌ها</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.name}</TableCell>
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
                    <TableCell align="center">
                      {m.scoredIndicators > 0 ? (
                        <Tooltip title={`${m.scoredIndicators} شاخص امتیازدهی‌شده`}>
                          <Chip
                            size="small"
                            variant="soft"
                            color="warning"
                            label={`${m.scoreAvg ?? '—'} (${m.scoredIndicators}/۷)`}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">بدون امتیاز</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.lastInteractionAt ? (
                        <Tooltip title={`${m.interactionsCount} تعامل ثبت‌شده`}>
                          <Typography variant="body2" color={isStale(m.lastInteractionAt) ? 'error.main' : 'text.primary'}>
                            {formatDate(m.lastInteractionAt)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="error.main">بدون تعامل</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={m.status === 'active' ? 'فعال' : m.status === 'archived' ? 'بایگانی' : m.status}
                        color={m.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {(m.tags ?? []).slice(0, 3).map((t) => (
                        <Chip key={t} size="small" label={t} sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="مشاهده">
                          <IconButton size="small" color="default" onClick={() => router.push(paths.dashboard.microMedia.detail(m.id))}>
                            <Iconify icon="solar:eye-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ویرایش">
                          <IconButton size="small" color="primary" onClick={() => router.push(paths.dashboard.microMedia.edit(m.id))}>
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* --- Import dialog --- */}
      <Dialog open={openImport} onClose={handleCloseImport} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:upload-bold-duotone" width={24} sx={{ color: 'info.main' }} />
            <span>ایمپورت گروهی میکرورسانه از CSV</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {importPreview.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Iconify icon="solar:file-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ابتدا قالب را دانلود و پر کنید، سپس فایل CSV را انتخاب کنید. هر ردیف یک میکرورسانه و تا ۳ سکو.
              </Typography>
              <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFileUpload} />
              <Button variant="outlined" startIcon={<Iconify icon="solar:upload-bold" />} onClick={() => fileRef.current?.click()}>
                انتخاب فایل
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                پیش‌نمایش ({importPreview.length} میکرورسانه)
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>نام</TableCell>
                      <TableCell>حوزه</TableCell>
                      <TableCell>کشور</TableCell>
                      <TableCell align="center">سکوها</TableCell>
                      <TableCell>برچسب‌ها</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.activity_domain || '—'}</TableCell>
                        <TableCell>{row.country || '—'}</TableCell>
                        <TableCell align="center">
                          {(row.accounts ?? []).length === 0 ? '—' : (row.accounts ?? []).map((a, i) => (
                            <Chip key={i} size="small" sx={{ mr: 0.5 }} label={`${a.platform || '?'}: ${a.username || ''}`} />
                          ))}
                        </TableCell>
                        <TableCell>
                          {(row.tags ?? []).map((t) => <Chip key={t} size="small" sx={{ mr: 0.5 }} label={t} />)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseImport}>انصراف</Button>
          {importPreview.length > 0 && (
            <Button
              variant="contained"
              onClick={handleConfirmImport}
              disabled={bulkMutation.isPending}
              startIcon={bulkMutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:check-circle-bold" />}
            >
              تایید و افزودن {importPreview.length} مورد
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --- Import result dialog --- */}
      <Dialog open={!!importResult} onClose={() => setImportResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle>نتیجه ایمپورت</DialogTitle>
        <DialogContent>
          {importResult && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                  ✅ اضافه شد ({importResult.created?.length ?? 0})
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {(importResult.created ?? []).map((m) => (
                    <Chip key={m.id} label={m.name} size="small" color="success" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              {(importResult.skipped ?? []).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                    ⏭️ رد شد ({importResult.skipped.length})
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {importResult.skipped.map((s, i) => (
                      <Chip key={i} label={`${s.name || '—'} (${s.reason})`} size="small" color="warning" variant="outlined" />
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

      {/* --- Delete confirm dialog --- */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>حذف میکرورسانه</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            «{deleteTarget?.name}» بایگانی می‌شود (داده‌ها حفظ می‌شوند ولی از فهرست فعال خارج می‌شود). ادامه می‌دهید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleteTarget(null)}>انصراف</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : <Iconify icon="solar:trash-bin-trash-bold" />}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
