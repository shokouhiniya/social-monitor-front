import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Debug info box — shows data source, endpoint, prompt info for each dashboard card.
 * Set SHOW_DEBUG to true to re-enable.
 */
const SHOW_DEBUG = false;

export function DebugBox({ endpoint, dataSource, usesLLM, promptKey, promptEditPath, notes }) {
  if (!SHOW_DEBUG) return null;

  return (
    <Box sx={(theme) => ({
      mt: 1.5, p: 1.5, borderRadius: 1,
      bgcolor: alpha('#ff9800', 0.06),
      border: `1px dashed ${alpha('#ff9800', 0.3)}`,
      fontSize: 11,
    })}>
      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#e65100', fontSize: 10 }}>🔧 DEBUG</Typography>
          <Chip label={usesLLM ? '🤖 LLM' : '📊 DB Query'} size="small" sx={{ height: 18, fontSize: 9, bgcolor: usesLLM ? alpha('#7c4dff', 0.1) : alpha('#2196f3', 0.1) }} />
        </Stack>

        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
          <strong>Endpoint:</strong> <code style={{ background: '#f5f5f5', padding: '1px 4px', borderRadius: 3 }}>{endpoint}</code>
        </Typography>

        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
          <strong>Data:</strong> {dataSource}
        </Typography>

        {promptKey && (
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            <strong>Prompt key:</strong> <code style={{ background: '#f5f5f5', padding: '1px 4px', borderRadius: 3 }}>{promptKey}</code>
          </Typography>
        )}

        {promptEditPath && (
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            <strong>Edit prompt:</strong> {promptEditPath}
          </Typography>
        )}

        {notes && (
          <Typography variant="caption" sx={{ fontSize: 10, color: '#e65100' }}>
            <strong>Note:</strong> {notes}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
