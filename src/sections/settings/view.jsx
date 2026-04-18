'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CATEGORY_CONFIG = {
  tokens: { label: 'توکن‌ها و سرویس‌های خارجی', icon: 'solar:key-bold-duotone', color: 'error' },
  narrative: { label: 'روایت و تحلیل محتوا', icon: 'solar:target-bold-duotone', color: 'primary' },
  prompts: { label: 'پرامپت‌های هوش مصنوعی', icon: 'solar:cpu-bolt-bold-duotone', color: 'warning' },
  general: { label: 'تنظیمات عمومی', icon: 'solar:settings-bold-duotone', color: 'info' },
};

// Module metadata for the prompts section
const PROMPT_MODULES = [
  {
    key: 'prompt_page_analysis',
    extraKey: 'prompt_page_analysis_extra',
    title: 'ماژول تحلیل پیج',
    icon: 'solar:user-id-bold-duotone',
    color: 'primary',
    description: 'این ماژول هر پیج اینستاگرامی را به صورت جداگانه تحلیل می‌کند و اطلاعات پروفایل و آخرین پست‌ها را به LLM ارسال می‌کند.',
    outputs: [
      { label: 'دسته‌بندی پیج', desc: 'news, activist, celebrity, lifestyle و ...' },
      { label: 'خوشه معنایی', desc: 'رسانه مقاومت، لایف‌استایل، رسانه بین‌المللی و ...' },
      { label: 'امتیاز اعتبار', desc: 'عدد ۰ تا ۱۰ — میزان قابل اعتماد بودن محتوا' },
      { label: 'امتیاز نفوذ', desc: 'عدد ۰ تا ۱۰ — قدرت تأثیرگذاری پیج' },
      { label: 'نرخ پایداری', desc: 'عدد ۰ تا ۱۰ — ثبات در تولید محتوا' },
      { label: 'رادار شخصیت', desc: 'نمودار ۶ محوری: تهاجمی/دفاعی، تولیدکننده/بازنشردهنده، بصری/متنی، رسمی/غیررسمی، محلی/جهانی، تعاملی/یک‌طرفه' },
      { label: 'دغدغه‌ها', desc: 'لیست دغدغه‌های اصلی پیج' },
      { label: 'کلمات کلیدی', desc: '۵ کلمه کلیدی محتوای پیج' },
      { label: 'تحلیل پست‌ها', desc: 'احساسات، موضوعات و کلمات کلیدی هر پست' },
    ],
  },
  {
    key: 'prompt_report_generation',
    extraKey: 'prompt_report_generation_extra',
    title: 'ماژول تولید گزارش',
    icon: 'solar:document-text-bold-duotone',
    color: 'info',
    description: 'این ماژول داده‌های کل شبکه (پیج‌ها، موضوعات، کلمات کلیدی، احساسات) را جمع‌آوری و یک گزارش تحلیلی جامع تولید می‌کند.',
    outputs: [
      { label: 'تیتر شبکه', desc: 'یک جمله کوتاه و تأثیرگذار درباره وضعیت کلی' },
      { label: 'گزارش مفصل', desc: 'حداقل ۵ پاراگراف: وضعیت کلی، موضوعات داغ، تحلیل احساسات، نقاط قوت/ضعف، پیشنهادات' },
      { label: 'حال‌وهوای شبکه', desc: 'امیدوار / ملتهب / در وضعیت انتظار' },
      { label: 'موضوعات برتر', desc: 'لیست ۳ موضوع داغ شبکه' },
      { label: 'کلمات کلیدی برتر', desc: 'لیست ۳ کلمه کلیدی پرتکرار' },
    ],
  },
  {
    key: 'prompt_alert_generation',
    extraKey: 'prompt_alert_generation_extra',
    title: 'ماژول تولید هشدار استراتژیک',
    icon: 'solar:danger-triangle-bold-duotone',
    color: 'error',
    description: 'این ماژول با بررسی داده‌های شبکه، تهدیدها و فرصت‌های استراتژیک را شناسایی و ۵ هشدار با اقدامات پیشنهادی تولید می‌کند.',
    outputs: [
      { label: 'عنوان هشدار', desc: 'عنوان کوتاه و گویا' },
      { label: 'توضیح هشدار', desc: 'حداقل ۲ جمله توضیح مفصل' },
      { label: 'اولویت', desc: 'critical / high / medium / low' },
      { label: 'دسته‌بندی', desc: 'silence_gap / trend_shift / crisis / opportunity' },
      { label: 'اقدامات پیشنهادی', desc: 'لیست حداقل ۳ اقدام عملیاتی (playbook)' },
    ],
  },
];

// ----------------------------------------------------------------------

function PromptModuleCard({ module, settings, changes, onChangeField }) {
  const mainSetting = settings.find((s) => s.key === module.key);
  const extraSetting = settings.find((s) => s.key === module.extraKey);

  if (!mainSetting) return null;

  const mainValue = changes[module.key] !== undefined ? changes[module.key] : mainSetting.value;
  const extraValue = changes[module.extraKey] !== undefined ? changes[module.extraKey] : (extraSetting?.value || '');
  const isMainChanged = changes[module.key] !== undefined;
  const isExtraChanged = changes[module.extraKey] !== undefined;

  return (
    <Card
      sx={(theme) => ({
        border: `1px solid ${alpha(theme.palette[module.color].main, 0.2)}`,
        borderRadius: 2,
        overflow: 'hidden',
      })}
    >
      {/* Module Header */}
      <Box
        sx={(theme) => ({
          px: 2.5,
          py: 2,
          bgcolor: alpha(theme.palette[module.color].main, 0.06),
          borderBottom: `1px solid ${alpha(theme.palette[module.color].main, 0.1)}`,
        })}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 42,
              height: 42,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette[module.color].main, 0.12),
            })}
          >
            <Iconify icon={module.icon} width={24} sx={{ color: `${module.color}.main` }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {module.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {module.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Outputs Section */}
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
          <Iconify icon="solar:chart-2-bold-duotone" width={16} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
          خروجی‌های این ماژول:
        </Typography>
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2.5,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.grey[500], 0.06),
            border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          })}
        >
          {module.outputs.map((output, idx) => (
            <Chip
              key={idx}
              size="small"
              variant="outlined"
              label={
                <span>
                  <strong>{output.label}</strong>
                  <span style={{ opacity: 0.7 }}>{` — ${output.desc}`}</span>
                </span>
              }
              sx={{
                height: 'auto',
                py: 0.5,
                '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.4 },
                borderColor: (theme) => alpha(theme.palette[module.color].main, 0.3),
              }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* System Prompt */}
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Iconify icon="solar:cpu-bolt-bold-duotone" width={16} sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              پرامپت سیستمی
            </Typography>
            {isMainChanged && (
              <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            نقش و هدف اصلی LLM برای این ماژول. توضیح بدهید چه کاری انجام دهد و چه خروجی‌هایی مد نظر شماست.
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={6}
            value={mainValue}
            onChange={(e) => onChangeField(module.key, e.target.value)}
            placeholder="پرامپت سیستمی را وارد کنید..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.7,
              },
            }}
          />
        </Box>

        {/* Extra Instructions */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Iconify icon="solar:add-circle-bold-duotone" width={16} sx={{ color: 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              دستورات اضافی
            </Typography>
            {isExtraChanged && (
              <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            دستورات تکمیلی که به انتهای پرامپت اضافه می‌شود. مثلاً: «لحن رسمی‌تر باشد» یا «بیشتر روی تحلیل احساسات تمرکز کن» یا «خروجی را به انگلیسی بده»
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={extraValue}
            onChange={(e) => onChangeField(module.extraKey, e.target.value)}
            placeholder="دستورات اضافی (اختیاری)..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.7,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.03),
              },
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

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

  // Separate prompt keys from non-prompt categories
  const nonPromptCategories = ['tokens', 'narrative', 'general'];

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <DashboardContent maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            تنظیمات سامانه
          </Typography>
          <Typography variant="body2" color="text.secondary">
            پیکربندی پرامپت‌ها، توکن‌ها، روایت و تنظیمات عمومی
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          startIcon={
            saveMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="solar:check-circle-bold" />
            )
          }
        >
          ذخیره تغییرات {hasChanges && `(${Object.keys(changes).length})`}
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {/* Non-prompt categories (tokens, narrative, general) */}
          {nonPromptCategories.map((catKey) => {
            const catConf = CATEGORY_CONFIG[catKey];
            const catItems = grouped[catKey] || [];
            if (catItems.length === 0) return null;

            return (
              <Accordion
                key={catKey}
                defaultExpanded
                sx={(theme) => ({
                  border: `1px solid ${alpha(theme.palette[catConf.color].main, 0.15)}`,
                  '&::before': { display: 'none' },
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                })}
              >
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={(theme) => ({
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette[catConf.color].main, 0.12),
                      })}
                    >
                      <Iconify icon={catConf.icon} width={22} sx={{ color: `${catConf.color}.main` }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {catConf.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {catItems.length} تنظیم
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2.5}>
                    {catItems.map((setting) => {
                      const currentValue =
                        changes[setting.key] !== undefined ? changes[setting.key] : setting.value;
                      const isChanged = changes[setting.key] !== undefined;
                      const isMultiline = currentValue.length > 100;

                      return (
                        <Box key={setting.key}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {setting.label}
                            </Typography>
                            {isChanged && (
                              <Chip
                                label="تغییر یافته"
                                size="small"
                                color="warning"
                                sx={{ height: 18, fontSize: 9 }}
                              />
                            )}
                          </Stack>
                          {setting.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 1, display: 'block' }}
                            >
                              {setting.description}
                            </Typography>
                          )}
                          <TextField
                            fullWidth
                            size="small"
                            value={currentValue}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                            multiline={isMultiline}
                            rows={isMultiline ? 3 : undefined}
                            type={
                              catKey === 'tokens' && setting.key.includes('key') ? 'password' : 'text'
                            }
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Prompts Section — Module-based cards */}
          <Accordion
            defaultExpanded
            sx={(theme) => ({
              border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
              '&::before': { display: 'none' },
              borderRadius: '12px !important',
              overflow: 'hidden',
            })}
          >
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={(theme) => ({
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                  })}
                >
                  <Iconify
                    icon="solar:cpu-bolt-bold-duotone"
                    width={22}
                    sx={{ color: 'warning.main' }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    پرامپت‌های هوش مصنوعی
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    پرامپت سیستمی و دستورات اضافی هر ماژول را تنظیم کنید تا خروجی LLM به نتیجه
                    دلخواه شما نزدیک‌تر شود
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2.5}>
                {PROMPT_MODULES.map((module) => (
                  <PromptModuleCard
                    key={module.key}
                    module={module}
                    settings={items}
                    changes={changes}
                    onChangeField={handleChange}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}
    </DashboardContent>
  );
}
