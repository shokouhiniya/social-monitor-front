'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useMutation } from '@tanstack/react-query';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function SilenceRadar() {
  const [topicsInput, setTopicsInput] = useState('');
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: async (globalTopics) => {
      const res = await axiosInstance.post(endpoints.analytics.silenceRadar, { global_topics: globalTopics });
      return res.data?.data;
    },
    onSuccess: (data) => setResult(data),
  });

  const handleAnalyze = () => {
    const topics = topicsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (topics.length > 0) mutation.mutate(topics);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        رادار سکوت — تحلیل شکاف محتوایی
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="موضوعات داغ جهانی (با کاما جدا کنید)..."
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={mutation.isPending}
          sx={{ minWidth: 100 }}
        >
          {mutation.isPending ? <CircularProgress size={20} /> : 'تحلیل'}
        </Button>
      </Box>

      {result && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">
              پوشش: {result.coverage_rate}%
            </Typography>
            <Typography variant="body2" color={result.silence_gaps?.length > 3 ? 'error.main' : 'success.main'}>
              {result.silence_gaps?.length} شکاف شناسایی شد
            </Typography>
          </Box>

          {result.silence_gaps?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                موضوعات بدون پوشش (سکوت)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {result.silence_gaps.map((gap) => (
                  <Chip key={gap} label={gap} size="small" color="error" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {result.covered_topics?.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                موضوعات پوشش داده شده
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {result.covered_topics.map((topic) => (
                  <Chip key={topic} label={topic} size="small" color="success" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
