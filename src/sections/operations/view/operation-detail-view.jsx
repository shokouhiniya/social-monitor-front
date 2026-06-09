'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalaliDate } from 'src/utils/format-jalali';

import { useMicroMediaList } from 'src/api/micro-media';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useOperation,
  useOperationMedia,
  useOperationImpact,
  useOperationOutputs,
  useAddOperationMedia,
  useAddOperationOutput,
} from 'src/api/operations';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'summary', label: 'خلاصه', icon: 'solar:document-text-bold-duotone' },
  { value: 'media', label: 'رسانه‌ها', icon: 'solar:users-group-rounded-bold-duotone' },
  { value: 'outputs', label: 'خروجی‌ها', icon: 'solar:upload-bold-duotone' },
  { value: 'impact', label: 'اثرسنجی', icon: 'solar:chart-2-bold-duotone' },
];

const STATUS = {
  draft: { label: 'پیش‌نویس', color: 'default' },
  active: { label: 'فعال', color: 'success' },
  completed: { label: 'تمام‌شده', color: 'info' },
  cancelled: { label: 'لغوشده', color: 'error' },
};

const OUTPUT_TYPES = [
  { value: 'post', label: 'پست' },
  { value: 'story', label: 'استوری' },
  { value: 'video', label: 'ویدیو' },
  { value: 'message', label: 'پیام' },
  { value: 'campaign_participation', label: 'مشارکت در کمپین' },
  { value: 'offline_action', label: 'اقدام آفلاین' },
  { value: 'other', label: 'سایر' },
];

const OUTPUT_TYPE_LABEL = Object.fromEntries(OUTPUT_TYPES.map((t) => [t.value, t.label]));
const MEDIA_STATUS = { active: 'فعال', inactive: 'غیرفعال', archived: 'بایگانی' };

const fmtNum = (n) => new Intl.NumberFormat('fa-IR').format(n ?? 0);

// ----------------------------------------------------------------------

export function OperationDetailView({ id }) {
  const [tab, setTab] = useState('summary');
  const { data: op, isLoading } = useOperation(id);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }
  if (!op) {
    return (
      <DashboardContent>
        <Typography>عملیات یافت نشد</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4">{op.title}</Typography>
          {op.goal && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{op.goal}</Typography>}
        </Box>
        <Chip label={STATUS[op.status]?.label ?? op.status} color={STATUS[op.status]?.color ?? 'default'} />
      </Stack>

      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          <Iconify icon="solar:calendar-bold-duotone" width={16} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          {op.starts_at ? toJalaliDate(op.starts_at) : '—'} تا {op.ends_at ? toJalaliDate(op.ends_at) : '—'}
        </Typography>
        {op.owner_name && (
          <Typography variant="body2">
            <Iconify icon="solar:user-bold-duotone" width={16} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            مسئول: {op.owner_name}
          </Typography>
        )}
      </Stack>

      <PageInfoBox
        title="پروندهٔ عملیات"
        icon="solar:posts-carousel-vertical-bold-duotone"
        color="secondary"
        shortDescription="مدیریت یک عملیات: انتخاب رسانه‌ها، ثبت خروجی و مشاهدهٔ اثرسنجی هدفمند."
        tips={[
          'تب «رسانه‌ها»: میکرورسانه‌های هدف، اقدام برنامه‌ریزی‌شده و عملکرد هر رسانه.',
          'تب «خروجی‌ها»: لینک، نوع و آمار خروجی (بازدید/پسند/کامنت/تعامل) را ثبت کنید.',
          'تب «اثرسنجی»: جمع‌بندی نتایج، عملکرد هر رسانه و رسانه‌های بدون خروجی.',
        ]}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} icon={<Iconify icon={t.icon} />} iconPosition="start" />
        ))}
      </Tabs>

      {tab === 'summary' && <SummaryTab op={op} />}
      {tab === 'media' && <MediaTab id={id} />}
      {tab === 'outputs' && <OutputsTab id={id} />}
      {tab === 'impact' && <ImpactTab id={id} />}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function StatCard({ label, value, color = 'text.primary' }) {
  return (
    <Card sx={{ p: 2.5, textAlign: 'center', height: '100%' }}>
      <Typography variant="h4" sx={{ color }}>{fmtNum(value)}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Card>
  );
}

function SummaryTab({ op }) {
  const cards = [
    ['میکرورسانه', op.mediaCount, 'primary.main'],
    ['تسک کل', op.taskCount, 'info.main'],
    ['تسک انجام‌شده', op.doneTaskCount, 'success.main'],
    ['خروجی', op.outputCount, 'warning.main'],
    ['مجموع بازدید', op.totalViews, 'secondary.main'],
    ['مجموع تعامل', op.totalEngagement, 'error.main'],
  ];
  return (
    <Grid container spacing={2}>
      {cards.map(([label, value, color]) => (
        <Grid key={label} size={{ xs: 6, md: 2 }}>
          <StatCard label={label} value={value} color={color} />
        </Grid>
      ))}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>توضیحات عملیات</Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {op.description || 'بدون توضیح'}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
}

// ----------------------------------------------------------------------

function MediaTab({ id }) {
  const { data: media } = useOperationMedia(id);
  const { data: allMedia } = useMicroMediaList({ pageSize: 200 });
  const addMedia = useAddOperationMedia();
  const [selected, setSelected] = useState([]);

  const rows = media ?? [];
  const existingIds = new Set(rows.map((m) => m.micro_media_id));
  const options = (allMedia?.items ?? []).filter((m) => !existingIds.has(m.id));

  const handleAdd = async () => {
    try {
      await addMedia.mutateAsync({ id, micro_media_ids: selected.map((m) => m.id) });
      setSelected([]);
      toast.success('رسانه‌ها اضافه شد');
    } catch (err) {
      toast.error(err?.message || 'افزودن با خطا مواجه شد');
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Autocomplete
          multiple
          sx={{ flex: 1 }}
          options={options}
          value={selected}
          onChange={(_, v) => setSelected(v)}
          getOptionLabel={(o) => o?.name ?? ''}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          filterSelectedOptions
          renderInput={(p) => <TextField {...p} label="افزودن میکرورسانه" placeholder="جستجو..." />}
        />
        <Button variant="contained" onClick={handleAdd} disabled={selected.length === 0 || addMedia.isPending}>
          افزودن
        </Button>
      </Stack>

      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          هنوز رسانه‌ای به این عملیات اضافه نشده است.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>میکرورسانه</TableCell>
                <TableCell>حوزهٔ فعالیت</TableCell>
                <TableCell>وضعیت رسانه</TableCell>
                <TableCell align="center">خروجی</TableCell>
                <TableCell align="center">بازدید</TableCell>
                <TableCell align="center">تعامل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{m.micro_media_name}</Typography>
                    {m.importance_level && (
                      <Typography variant="caption" color="text.secondary">{m.importance_level}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{m.activity_domain || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="soft" label={MEDIA_STATUS[m.micro_media_status] ?? m.micro_media_status ?? '—'} />
                  </TableCell>
                  <TableCell align="center">{fmtNum(m.outputCount)}</TableCell>
                  <TableCell align="center">{fmtNum(m.views)}</TableCell>
                  <TableCell align="center">{fmtNum(m.engagement)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function OutputsTab({ id }) {
  const { data: outputs } = useOperationOutputs(id);
  const { data: media } = useOperationMedia(id);
  const addOutput = useAddOperationOutput();
  const [form, setForm] = useState({
    micro_media_id: '',
    output_type: 'post',
    output_url: '',
    views: '',
    likes: '',
    comments: '',
    shares: '',
    engagement: '',
  });

  const mediaOptions = media ?? [];
  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAdd = async () => {
    try {
      await addOutput.mutateAsync({
        id,
        data: {
          micro_media_id: form.micro_media_id ? Number(form.micro_media_id) : undefined,
          output_type: form.output_type,
          output_url: form.output_url || undefined,
          views: form.views ? Number(form.views) : undefined,
          likes: form.likes ? Number(form.likes) : undefined,
          comments: form.comments ? Number(form.comments) : undefined,
          shares: form.shares ? Number(form.shares) : undefined,
          engagement: form.engagement ? Number(form.engagement) : undefined,
        },
      });
      setForm({ micro_media_id: '', output_type: 'post', output_url: '', views: '', likes: '', comments: '', shares: '', engagement: '' });
      toast.success('خروجی ثبت شد');
    } catch (err) {
      toast.error(err?.message || 'ثبت خروجی با خطا مواجه شد');
    }
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>ثبت خروجی جدید</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="میکرورسانه" value={form.micro_media_id} onChange={setField('micro_media_id')}>
              <MenuItem value="">— عمومی —</MenuItem>
              {mediaOptions.map((m) => (
                <MenuItem key={m.micro_media_id} value={m.micro_media_id}>{m.micro_media_name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="نوع خروجی" value={form.output_type} onChange={setField('output_type')}>
              {OUTPUT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="لینک خروجی" value={form.output_url} onChange={setField('output_url')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <TextField fullWidth type="number" label="بازدید" value={form.views} onChange={setField('views')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <TextField fullWidth type="number" label="پسند" value={form.likes} onChange={setField('likes')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <TextField fullWidth type="number" label="کامنت" value={form.comments} onChange={setField('comments')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <TextField fullWidth type="number" label="بازنشر" value={form.shares} onChange={setField('shares')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <TextField fullWidth type="number" label="تعامل" value={form.engagement} onChange={setField('engagement')} />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleAdd} disabled={addOutput.isPending}>ثبت خروجی</Button>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>خروجی‌های ثبت‌شده</Typography>
        {(outputs ?? []).length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>خروجی ثبت نشده است.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>میکرورسانه</TableCell>
                  <TableCell>نوع</TableCell>
                  <TableCell>لینک</TableCell>
                  <TableCell align="center">بازدید</TableCell>
                  <TableCell align="center">پسند</TableCell>
                  <TableCell align="center">کامنت</TableCell>
                  <TableCell align="center">تعامل</TableCell>
                  <TableCell>تاریخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(outputs ?? []).map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell>{o.micro_media_name || '— عمومی —'}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="soft" label={OUTPUT_TYPE_LABEL[o.output_type] ?? o.output_type} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {o.output_url ? (
                        <Typography
                          component="a"
                          href={o.output_url}
                          target="_blank"
                          rel="noopener"
                          variant="body2"
                          color="primary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {o.output_url}
                        </Typography>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="center">{fmtNum(o.views)}</TableCell>
                    <TableCell align="center">{fmtNum(o.likes)}</TableCell>
                    <TableCell align="center">{fmtNum(o.comments)}</TableCell>
                    <TableCell align="center">{fmtNum(o.engagement)}</TableCell>
                    <TableCell>{toJalaliDate(o.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ImpactTab({ id }) {
  const { data: impact } = useOperationImpact(id);

  if (!impact) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  const cards = [
    ['رسانه‌های انتخاب‌شده', impact.selectedMediaCount, 'primary.main'],
    ['رسانه‌های فعال (دارای خروجی)', impact.activeMediaCount, 'success.main'],
    ['خروجی منتشرشده', impact.outputCount, 'warning.main'],
    ['تسک انجام‌شده', impact.completedTaskCount, 'info.main'],
    ['مجموع بازدید', impact.totalViews, 'secondary.main'],
    ['مجموع تعامل', impact.totalEngagement, 'error.main'],
  ];

  return (
    <Grid container spacing={2}>
      {cards.map(([label, value, color]) => (
        <Grid key={label} size={{ xs: 6, md: 2 }}>
          <StatCard label={label} value={value} color={color} />
        </Grid>
      ))}

      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>تفکیک خروجی بر اساس نوع</Typography>
          {(impact.outputsByType ?? []).length === 0 ? (
            <Typography color="text.secondary">خروجی‌ای ثبت نشده است.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {impact.outputsByType.map((t) => (
                <Stack key={t.type} direction="row" justifyContent="space-between" alignItems="center">
                  <Chip size="small" variant="soft" label={OUTPUT_TYPE_LABEL[t.type] ?? t.type} />
                  <Typography variant="subtitle2">{fmtNum(t.count)}</Typography>
                </Stack>
              ))}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">نرخ تعامل (تعامل/بازدید)</Typography>
                <Typography variant="subtitle2">{impact.engagementRate}%</Typography>
              </Stack>
            </Stack>
          )}
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>عملکرد هر میکرورسانه</Typography>
          {(impact.mediaPerformance ?? []).length === 0 ? (
            <Typography color="text.secondary">داده‌ای برای نمایش نیست.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>میکرورسانه</TableCell>
                    <TableCell align="center">خروجی</TableCell>
                    <TableCell align="center">بازدید</TableCell>
                    <TableCell align="center">تعامل</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {impact.mediaPerformance.map((m) => (
                    <TableRow key={m.micro_media_id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell align="center">{fmtNum(m.outputCount)}</TableCell>
                      <TableCell align="center">{fmtNum(m.views)}</TableCell>
                      <TableCell align="center">{fmtNum(m.engagement)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>رسانه‌های بدون خروجی</Typography>
          {(impact.mediaWithoutOutput ?? []).length === 0 ? (
            <Typography color="text.secondary">همهٔ رسانه‌ها حداقل یک خروجی دارند.</Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {impact.mediaWithoutOutput.map((m) => (
                <Chip key={m.micro_media_id} size="small" color="warning" variant="soft" label={m.name} />
              ))}
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
