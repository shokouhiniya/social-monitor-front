'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InteractionCopilot({ page, contentHooks }) {
  const [tab, setTab] = useState(0);

  if (!page) return null;

  const topFormat = contentHooks?.[0];
  const painPoints = page.pain_points || [];
  const topKeyword = page.keywords?.[0];
  const isAggressive = (page.persona_radar?.aggressive_defensive ?? 50) > 60;
  const isFormal = (page.persona_radar?.formal_informal ?? 50) > 50;

  // Generate context
  const context = painPoints.length > 0
    ? `این پیج بیشترین حساسیت را نسبت به «${painPoints[0]}» دارد. ${topKeyword ? `کلمه کلیدی غالب: «${topKeyword}».` : ''} ${isAggressive ? 'لحن تهاجمی دارد — با احتیاط وارد شوید.' : 'لحن ملایمی دارد.'}`
    : 'داده کافی برای تحلیل زمینه موجود نیست.';

  // Generate strategy
  const toneLabel = isFormal ? 'رسمی' : 'صمیمی و غیررسمی';
  const strategy = painPoints.length > 0
    ? `از درِ «${painPoints[0]}» وارد شوید. لحن پیشنهادی: ${toneLabel}. ${topFormat ? `فرمت محتوایی با بیشترین تعامل: ${topFormat.format || 'نامشخص'}.` : ''}`
    : 'ابتدا چند پست اخیر را بررسی کنید و نقطه اشتراک پیدا کنید.';

  // Generate magic sentences
  const sentences = {
    formal: painPoints[0]
      ? `با احترام، محتوای اخیر شما درباره «${painPoints[0]}» بسیار تاثیرگذار بود. مایلیم در این زمینه همکاری داشته باشیم.`
      : 'با احترام، فعالیت‌های ارزشمند شما مورد توجه ما قرار گرفته است.',
    friendly: painPoints[0]
      ? `سلام! پست‌هات درباره ${painPoints[0]} خیلی خوب بود 🙏 دوست داری با هم یه کار مشترک انجام بدیم؟`
      : 'سلام! محتواهات عالیه 👏 دوست داری با هم آشنا بشیم؟',
    expert: topKeyword
      ? `به عنوان فعال حوزه «${topKeyword}»، تحلیل شما از وضعیت فعلی بسیار ارزشمند است. آیا امکان گفتگوی تخصصی وجود دارد؟`
      : 'تخصص شما در این حوزه قابل تقدیر است. آیا امکان تبادل نظر وجود دارد؟',
  };

  return (
    <Card
      sx={(theme) => ({
        p: 0,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 100%)`,
      })}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Iconify icon="solar:chat-round-dots-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>دستیار تعامل</Typography>
        <Tooltip title="پیشنهاد استراتژی تعامل بر اساس تحلیل شخصیت و محتوای پیج" arrow>
          <IconButton size="small" sx={{ opacity: 0.4 }}>
            <Iconify icon="solar:info-circle-line-duotone" width={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, fontSize: 12, py: 0 } }}>
        <Tab label="زمینه" icon={<Iconify icon="solar:eye-bold" width={14} />} iconPosition="start" />
        <Tab label="استراتژی" icon={<Iconify icon="solar:target-bold" width={14} />} iconPosition="start" />
        <Tab label="جملات پیشنهادی" icon={<Iconify icon="solar:pen-bold" width={14} />} iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 2.5 }}>
        {tab === 0 && (
          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.04) })}>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{context}</Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.04) })}>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>{strategy}</Typography>
            {topFormat && (
              <Chip label={`فرمت برتر: ${topFormat.format}`} size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
            )}
          </Box>
        )}

        {tab === 2 && (
          <Stack spacing={1.5}>
            {Object.entries(sentences).map(([key, text]) => {
              const labels = { formal: 'رسمی', friendly: 'دوستانه', expert: 'تخصصی' };
              const colors = { formal: 'info', friendly: 'success', expert: 'secondary' };
              return (
                <Box key={key} sx={(theme) => ({ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette[colors[key]].main, 0.04), border: `1px solid ${alpha(theme.palette[colors[key]].main, 0.12)}` })}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label={labels[key]} size="small" color={colors[key]} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                    <Tooltip title="کپی" arrow>
                      <IconButton size="small" onClick={() => navigator.clipboard?.writeText(text)}>
                        <Iconify icon="solar:copy-bold" width={14} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.8 }}>{text}</Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
