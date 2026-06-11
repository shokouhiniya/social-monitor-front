'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useHubs } from 'src/api/hubs';
import { useClusters } from 'src/api/clusters';
import { useDefinitions, usePlatformOptions } from 'src/api/definitions';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  useMicroMedia,
  useCreateMicroMedia,
  useUpdateMicroMedia,
} from 'src/api/micro-media';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from 'src/sections/dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const EMPTY = {
  name: '',
  hub_id: '',
  identity_title: '',
  topic_cluster_id: '',
  activity_domain: '',
  identity_description: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  country: '',
  language: '',
  tagsText: '',
};

const emptyAccount = (primary = false, firstPlatform = '') => ({ platform: firstPlatform, username: '', name: '', is_primary: primary });

export function MicroMediaCreateView({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const { data: existing } = useMicroMedia(id);
  const { data: hubs } = useHubs();
  const { data: clusters } = useClusters();
  const { data: identities } = useDefinitions('identity');
  const { data: platformOptions } = usePlatformOptions();
  const createMutation = useCreateMicroMedia();
  const updateMutation = useUpdateMicroMedia();

  const [form, setForm] = useState(EMPTY);
  const [accounts, setAccounts] = useState([emptyAccount(true)]);

  // اولین پلتفرم تعریف‌شده (برای مقدار پیش‌فرض سکوی جدید)
  const firstPlatformKey = platformOptions?.[0]?.key ?? '';

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name ?? '',
        hub_id: existing.hub_id ?? '',
        identity_title: existing.identity_title ?? '',
        topic_cluster_id: existing.topic_cluster_id ?? '',
        activity_domain: existing.activity_domain ?? '',
        identity_description: existing.identity_description ?? '',
        contact_name: existing.contact_name ?? '',
        contact_phone: existing.contact_phone ?? '',
        contact_email: existing.contact_email ?? '',
        country: existing.country ?? '',
        language: existing.language ?? '',
        tagsText: (existing.tags ?? []).join('، '),
      });
    }
  }, [isEdit, existing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // --- account row helpers (create mode only) ---
  const setAccount = (idx, key, value) =>
    setAccounts((arr) => arr.map((a, i) => (i === idx ? { ...a, [key]: value } : a)));
  const addAccount = () => setAccounts((arr) => [...arr, emptyAccount(arr.length === 0, firstPlatformKey)]);
  const removeAccount = (idx) => setAccounts((arr) => arr.filter((_, i) => i !== idx));
  const setPrimary = (idx) => setAccounts((arr) => arr.map((a, i) => ({ ...a, is_primary: i === idx })));

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      hub_id: form.hub_id || undefined,
      identity_title: form.identity_title || undefined,
      topic_cluster_id: form.topic_cluster_id ? Number(form.topic_cluster_id) : undefined,
      activity_domain: form.activity_domain || undefined,
      identity_description: form.identity_description || undefined,
      contact_name: form.contact_name || undefined,
      contact_phone: form.contact_phone || undefined,
      contact_email: form.contact_email || undefined,
      country: form.country || undefined,
      language: form.language || undefined,
    };
    const tags = form.tagsText
      ? form.tagsText.split(/[،,]/).map((t) => t.trim()).filter(Boolean)
      : undefined;

    if (isEdit) {
      await updateMutation.mutateAsync({ id, data: payload });
      router.push(paths.dashboard.microMedia.detail(id));
    } else {
      const cleanAccounts = accounts
        .filter((a) => (a.username ?? '').trim() || (a.name ?? '').trim())
        .map((a) => ({
          platform: a.platform || undefined,
          username: a.username?.trim() || undefined,
          name: a.name?.trim() || undefined,
          is_primary: !!a.is_primary,
        }));
      const created = await createMutation.mutateAsync({
        ...payload,
        tags,
        accounts: cleanAccounts.length ? cleanAccounts : undefined,
      });
      router.push(paths.dashboard.microMedia.detail(created.id));
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? 'ویرایش میکرورسانه' : 'میکرورسانه جدید'}
      </Typography>

      <PageInfoBox
        title={isEdit ? 'ویرایش میکرورسانه' : 'ثبت میکرورسانه جدید'}
        icon="solar:user-plus-bold-duotone"
        color="primary"
        shortDescription="اطلاعات پایه، تماس و هویتی میکرورسانه را وارد کنید. لازم نیست همهٔ فیلدها را همان ابتدا پر کنید؛ بعداً قابل تکمیل‌اند."
        tips={[
          'فقط «نام» اجباری است.',
          'هویت و خوشه را از لیست تعاریف انتخاب کنید.',
          'هاب را انتخاب کنید تا میکرورسانه در ساختار مدیریتی درست قرار گیرد.',
          'برچسب‌ها را با ویرگول (،) جدا کنید.',
        ]}
      />

      {/* --- اطلاعات پایه --- */}
      <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>اطلاعات پایه</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="نام *" value={form.name} onChange={set('name')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="هاب" value={form.hub_id} onChange={set('hub_id')} fullWidth>
              <MenuItem value="">—</MenuItem>
              {(hubs ?? []).map((h) => (
                <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="حوزه فعالیت" value={form.activity_domain} onChange={set('activity_domain')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="برچسب‌ها (با ، جدا کنید)"
              value={form.tagsText}
              onChange={set('tagsText')}
              fullWidth
              disabled={isEdit}
              helperText={isEdit ? 'برچسب‌ها از تب «برچسب‌ها» در صفحه جزئیات ویرایش می‌شوند' : ''}
            />
          </Grid>
        </Grid>
      </Card>

      {/* --- هویت و خوشه --- */}
      <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>هویت و خوشه</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          هویت و خوشه موضوعی میکرورسانه را از لیست تعریف‌شده انتخاب کنید.
          این دو فیلد برای دسته‌بندی، فیلتر داشبورد و انتخاب نماینده استفاده می‌شوند.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="هویت"
              value={form.identity_title}
              onChange={set('identity_title')}
              fullWidth
              helperText="نوع/کیستی میکرورسانه (ژورنالیست، بلاگر، روحانی، اینفلوئنسر...)"
            >
              <MenuItem value="">— انتخاب نشده —</MenuItem>
              {(identities ?? []).map((i) => (
                <MenuItem key={i.id} value={i.title}>{i.title}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="خوشه موضوعی"
              value={form.topic_cluster_id}
              onChange={set('topic_cluster_id')}
              fullWidth
              helperText="گروه موضوعی که این میکرورسانه در آن قرار می‌گیرد"
            >
              <MenuItem value="">— انتخاب نشده —</MenuItem>
              {(clusters ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="توضیح هویت"
              value={form.identity_description}
              onChange={set('identity_description')}
              fullWidth
              multiline
              rows={2}
              helperText="توضیح تکمیلی درباره هویت این میکرورسانه (اختیاری)"
            />
          </Grid>
        </Grid>
      </Card>

      {/* --- اطلاعات تماس --- */}
      <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>اطلاعات تماس و جمعیتی</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="نام رابط" value={form.contact_name} onChange={set('contact_name')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="شماره تماس" value={form.contact_phone} onChange={set('contact_phone')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="ایمیل" value={form.contact_email} onChange={set('contact_email')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="کشور" value={form.country} onChange={set('country')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="زبان" value={form.language} onChange={set('language')} fullWidth />
          </Grid>
        </Grid>
      </Card>

      {/* --- سکوها (فقط در حالت ساخت) --- */}
      {!isEdit && (
        <Card sx={{ p: 3, mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="subtitle1">سکوها (حساب‌های پلتفرمی)</Typography>
              <Typography variant="caption" color="text.secondary">
                اختیاری. حساب‌های هر پلتفرم را همین‌جا تعریف کنید؛ بعداً هم از تب «سکوها» قابل افزودن‌اند.
              </Typography>
            </Box>
            <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} onClick={addAccount}>
              افزودن سکو
            </Button>
          </Stack>
          <Stack spacing={2}>
            {accounts.map((acc, idx) => (
              <Grid container spacing={2} key={idx} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    select label="پلتفرم" value={acc.platform}
                    onChange={(e) => setAccount(idx, 'platform', e.target.value)}
                    fullWidth size="small"
                  >
                    {(platformOptions ?? []).map((p) => (
                      <MenuItem key={p.key} value={p.key}>{p.label || p.key}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="یوزرنیم / آیدی" value={acc.username}
                    onChange={(e) => setAccount(idx, 'username', e.target.value)}
                    fullWidth size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="نام نمایشی (اختیاری)" value={acc.name}
                    onChange={(e) => setAccount(idx, 'name', e.target.value)}
                    fullWidth size="small"
                  />
                </Grid>
                <Grid size={{ xs: 8, sm: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={!!acc.is_primary} onChange={() => setPrimary(idx)} size="small" />}
                    label="اصلی"
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 1 }} sx={{ textAlign: 'right' }}>
                  <IconButton color="error" onClick={() => removeAccount(idx)} disabled={accounts.length === 1}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Card>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button color="inherit" onClick={() => router.back()}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.name || busy}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد'}
        </Button>
      </Stack>
    </DashboardContent>
  );
}
