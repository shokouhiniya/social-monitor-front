'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { toJalaliDate } from 'src/utils/format-jalali';

import { useMediaScoreDetail } from 'src/api/media-score';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MediaScoreDetailDialog({ microMediaId, open, onClose }) {
  const { data, isLoading } = useMediaScoreDetail(open ? microMediaId : null);

  const indicators = data?.indicators ?? [];
  const history = data?.history ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h6">{data?.name ?? '...'}</Typography>
            <Typography variant="caption" color="text.secondary">
              جزئیات امتیاز و تاریخچهٔ دوره‌ها
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'primary.lighter',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                امتیاز کلی (میانگین وزنی)
              </Typography>
              <Typography variant="h3" color="primary.main">
                {data?.overall ?? 0}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                امتیاز شاخص‌ها
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>شاخص</TableCell>
                      <TableCell align="center">آخرین امتیاز</TableCell>
                      <TableCell align="center">میانگین</TableCell>
                      <TableCell align="center">تعداد دوره</TableCell>
                      <TableCell align="center">وزن</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {indicators.map((ind) => (
                      <TableRow key={ind.indicator_id}>
                        <TableCell>{ind.title}</TableCell>
                        <TableCell align="center">
                          {ind.latest != null ? (
                            <Chip size="small" color="primary" label={ind.latest} />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">{ind.average ?? '—'}</TableCell>
                        <TableCell align="center">{ind.count}</TableCell>
                        <TableCell align="center">{ind.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                تاریخچهٔ ثبت امتیاز
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  هنوز امتیازی ثبت نشده است.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>دوره</TableCell>
                        <TableCell>شاخص</TableCell>
                        <TableCell align="center">امتیاز</TableCell>
                        <TableCell>ثبت‌کننده</TableCell>
                        <TableCell>تاریخ ثبت</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((h) => (
                        <TableRow key={h.id} hover>
                          <TableCell>{toJalaliDate(h.period_start)}</TableCell>
                          <TableCell>{h.indicator_title}</TableCell>
                          <TableCell align="center">
                            <Chip size="small" variant="soft" label={h.value} />
                          </TableCell>
                          <TableCell>{h.scored_by_name ?? '—'}</TableCell>
                          <TableCell>{toJalaliDate(h.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
