'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

export function PainPoints({ painPoints, keywords, credibility, influence, consistency }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        شاخص‌ها و دغدغه‌ها
      </Typography>

      <Box sx={{ mb: 2 }}>
        <ScoreRow label="اعتبار (Credibility)" value={credibility} />
        <ScoreRow label="نفوذ (Influence)" value={influence} />
        <ScoreRow label="پایداری (Consistency)" value={consistency} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        دغدغه‌های اصلی
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {(painPoints || []).map((point) => (
          <Chip key={point} label={point} size="small" color="error" variant="outlined" />
        ))}
        {(!painPoints || painPoints.length === 0) && (
          <Typography variant="body2" color="text.secondary">—</Typography>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        کلمات کلیدی
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {(keywords || []).map((kw) => (
          <Chip key={kw} label={kw} size="small" variant="outlined" />
        ))}
        {(!keywords || keywords.length === 0) && (
          <Typography variant="body2" color="text.secondary">—</Typography>
        )}
      </Box>
    </Card>
  );
}

function ScoreRow({ label, value }) {
  const score = value ?? 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">{score.toFixed(1)}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(score * 10, 100)}
        color={score > 7 ? 'success' : score > 4 ? 'warning' : 'error'}
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Box>
  );
}
