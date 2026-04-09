'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useActionPlans, useCreateActionPlan, useUpdateActionPlan } from 'src/api/action-plans';

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

export function ActionCards({ pageId }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 1, category: '' });

  const { data: plans, isLoading } = useActionPlans(pageId);
  const createMutation = useCreateActionPlan();
  const updateMutation = useUpdateActionPlan();

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

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">
            کارت‌های عملیاتی
          </Typography>
          <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>
            اقدام جدید
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            اقدام عملیاتی ثبت نشده
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((plan) => (
              <Box
                key={plan.id}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: plan.status === 'done' ? 'success.lighter' : 'action.hover',
                  borderRight: '4px solid',
                  borderColor: `${PRIORITY_COLORS[plan.priority] || 'default'}.main`,
                  opacity: plan.status === 'done' || plan.status === 'cancelled' ? 0.6 : 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={PRIORITY_LABELS[plan.priority]} size="small" color={PRIORITY_COLORS[plan.priority]} />
                      <Chip label={STATUS_LABELS[plan.status]} size="small" color={STATUS_COLORS[plan.status]} variant="outlined" />
                      {plan.category && (
                        <Chip
                          label={CATEGORY_OPTIONS.find((c) => c.value === plan.category)?.label || plan.category}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {plan.is_ai_generated && (
                        <Chip label="AI" size="small" color="secondary" />
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{plan.title}</Typography>
                    {plan.description && (
                      <Typography variant="caption" color="text.secondary">{plan.description}</Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {plan.status === 'todo' && (
                      <IconButton size="small" onClick={() => handleStatusChange(plan.id, 'in_progress')} title="شروع">
                        <Iconify icon="eva:play-circle-fill" />
                      </IconButton>
                    )}
                    {plan.status === 'in_progress' && (
                      <IconButton size="small" onClick={() => handleStatusChange(plan.id, 'done')} title="تکمیل">
                        <Iconify icon="eva:checkmark-circle-2-fill" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>اقدام عملیاتی جدید</DialogTitle>
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
