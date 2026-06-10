'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useScoreIndicators } from 'src/api/media-score';
import { usePlatformOptions } from 'src/api/definitions';
import {
  useAddScore,
  useMicroMedia,
  useCreateAccount,
  useDetachAccount,
  useSuggestProfile,
  useMicroMediaPosts,
  useMicroMediaScores,
  useMicroMediaAccounts,
  useRefreshPerformance,
  useMicroMediaInteractions,
  useAddMicroMediaInteraction,
} from 'src/api/micro-media';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'پروفایل' },
  { value: 'accounts', label: 'سکوها' },
  { value: 'scores', label: 'امتیاز رسانه' },
  { value: 'interactions', label: 'تعاملات' },
  { value: 'content', label: 'پست‌ها و تحلیل محتوا' },
];

export function MicroMediaDetailView({ id }) {
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const { data: media, isLoading } = useMicroMedia(id);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
      </DashboardContent>
    );
  }

  if (!media) {
    return (
      <DashboardContent>
        <Typography>میکرورسانه یافت نشد</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4">{media.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={media.status === 'active' ? 'فعال' : media.status} color={media.status === 'active' ? 'success' : 'default'} />
            {media.activity_domain ? <Chip size="small" label={media.activity_domain} variant="outlined" /> : null}
          </Stack>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => router.push(paths.dashboard.microMedia.edit(id))}
        >
          ویرایش
        </Button>
      </Stack>

      <PageInfoBox
        title="پروندهٔ میکرورسانه"
        icon="solar:user-id-bold-duotone"
        color="primary"
        shortDescription="نمای کامل یک میکرورسانه با تب‌های پروفایل، سکوها، امتیاز رسانه، تعاملات و تحلیل محتوا."
        tips={[
          'تب «امتیاز رسانه»: شاخص‌های انسانی دوره‌ای را ثبت و روند را دنبال کنید.',
          'تب «تعاملات»: هر تماس/جلسه را ثبت کنید تا رسانه «فعال» بماند.',
          'تب «پست‌ها و تحلیل محتوا»: پست‌های حساب‌های متصل و پیشنهاد تکمیل پروفایل.',
        ]}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
      </Tabs>

      {tab === 'profile' && <ProfileTab media={media} />}
      {tab === 'accounts' && <AccountsTab id={id} />}
      {tab === 'scores' && <ScoresTab id={id} />}
      {tab === 'interactions' && <InteractionsTab id={id} />}
      {tab === 'content' && <ContentTab id={id} />}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function ProfileTab({ media }) {
  const rows = [
    ['نام', media.name],
    ['هویت', media.identity_description],
    ['حوزه فعالیت', media.activity_domain],
    ['نام رابط', media.contact_name],
    ['شماره تماس', media.contact_phone],
    ['ایمیل', media.contact_email],
    ['کشور', media.country],
    ['زبان', media.language],
  ];
  return (
    <Card sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {rows.map(([label, val]) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography>{val || '—'}</Typography>
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
        {(media.tags ?? []).map((t) => <Chip key={t} size="small" label={t} />)}
      </Stack>
    </Card>
  );
}

function AccountsTab({ id }) {
  const { data: accounts, isLoading } = useMicroMediaAccounts(id);
  const { data: platformOptions } = usePlatformOptions();
  const refresh = useRefreshPerformance();
  const createAccount = useCreateAccount();
  const detachAccount = useDetachAccount();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', platform: '', profile_url: '', followers_count: '' });

  const options = platformOptions ?? [];
  const platformLabel = (k) => options.find((p) => p.key === k)?.label || k || '—';

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openDialog = () => {
    setForm({ name: '', username: '', platform: options[0]?.key ?? '', profile_url: '', followers_count: '' });
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!form.username && !form.name) {
      toast.error('نام یا نام کاربری سکو را وارد کنید');
      return;
    }
    try {
      await createAccount.mutateAsync({
        id,
        data: {
          name: form.name || undefined,
          username: form.username || undefined,
          platform: form.platform || undefined,
          profile_url: form.profile_url || undefined,
          followers_count: form.followers_count ? Number(form.followers_count) : undefined,
        },
      });
      toast.success('سکو اضافه شد');
      setOpen(false);
    } catch (err) {
      toast.error(err?.message || 'افزودن سکو با خطا مواجه شد');
    }
  };

  const handleRemove = async (pageId) => {
    try {
      await detachAccount.mutateAsync({ pageId });
      toast.success('سکو حذف شد');
    } catch (err) {
      toast.error(err?.message || 'حذف سکو با خطا مواجه شد');
    }
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">سکوها (حساب‌های پلتفرمی)</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => refresh.mutate(id)} disabled={refresh.isPending}>
            بروزرسانی عملکرد
          </Button>
          <Button size="small" variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openDialog}>
            افزودن سکو
          </Button>
        </Stack>
      </Stack>

      {(accounts ?? []).length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Iconify icon="solar:smartphone-bold-duotone" width={40} />
          <Typography sx={{ mt: 1 }}>هنوز سکویی اضافه نشده است. با دکمهٔ «افزودن سکو» شروع کنید.</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {(accounts ?? []).map((a) => (
            <Stack key={a.id} direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Chip size="small" label={platformLabel(a.platform)} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">{a.username || a.name}</Typography>
                {a.profile_url && (
                  <Typography
                    component="a"
                    href={a.profile_url}
                    target="_blank"
                    rel="noopener"
                    variant="caption"
                    color="primary"
                    sx={{ display: 'block' }}
                    noWrap
                  >
                    {a.profile_url}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">{a.followers_count ?? 0} دنبال‌کننده</Typography>
              {a.is_primary ? <Chip size="small" color="primary" label="اصلی" /> : null}
              <IconButton size="small" color="error" onClick={() => handleRemove(a.id)} disabled={detachAccount.isPending}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>افزودن سکو</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="پلتفرم" value={form.platform} onChange={setField('platform')} fullWidth>
              {options.map((p) => (
                <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="نام کاربری (آیدی)" value={form.username} onChange={setField('username')} fullWidth placeholder="مثلاً my_channel" />
            <TextField label="نام نمایشی" value={form.name} onChange={setField('name')} fullWidth helperText="اگر خالی بماند از نام کاربری استفاده می‌شود" />
            <TextField label="لینک پروفایل" value={form.profile_url} onChange={setField('profile_url')} fullWidth placeholder="https://..." />
            <TextField label="تعداد دنبال‌کننده" type="number" value={form.followers_count} onChange={setField('followers_count')} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createAccount.isPending}>افزودن</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function ScoresTab({ id }) {
  const { data: indicators } = useScoreIndicators();
  const { data: scores } = useMicroMediaScores(id);
  const addScore = useAddScore();
  const [indicatorId, setIndicatorId] = useState('');
  const [value, setValue] = useState('');

  const period = `${new Date().toISOString().slice(0, 7)}-01`;

  const handleAdd = async () => {
    await addScore.mutateAsync({
      id,
      data: { indicator_id: Number(indicatorId), value: Number(value), period_start: period },
    });
    setValue('');
  };

  const latestByIndicator = {};
  (scores ?? []).forEach((s) => {
    if (!latestByIndicator[s.indicator_id]) latestByIndicator[s.indicator_id] = s;
  });

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>ثبت امتیاز دوره جاری ({period})</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField select label="شاخص" value={indicatorId} onChange={(e) => setIndicatorId(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          {(indicators ?? []).map((i) => <MenuItem key={i.id} value={i.id}>{i.title}</MenuItem>)}
        </TextField>
        <TextField label="مقدار" type="number" value={value} onChange={(e) => setValue(e.target.value)} size="small" />
        <Button variant="contained" onClick={handleAdd} disabled={!indicatorId || value === '' || addScore.isPending}>ثبت</Button>
      </Stack>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>آخرین امتیازها</Typography>
      <Stack spacing={1}>
        {(indicators ?? []).map((i) => (
          <Stack key={i.id} direction="row" justifyContent="space-between" sx={{ p: 1, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography>{i.title}</Typography>
            <Typography fontWeight="bold">{latestByIndicator[i.id]?.value ?? '—'}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

function InteractionsTab({ id }) {
  const { data: interactions } = useMicroMediaInteractions(id);
  const addInteraction = useAddMicroMediaInteraction();
  const [type, setType] = useState('call');
  const [summary, setSummary] = useState('');

  const handleAdd = async () => {
    await addInteraction.mutateAsync({ id, data: { interaction_type: type, summary } });
    setSummary('');
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>ثبت تعامل جدید</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField select label="نوع" value={type} onChange={(e) => setType(e.target.value)} size="small" sx={{ minWidth: 140 }}>
          <MenuItem value="call">تماس</MenuItem>
          <MenuItem value="meeting">جلسه</MenuItem>
          <MenuItem value="message">پیام</MenuItem>
          <MenuItem value="service">خدمت</MenuItem>
          <MenuItem value="follow_up">پیگیری</MenuItem>
          <MenuItem value="other">سایر</MenuItem>
        </TextField>
        <TextField label="خلاصه" value={summary} onChange={(e) => setSummary(e.target.value)} size="small" fullWidth />
        <Button variant="contained" onClick={handleAdd} disabled={addInteraction.isPending}>ثبت</Button>
      </Stack>

      <Stack spacing={1}>
        {(interactions ?? []).length === 0 ? (
          <Typography color="text.secondary">تعاملی ثبت نشده</Typography>
        ) : (
          (interactions ?? []).map((it) => (
            <Stack key={it.id} direction="row" spacing={2} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Chip size="small" label={it.type} />
              <Typography sx={{ flex: 1 }}>{it.summary || it.note || '—'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {it.interaction_date ? new Date(it.interaction_date).toLocaleDateString('fa-IR') : ''}
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    </Card>
  );
}

function ContentTab({ id }) {
  const { data: posts, isLoading } = useMicroMediaPosts(id);
  const suggest = useSuggestProfile();
  const [suggestion, setSuggestion] = useState(null);

  const handleSuggest = async () => {
    const res = await suggest.mutateAsync(id);
    setSuggestion(res);
  };

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1">تکمیل پروفایل از ۲۰ پست آخر</Typography>
            <Typography variant="body2" color="text.secondary">
              پیشنهاد بر اساس تحلیل حساب‌های متصل. مقادیر فقط پیشنهادند و با تأیید شما اعمال می‌شوند.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleSuggest} disabled={suggest.isPending}>
            {suggest.isPending ? 'در حال تحلیل...' : 'پیشنهاد بده'}
          </Button>
        </Stack>

        {suggestion ? (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              بر اساس {suggestion.basedOnAccounts} حساب و {suggestion.basedOnPosts} پست
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">حوزه فعالیت پیشنهادی</Typography>
                <Typography>{suggestion.suggestions?.activity_domain || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">کشور / زبان</Typography>
                <Typography>{suggestion.suggestions?.country || '—'} / {suggestion.suggestions?.language || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">برچسب‌های پیشنهادی</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {(suggestion.suggestions?.tags ?? []).map((t) => <Chip key={t} size="small" label={t} />)}
                  {(suggestion.suggestions?.tags ?? []).length === 0 && <Typography>—</Typography>}
                </Stack>
              </Grid>
              {suggestion.suggestions?.identity_description ? (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">توضیح هویت پیشنهادی</Typography>
                  <Typography variant="body2">{suggestion.suggestions.identity_description}</Typography>
                </Grid>
              ) : null}
            </Grid>
          </Box>
        ) : null}
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>آخرین پست‌ها</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (posts ?? []).length === 0 ? (
          <Typography color="text.secondary">پستی برای حساب‌های متصل یافت نشد</Typography>
        ) : (
          <Stack spacing={1}>
            {(posts ?? []).map((p) => (
              <Stack key={p.id} direction="row" spacing={2} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Chip size="small" label={p.post_type || 'post'} />
                <Typography sx={{ flex: 1 }} noWrap>{p.caption_fa || p.caption || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">{p.likes_count ?? 0} ❤</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
