'use client';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function ProfileHeader({ page }) {
  if (!page) return null;

  return (
    <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
      <Avatar src={page.profile_image_url} sx={{ width: 72, height: 72, fontSize: 28 }}>
        {page.name?.[0]}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h5">{page.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          @{page.username} • {page.platform}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {page.category && <Chip label={page.category} size="small" color="primary" variant="outlined" />}
          {page.country && <Chip label={page.country} size="small" variant="outlined" />}
          {page.language && <Chip label={page.language} size="small" variant="outlined" />}
          {page.cluster && <Chip label={`خوشه: ${page.cluster}`} size="small" color="info" variant="outlined" />}
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">{page.followers_count?.toLocaleString()}</Typography>
        <Typography variant="caption" color="text.secondary">فالوور</Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">{page.following_count?.toLocaleString()}</Typography>
        <Typography variant="caption" color="text.secondary">فالووینگ</Typography>
      </Box>
    </Card>
  );
}
