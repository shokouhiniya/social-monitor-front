'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { alpha } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const CATEGORY_CONFIG = {
  tokens: { label: 'توکن‌ها و سرویس‌های خارجی', icon: 'solar:key-bold-duotone', color: 'error' },
  narrative: { label: 'روایت و تحلیل محتوا', icon: 'solar:target-bold-duotone', color: 'primary' },
  prompts: { label: 'پرامپت‌های هوش مصنوعی', icon: 'solar:cpu-bolt-bold-duotone', color: 'warning' },
  general: { label: 'تنظیمات عمومی', icon: 'solar:settings-bold-duotone', color: 'info' },
};

export function SettingsView() {
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.settings.list);
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await axiosInstance.put(endpoints.settings.update, updates);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setChanges({});
    },
  });

  const handleChange = (key, value) => {
    setChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const updates = Object.entries(changes).map(([key, value]) => ({ key, value }));
    if (updates.length > 0) saveMutation.mutate(updates);
  };

  const items = settings || [];
  const grouped = {};
  for (const s of items) {
    const cat = s.category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <DashboardContent maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>تنظیمات سامانه</Typography>
          <Typography variant="body2" color="text.secondary">پیکربندی پرامپت‌ها، توکن‌ها، روایت و تنظیمات عمومی</Typography>
        </Box>
        <Button
          variant="contained" onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}
          startIcon={saveMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
        >
          ذخیره تغییرات {hasChanges && `(${Object.keys(changes).length})`}
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={2}>
          {Object.entries(CATEGORY_CONFIG).map(([catKey, catConf]) => {
            const catItems = grouped[catKey] || [];
            if (catItems.length === 0) return null;

            return (
              <Accordion key={catKey} defaultExpanded
                sx={(theme) => ({ border: `1px solid ${alpha(theme.palette[catConf.color].main, 0.15)}`, '&::before': { display: 'none' }, borderRadius: '12px !important', overflow: 'hidden' })}
              >
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[catConf.color].main, 0.12) })}>
                      <Iconify icon={catConf.icon} width={22} sx={{ color: `${catConf.color}.main` }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{catConf.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{catItems.length} تنظیم</Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2.5}>
                    {catItems.map((setting) => {
                      const currentValue = changes[setting.key] !== undefined ? changes[setting.key] : setting.value;
                      const isChanged = changes[setting.key] !== undefined;
                      const isMultiline = catKey === 'prompts' || currentValue.length > 100;

                      return (
                        <Box key={setting.key}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{setting.label}</Typography>
                            {isChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
                          </Stack>
                          {setting.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>{setting.description}</Typography>
                          )}
                          <TextField
                            fullWidth size="small"
                            value={currentValue}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                            multiline={isMultiline}
                            rows={isMultiline ? 3 : undefined}
                            type={catKey === 'tokens' && setting.key.includes('key') ? 'password' : 'text'}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </DashboardContent>
  );
}
