'use client';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useOperations } from 'src/api/operations';
import { useMicroMediaList } from 'src/api/micro-media';
import { useHubs, useAssignableUsers } from 'src/api/hubs';
import {
  useCreateTask,
  useUpdateTask,
  useSetTaskTags,
  useChangeTaskStatus,
} from 'src/api/tasks';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'کم', color: 'default' },
  { value: 'normal', label: 'عادی', color: 'info' },
  { value: 'high', label: 'زیاد', color: 'warning' },
  { value: 'urgent', label: 'فوری', color: 'error' },
];

export const STATUS_OPTIONS = [
  { value: 'open', label: 'باز', color: 'info' },
  { value: 'in_progress', label: 'در حال انجام', color: 'warning' },
  { value: 'done', label: 'انجام‌شده', color: 'success' },
  { value: 'cancelled', label: 'لغوشده', color: 'default' },
];

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function TaskFormDialog({ open, onClose, task }) {
  const isEdit = !!task;
  const { data: hubs } = useHubs();
  const { data: users } = useAssignableUsers();
  const { data: mediaPage } = useMicroMediaList({ pageSize: 200 });
  const { data: opsPage } = useOperations();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();
  const setTags = useSetTaskTags();

  const [form, setForm] = useState(null);
  const [media, setMedia] = useState(null);
  const [tags, setTagsState] = useState([]);

  const mediaOptions = mediaPage?.items ?? [];
  const opsOptions = opsPage?.items ?? [];

  useEffect(() => {
    if (!open) return;
    setForm({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'normal',
      status: task?.status ?? 'open',
      assignee_user_id: task?.assignee_user_id ? String(task.assignee_user_id) : '',
      hub_id: task?.hub_id ? String(task.hub_id) : '',
      operation_id: task?.operation_id ? String(task.operation_id) : '',
      due_date: toDateInput(task?.due_date),
    });
    setTagsState(task?.tags ?? []);
    setMedia(
      task?.micro_media_id
        ? { id: task.micro_media_id, name: task.micro_media_name ?? `#${task.micro_media_id}` }
        : null
    );
  }, [open, task]);

  if (!form) return null;

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const hasContext = !!(form.hub_id || media || form.operation_id);
  const canSubmit = !!form.title && hasContext;
  const pending =
    createTask.isPending || updateTask.isPending || changeStatus.isPending || setTags.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const payload = {
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      assignee_user_id: form.assignee_user_id ? Number(form.assignee_user_id) : undefined,
      hub_id: form.hub_id ? Number(form.hub_id) : undefined,
      micro_media_id: media ? media.id : undefined,
      operation_id: form.operation_id ? Number(form.operation_id) : undefined,
      due_date: form.due_date || undefined,
    };
    try {
      if (isEdit) {
        await updateTask.mutateAsync({ id: task.id, data: payload });
        if (form.status !== task.status) {
          await changeStatus.mutateAsync({ id: task.id, status: form.status });
        }
        await setTags.mutateAsync({ id: task.id, tags });
        toast.success('تسک به‌روزرسانی شد');
      } else {
        await createTask.mutateAsync({ ...payload, tags });
        toast.success('تسک ایجاد شد');
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || 'عملیات با خطا مواجه شد');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'ویرایش تسک' : 'تسک جدید'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField label="عنوان *" value={form.title} onChange={setField('title')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="اولویت" value={form.priority} onChange={setField('priority')} fullWidth>
              {PRIORITY_OPTIONS.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="توضیحات" value={form.description} onChange={setField('description')} fullWidth multiline rows={2} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="مسئول (کارشناس)" value={form.assignee_user_id} onChange={setField('assignee_user_id')} fullWidth>
              <MenuItem value="">— تعیین‌نشده —</MenuItem>
              {(users ?? []).map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="سررسید"
              type="date"
              value={form.due_date}
              onChange={setField('due_date')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {isEdit && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="وضعیت" value={form.status} onChange={setField('status')} fullWidth>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Alert severity={hasContext ? 'success' : 'info'} variant="outlined" sx={{ py: 0.5 }}>
              تسک باید حداقل به یکی از این‌ها متصل باشد: هاب، میکرورسانه یا عملیات.
            </Alert>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="هاب" value={form.hub_id} onChange={setField('hub_id')} fullWidth>
              <MenuItem value="">—</MenuItem>
              {(hubs ?? []).map((h) => (
                <MenuItem key={h.id} value={String(h.id)}>{h.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              options={mediaOptions}
              value={media}
              onChange={(_, v) => setMedia(v)}
              getOptionLabel={(o) => o?.name ?? ''}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(p) => <TextField {...p} label="میکرورسانه" placeholder="جستجو..." />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="عملیات" value={form.operation_id} onChange={setField('operation_id')} fullWidth>
              <MenuItem value="">—</MenuItem>
              {opsOptions.map((o) => (
                <MenuItem key={o.id} value={String(o.id)}>{o.title}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={tags}
              onChange={(_, v) => setTagsState(v)}
              renderInput={(p) => <TextField {...p} label="برچسب‌ها" placeholder="برچسب بنویسید و Enter بزنید" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || pending}>
          {isEdit ? 'ذخیره' : 'ایجاد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
