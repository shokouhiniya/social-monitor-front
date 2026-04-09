'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function FieldNotes({ reports }) {
  const items = reports || [];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        شواهد میدانی (پین‌نوشت‌ها)
      </Typography>

      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          گزارش میدانی ثبت نشده
        </Typography>
      )}

      {items.map((report) => (
        <Box
          key={report.id}
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 1,
            bgcolor: report.is_override ? 'warning.lighter' : 'action.hover',
            borderLeft: report.is_override ? '3px solid' : 'none',
            borderColor: 'warning.main',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Chip
              label={report.source_type || 'دستی'}
              size="small"
              variant="outlined"
              color={report.is_override ? 'warning' : 'default'}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(report.created_at).toLocaleDateString('fa-IR')}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {report.content}
          </Typography>

          {report.is_override && report.override_note && (
            <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
              تحلیل انسانی: {report.override_note}
            </Typography>
          )}
        </Box>
      ))}
    </Card>
  );
}
