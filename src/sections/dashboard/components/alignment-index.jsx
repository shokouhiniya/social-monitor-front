'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

export function AlignmentIndex({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const value = data?.alignment_index ?? 0;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        شاخص هم‌گرایی شبکه
      </Typography>

      <Typography variant="h3" sx={{ mb: 1 }}>
        {value}%
      </Typography>

      <LinearProgress
        variant="determinate"
        value={value}
        color={value > 50 ? 'success' : 'warning'}
        sx={{ height: 8, borderRadius: 1, mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary">
        {data?.description || '—'}
      </Typography>

      {data?.top_keywords && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {data.top_keywords.map((kw) => (
            <Box
              key={kw.keyword}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'action.selected',
                fontSize: 12,
              }}
            >
              {kw.keyword} ({kw.count})
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
