'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalali } from 'src/utils/format-jalali';

import { useGenerateNarrative } from 'src/api/pages';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SUPPORTED_LANGUAGES = [
  { key: 'fa', label: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { key: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { key: 'ar', label: 'العربیة', flag: '🇸🇦', dir: 'rtl' },
  { key: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { key: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { key: 'ur', label: 'اردو', flag: '🇵🇰', dir: 'rtl' },
];

const TOPIC_COLORS = [
  '#00A76F', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630',
  '#2065D1', '#FF6C40', '#36B37E', '#6554C0', '#B76E00',
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Tooltip title={copied ? 'کپی شد!' : 'کپی متن'} arrow>
      <IconButton size="small" onClick={handleCopy} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={14} />
      </IconButton>
    </Tooltip>
  );
}

// --- Sub-views ---

function NarrativeView({ description, fieldReports }) {
  if (!description) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 3, color: 'text.secondary' }}>
        <Iconify icon="solar:document-text-line-duotone" width={20} />
        <Typography variant="body2">
          هنوز توصیف تولید نشده. روی «تولید پنل بصیرت» بزنید تا AI توصیف کاملی تهیه کند.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={(theme) => ({
          p: 2,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
        })}
      >
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <CopyButton text={description} />
        </Box>
        <Typography variant="body2" sx={{ lineHeight: 2.1, fontSize: 13, pr: 1 }}>
          {description}
        </Typography>
      </Box>

      {fieldReports?.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="solar:microphone-bold-duotone" width={16} sx={{ color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
              شواهد میدانی ({fieldReports.length})
            </Typography>
          </Stack>
          <Stack spacing={1} sx={{ maxHeight: 220, overflow: 'auto', pr: 1 }}>
            {fieldReports.map((r) => (
              <Box
                key={r.id}
                sx={(theme) => ({
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  borderRight: `3px solid ${theme.palette.warning.main}`,
                })}
              >
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Chip
                    label={r.source_type || 'دستی'}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: 9 }}
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {toJalali(r.created_at)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7 }}>
                  {r.content}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function TopicDistributionView({ distribution, painPoints, keywords }) {
  const items = Array.isArray(distribution) ? distribution : [];
  const sorted = [...items].sort((a, b) => (b.max_percent || 0) - (a.max_percent || 0));

  return (
    <Stack spacing={2.5}>
      {/* Topic distribution */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Iconify icon="solar:pie-chart-2-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
            توزیع تقریبی موضوعات (پست + استوری)
          </Typography>
        </Stack>

        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
            توزیع موضوعی هنوز تولید نشده است.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {sorted.map((item, idx) => {
              const color = TOPIC_COLORS[idx % TOPIC_COLORS.length];
              const range =
                item.min_percent === item.max_percent
                  ? `${item.max_percent}٪`
                  : `${item.min_percent}–${item.max_percent}٪`;

              return (
                <Box key={`${item.topic}-${idx}`}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.4 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: color,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600 }}>
                        {item.topic}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 11, fontWeight: 700, color }}
                    >
                      {range}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(item.max_percent || 0, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: alpha(color, 0.1),
                      '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 1 },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Pain points */}
      {painPoints?.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify
              icon="solar:heart-pulse-bold-duotone"
              width={16}
              sx={{ color: 'error.main' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
              دغدغه‌های اصلی
            </Typography>
          </Stack>
          <Stack spacing={0.75}>
            {painPoints.map((p, idx) => (
              <Stack
                key={idx}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={(theme) => ({
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: theme.palette.error.main,
                  })}
                />
                <Typography variant="caption" sx={{ fontSize: 12 }}>
                  {p}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Keywords */}
      {keywords?.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="solar:tag-bold-duotone" width={16} sx={{ color: 'info.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
              کلمات کلیدی
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {keywords.map((kw) => (
              <Chip key={kw} label={kw} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

function AudienceView({ description }) {
  if (!description) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 3, color: 'text.secondary' }}>
        <Iconify icon="solar:users-group-rounded-line-duotone" width={20} />
        <Typography variant="body2">توصیف مخاطب هنوز تولید نشده است.</Typography>
      </Stack>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.info.main, 0.04),
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        position: 'relative',
      })}
    >
      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
        <CopyButton text={description} />
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Iconify
          icon="solar:users-group-rounded-bold-duotone"
          width={18}
          sx={{ color: 'info.main' }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main', fontSize: 11 }}>
          توصیف مخاطب و دنبال‌کنندگان
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ lineHeight: 2, fontSize: 13, pr: 1 }}>
        {description}
      </Typography>
    </Box>
  );
}

function EngagementView({ suggestion, translations }) {
  const allTexts = {
    fa: suggestion,
    ...(translations || {}),
  };

  const available = SUPPORTED_LANGUAGES.filter((l) => !!allTexts[l.key]);
  const [activeLang, setActiveLang] = useState('fa');

  if (available.length === 0) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 3, color: 'text.secondary' }}>
        <Iconify icon="solar:chat-round-dots-line-duotone" width={20} />
        <Typography variant="body2">پیشنهاد تعامل هنوز تولید نشده است.</Typography>
      </Stack>
    );
  }

  const currentLang = available.find((l) => l.key === activeLang) || available[0];
  const text = allTexts[currentLang.key];

  return (
    <Stack spacing={1.5}>
      {/* Language tabs */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {available.map((lang) => (
          <Chip
            key={lang.key}
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box component="span" sx={{ fontSize: 14 }}>
                  {lang.flag}
                </Box>
                <Box component="span" sx={{ fontSize: 11 }}>{lang.label}</Box>
              </Stack>
            }
            size="small"
            color={activeLang === lang.key ? 'primary' : 'default'}
            variant={activeLang === lang.key ? 'filled' : 'outlined'}
            onClick={() => setActiveLang(lang.key)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {/* Active translation */}
      <Box
        sx={(theme) => ({
          p: 2,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.success.main, 0.04),
          border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
          position: 'relative',
          direction: currentLang.dir,
        })}
      >
        <Box sx={{ position: 'absolute', top: 8, [currentLang.dir === 'rtl' ? 'left' : 'right']: 8 }}>
          <CopyButton text={text} />
        </Box>
        <Typography
          variant="body2"
          sx={{
            lineHeight: 2,
            fontSize: 13,
            textAlign: currentLang.dir === 'rtl' ? 'right' : 'left',
            px: 1,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  );
}

// --- Main component ---

export function Insight360Panel({ page, painPoints, keywords, fieldReports }) {
  const [tab, setTab] = useState(0);
  const generateMutation = useGenerateNarrative();

  if (!page) return null;

  const description = page.narrative_description;
  const distribution = page.topic_distribution;
  const audience = page.audience_description;
  const suggestion = page.engagement_suggestion;
  const translations = page.engagement_suggestion_translations;
  const generatedAt = page.narrative_generated_at;

  const hasAny = description || distribution?.length > 0 || audience || suggestion;

  const handleGenerate = () => {
    generateMutation.mutate(page.id);
  };

  return (
    <Card
      sx={(theme) => ({
        p: 0,
        overflow: 'hidden',
        height: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
      })}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2.5, pt: 2.5, pb: 1, flexWrap: 'wrap', gap: 1 }}
      >
        <Iconify icon="solar:eye-scan-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          پنل ۳۶۰° بصیرت
        </Typography>
        <Tooltip title="توصیف آزاد، توزیع موضوعی، توصیف مخاطب و پیشنهاد تعامل به ۶ زبان" arrow>
          <IconButton size="small" sx={{ opacity: 0.4 }}>
            <Iconify icon="solar:info-circle-line-duotone" width={16} />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        {generatedAt && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            {toJalali(generatedAt)}
          </Typography>
        )}

        <Button
          size="small"
          variant={hasAny ? 'outlined' : 'contained'}
          color="primary"
          startIcon={
            generateMutation.isPending ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Iconify icon="solar:magic-stick-3-bold" width={14} />
            )
          }
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          sx={{ fontSize: 11 }}
        >
          {generateMutation.isPending ? 'در حال تولید...' : hasAny ? 'بازتولید' : 'تولید پنل بصیرت'}
        </Button>
      </Stack>

      {generateMutation.isError && (
        <Alert
          severity="error"
          sx={{ mx: 2.5, mb: 1 }}
          onClose={() => generateMutation.reset()}
        >
          {generateMutation.error?.message || 'خطا در تولید پنل بصیرت'}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          px: 2,
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, fontSize: 12, py: 0, minWidth: 'auto' },
        }}
      >
        <Tab
          label="توصیف آزاد"
          icon={<Iconify icon="solar:document-text-bold" width={14} />}
          iconPosition="start"
        />
        <Tab
          label="ثقل موضوعی"
          icon={<Iconify icon="solar:pie-chart-2-bold" width={14} />}
          iconPosition="start"
        />
        <Tab
          label="مخاطب"
          icon={<Iconify icon="solar:users-group-rounded-bold" width={14} />}
          iconPosition="start"
        />
        <Tab
          label="پیشنهاد تعامل"
          icon={<Iconify icon="solar:chat-round-dots-bold" width={14} />}
          iconPosition="start"
        />
      </Tabs>

      <Box sx={{ p: 2.5, pt: 2 }}>
        {tab === 0 && (
          <NarrativeView description={description} fieldReports={fieldReports} />
        )}
        {tab === 1 && (
          <TopicDistributionView
            distribution={distribution}
            painPoints={painPoints}
            keywords={keywords}
          />
        )}
        {tab === 2 && <AudienceView description={audience} />}
        {tab === 3 && (
          <EngagementView suggestion={suggestion} translations={translations} />
        )}
      </Box>
    </Card>
  );
}
