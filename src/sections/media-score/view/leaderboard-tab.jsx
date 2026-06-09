'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useScoreLeaderboard } from 'src/api/media-score';

import { Iconify } from 'src/components/iconify';

import { MediaScoreDetailDialog } from './media-score-detail-dialog';

// ----------------------------------------------------------------------

const MEDALS = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold/silver/bronze

export function LeaderboardTab() {
  // '' = امتیاز کلی؛ در غیر این صورت id شاخص
  const [indicatorId, setIndicatorId] = useState('');
  const [detailId, setDetailId] = useState(null);
  const { data, isLoading } = useScoreLeaderboard(indicatorId || undefined);

  const indicators = data?.indicators ?? [];
  const rows = data?.rows ?? [];
  const maxValue = rows.length ? Math.max(...rows.map((r) => r.value), 1) : 1;

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
        <Chip
          label="امتیاز کلی"
          color={!indicatorId ? 'primary' : 'default'}
          variant={!indicatorId ? 'filled' : 'outlined'}
          onClick={() => setIndicatorId('')}
        />
        {indicators.map((ind) => (
          <Chip
            key={ind.id}
            label={ind.title}
            color={indicatorId === ind.id ? 'primary' : 'default'}
            variant={indicatorId === ind.id ? 'filled' : 'outlined'}
            onClick={() => setIndicatorId(ind.id)}
          />
        ))}
      </Stack>

      <Card>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            <Iconify icon="solar:ranking-bold-duotone" width={48} />
            <Typography sx={{ mt: 1 }}>هنوز امتیازی ثبت نشده</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64 }}>رتبه</TableCell>
                  <TableCell>میکرورسانه</TableCell>
                  <TableCell sx={{ width: '40%' }}>امتیاز</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.micro_media_id}
                    hover
                    onClick={() => setDetailId(r.micro_media_id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {r.rank <= 3 ? (
                        <Iconify icon="solar:cup-star-bold" width={24} sx={{ color: MEDALS[r.rank - 1] }} />
                      ) : (
                        <Typography color="text.secondary">{r.rank}</Typography>
                      )}
                    </TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (r.value / maxValue) * 100)}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>
                        <Typography variant="subtitle2" sx={{ minWidth: 40, textAlign: 'left' }}>
                          {r.value}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <MediaScoreDetailDialog
        microMediaId={detailId}
        open={!!detailId}
        onClose={() => setDetailId(null)}
      />
    </Box>
  );
}
