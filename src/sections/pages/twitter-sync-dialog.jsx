'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { twitterApi } from 'src/api/twitter';

const PAGE_CATEGORY_LABELS = {
  official: 'رسمی',
  news_agency: 'خبرگزاری‌ها',
  fan_pages: 'پیج‌های هواداری',
  news_pages: 'پیج‌های خبری',
  local_sources: 'منابع محلی',
  opposition_sources: 'منابع ضدنظام',
  foreign_sources: 'منابع خارجی',
};

export function TwitterSyncDialog({ open, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [pageCategory, setPageCategory] = useState('official');
  const [clientKeywords, setClientKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSync = async () => {
    if (!username.trim()) {
      setError('Please enter a Twitter username');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await twitterApi.syncAccount(
        username.trim().replace('@', ''),
        pageCategory,
        pageCategory !== 'official' && clientKeywords.trim()
          ? clientKeywords.split(',').map(k => k.trim()).filter(Boolean)
          : undefined
      );
      setSuccess(result.message || 'Twitter account synced successfully!');
      if (onSuccess) onSuccess(result);
      setTimeout(() => { handleClose(); }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to sync Twitter account';
      if (err.response?.status === 429 || errorMessage.includes('Rate limit')) {
        setError('⚠️ Rate Limit Exceeded\n\nPlease wait for the limit to reset or upgrade your plan.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPageCategory('official');
    setClientKeywords('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:twitter" width={24} />
          <Typography variant="h6">Sync Twitter Account</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a Twitter username to monitor their activity.
          </Typography>
          <TextField fullWidth label="Twitter Username" placeholder="elonmusk" value={username}
            onChange={(e) => setUsername(e.target.value)} disabled={loading} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>@</Typography> }}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSync(); }}
          />
          <TextField select fullWidth label="نوع منبع" value={pageCategory}
            onChange={(e) => setPageCategory(e.target.value)} disabled={loading} sx={{ mb: 2 }}>
            {Object.entries(PAGE_CATEGORY_LABELS).map(([k, v]) => (<MenuItem key={k} value={k}>{v}</MenuItem>))}
          </TextField>
          {pageCategory !== 'official' && (
            <TextField fullWidth label="کلمات کلیدی (با کاما جدا کنید)" placeholder="مثال: قالیباف, شهردار"
              value={clientKeywords} onChange={(e) => setClientKeywords(e.target.value)} disabled={loading}
              helperText="فقط پست‌هایی که حاوی این کلمات هستند ذخیره می‌شوند" sx={{ mb: 2 }} />
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSync} disabled={loading || !username.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="mdi:sync" />}>
          {loading ? 'Syncing...' : 'Sync Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
