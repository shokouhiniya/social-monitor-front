'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useFieldReports, useCreateFieldReport } from 'src/api/field-reports';

// ----------------------------------------------------------------------

export function FieldReportsView() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [pageId, setPageId] = useState('');

  const { data, isLoading } = useFieldReports({});
  const createMutation = useCreateFieldReport();

  const items = data?.data || [];

  const handleSubmit = () => {
    createMutation.mutate(
      {
        content,
        page_id: pageId ? Number(pageId) : undefined,
        reporter_id: 1,
        source_type: 'manual',
      },
      {
        onSuccess: () => {
          setOpen(false);
          setContent('');
          setPageId('');
        },
      }
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">گزارش‌های میدانی</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => setOpen(true)}
        >
          گزارش جدید
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((report) => (
            <Card key={report.id} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={report.source_type || 'دستی'} size="small" variant="outlined" />
                  <Chip
                    label={report.status}
                    size="small"
                    color={report.status === 'processed' ? 'success' : 'warning'}
                  />
                  {report.page && (
                    <Chip label={report.page.name} size="small" color="info" variant="outlined" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(report.created_at).toLocaleDateString('fa-IR')}
                </Typography>
              </Box>

              <Typography variant="body2">{report.content}</Typography>

              {report.extracted_keywords?.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {report.extracted_keywords.map((kw) => (
                    <Chip key={kw} label={kw} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت گزارش میدانی</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="شناسه پیج (اختیاری)"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            size="small"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="متن گزارش"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!content || createMutation.isPending}
          >
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
