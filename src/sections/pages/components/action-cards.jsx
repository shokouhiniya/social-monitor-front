'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalali } from 'src/utils/format-jalali';

import { useActionPlans, useCreateActionPlan, useUpdateActionPlan, useDeleteActionPlan, useCreateInteraction } from 'src/api/action-plans';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PRIORITY_LABELS = { 0: 'پایین', 1: 'متوسط', 2: 'بالا', 3: 'فوری' };
const PRIORITY_COLORS = { 0: 'default', 1: 'info', 2: 'warning', 3: 'error' };
const STATUS_LABELS = { todo: 'انجام نشده', in_progress: 'در حال انجام', done: 'انجام شده', cancelled: 'لغو شده' };
const STATUS_COLORS = { todo: 'default', in_progress: 'info', done: 'success', cancelled: 'error' };

const CATEGORY_OPTIONS = [
  { value: 'reply_comments', label: 'پاسخ به کامنت‌ها' },
  { value: 'change_bio', label: 'تغییر بیو' },
  { value: 'publish_post', label: 'انتشار پست' },
  { value: 'publish_story', label: 'انتشار استوری' },
  { value: 'engage_audience', label: 'تعامل با مخاطب' },
  { value: 'content_strategy', label: 'استراتژی محتوا' },
  { value: 'other', label: 'سایر' },
];

const CONTACT_TYPES = {
  direct: { label: 'دایرکت', icon: 'solar:chat-round-dots-bold', color: 'primary' },
  phone: { label: 'تماس تلفنی', icon: 'solar:phone-bold', color: 'info' },
  meeting: { label: 'جلسه', icon: 'solar:users-group-rounded-bold', color: 'success' },
  email: { label: 'ایمیل', icon: 'solar:letter-bold', color: 'warning' },
  comment: { label: 'کامنت', icon: 'solar:chat-line-bold', color: 'secondary' },
};

// ----------------------------------------------------------------------

function InteractionRow({ item }) {
  const typeConf = CONTACT_TYPES[item.type] || CONTACT_TYPES.direct;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={(theme) => ({
        p: 1,
        borderRadius: 0.75,
        bgcolor: alpha(theme.palette.grey[500], 0.04),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
      })}
    >
      <Box
        sx={(theme) => ({
          width: 26,
          height: 26,
          borderRadius: 0.75,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette[typeConf.color].main, 0.1),
        })}
      >
        <Iconify icon={typeConf.icon} width={14} sx={{ color: `${typeConf.color}.main` }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10 }}>{typeConf.label}</Typography>
          <Chip
            label={item.result === 'success' ? 'موفق' : 'ناموفق'}
            size="small"
            color={item.result === 'success' ? 'success' : 'error'}
            variant="outlined"
            sx={{ height: 16, fontSize: 9 }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{item.responsible}</Typography>
        </Stack>
        {item.note && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{item.note}</Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, flexShrink: 0 }}>
        {toJalali(item.created_at)}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ActionPlanCard({ plan, onStatusChange, onDelete, pageId }) {
  const [expanded, setExpanded] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ type: 'direct', result: 'success', responsible: '', note: '' });
  const createInteraction = useCreateInteraction();

  const interactions = plan.interactions || [];
  const pColor = PRIORITY_COLORS[plan.priority] || 'default';

  const handleCreateInteraction = () => {
    createInteraction.mutate(
      { ...interactionForm, page_id: Number(pageId), action_plan_id: plan.id },
      {
        onSuccess: () => {
          setInteractionOpen(false);
          setInteractionForm({ type: 'direct', result: 'success', responsible: '', note: '' });
        },
      }
    );
  };

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 1.5,
        bgcolor: plan.status === 'done' ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.grey[500], 0.02),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        borderRight: `4px solid ${theme.palette[pColor]?.main || theme.palette.grey[400]}`,
        opacity: plan.status === 'done' || plan.status === 'cancelled' ? 0.7 : 1,
        transition: 'all 0.2s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3) },
      })}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
            <Chip label={PRIORITY_LABELS[plan.priority]} size="small" color={pColor} />
            <Chip label={STATUS_LABELS[plan.status]} size="small" color={STATUS_COLORS[plan.status]} variant="outlined" />
            {plan.category && (
              <Chip
                label={CATEGORY_OPTIONS.find((c) => c.value === plan.category)?.label || plan.category}
                size="small"
                variant="outlined"
              />
            )}
            {plan.is_ai_generated && <Chip label="AI" size="small" color="secondary" />}
            {plan.alert && (
              <Chip
                label={`هشدار: ${plan.alert.title?.substring(0, 20)}...`}
                size="small"
                variant="outlined"
                color="warning"
                icon={<Iconify icon="solar:danger-triangle-bold" width={12} />}
              />
            )}
          </Box>
          <Typography variant="body2" fontWeight="bold">{plan.title}</Typography>
          {plan.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{plan.description}</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {plan.status === 'todo' && (
            <IconButton size="small" onClick={() => onStatusChange(plan.id, 'in_progress')} title="شروع">
              <Iconify icon="eva:play-circle-fill" />
            </IconButton>
          )}
          {plan.status === 'in_progress' && (
            <IconButton size="small" onClick={() => onStatusChange(plan.id, 'done')} title="تکمیل">
              <Iconify icon="eva:checkmark-circle-2-fill" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => setConfirmDelete(true)} title="حذف" sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Interactions toggle */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="text"
          onClick={() => setExpanded(!expanded)}
          startIcon={<Iconify icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={14} />}
          sx={{ fontSize: 11, color: 'text.secondary' }}
        >
          تعاملات ({interactions.length})
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setInteractionOpen(true)}
          startIcon={<Iconify icon="solar:add-circle-bold" width={14} />}
          sx={{ fontSize: 10, py: 0.25 }}
        >
          ثبت تعامل
        </Button>
      </Stack>

      {/* Nested Interactions */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 1.5, pl: 1, borderRight: '2px solid', borderColor: 'divider', pr: 0 }}>
          {interactions.length === 0 ? (
            <Typography variant="caption" color="text.disabled" sx={{ py: 1, display: 'block' }}>
              تعاملی ثبت نشده
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {interactions.map((item) => (
                <InteractionRow key={item.id} item={item} />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>

      {/* Add Interaction Dialog */}
      <Dialog open={interactionOpen} onClose={() => setInteractionOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontSize: 14 }}>ثبت تعامل برای: {plan.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth size="small" label="نوع تماس" value={interactionForm.type} onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}>
              {Object.entries(CONTACT_TYPES).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="نتیجه" value={interactionForm.result} onChange={(e) => setInteractionForm({ ...interactionForm, result: e.target.value })}>
              <MenuItem value="success">موفق</MenuItem>
              <MenuItem value="failed">ناموفق</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="مسئول" value={interactionForm.responsible} onChange={(e) => setInteractionForm({ ...interactionForm, responsible: e.target.value })} />
            <TextField fullWidth size="small" label="یادداشت" multiline rows={2} value={interactionForm.note} onChange={(e) => setInteractionForm({ ...interactionForm, note: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInteractionOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreateInteraction} disabled={!interactionForm.responsible || !interactionForm.note || createInteraction.isPending}>
            {createInteraction.isPending ? <CircularProgress size={16} /> : 'ثبت'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontSize: 14 }}>حذف عملیات</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            آیا از حذف عملیات «{plan.title}» اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>انصراف</Button>
          <Button variant="contained" color="error" onClick={() => { onDelete(plan.id); setConfirmDelete(false); }}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function ActionCards({ pageId }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 1, category: '' });

  const { data: plans, isLoading } = useActionPlans(pageId);
  const createMutation = useCreateActionPlan();
  const updateMutation = useUpdateActionPlan();
  const deleteMutation = useDeleteActionPlan();

  const items = plans || [];

  const handleCreate = () => {
    createMutation.mutate(
      { ...form, page_id: Number(pageId) },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: '', description: '', priority: 1, category: '' });
        },
      }
    );
  };

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:clipboard-check-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>عملیات و تعاملات</Typography>
          <Chip label={items.length} size="small" color="primary" variant="outlined" />
        </Stack>
        <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>
          عملیات جدید
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={(theme) => ({ p: 3, textAlign: 'center', borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}` })}>
          <Iconify icon="solar:clipboard-remove-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">عملیاتی ثبت نشده</Typography>
          <Typography variant="caption" color="text.disabled">از اینجا یا از صفحه هشدارهای استراتژیک عملیات تعریف کنید</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {items.map((plan) => (
            <ActionPlanCard key={plan.id} plan={plan} onStatusChange={handleStatusChange} onDelete={handleDelete} pageId={pageId} />
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>عملیات جدید</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="عنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            size="small"
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="توضیحات"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              fullWidth
              label="اولویت"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              size="small"
            >
              <MenuItem value={0}>پایین</MenuItem>
              <MenuItem value={1}>متوسط</MenuItem>
              <MenuItem value={2}>بالا</MenuItem>
              <MenuItem value={3}>فوری</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="دسته‌بندی"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              size="small"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title || createMutation.isPending}>
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
