'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

const FORMAT_LABELS = {
  image: 'تصویر',
  video: 'ویدیو',
  reel: 'ریلز',
  story: 'استوری',
  carousel: 'کاروسل',
};

export function ContentHookAnalyzer({ data }) {
  const items = data || [];

  if (items.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          قلاب محتوایی
        </Typography>
        <Typography variant="body2" color="text.secondary">
          داده‌ای موجود نیست
        </Typography>
      </Card>
    );
  }

  const maxEngagement = Math.max(...items.map((i) => Number(i.avg_engagement)), 1);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        قلاب محتوایی — فرمت‌های پرتعامل
      </Typography>

      {items.map((item, index) => {
        const percent = Math.round((Number(item.avg_engagement) / maxEngagement) * 100);
        const label = FORMAT_LABELS[item.format] || item.format || 'نامشخص';

        return (
          <Box key={item.format || index} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.post_count} پست • میانگین تعامل: {Number(item.avg_engagement).toFixed(0)}
              </Typography>
            </Box>
            <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: 1,
                  bgcolor: index === 0 ? 'success.main' : index === 1 ? 'info.main' : 'grey.400',
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Card>
  );
}
