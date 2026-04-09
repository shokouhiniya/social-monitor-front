'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

// ----------------------------------------------------------------------

export function TopInfluencers({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  const items = data || [];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        پیج‌های با بیشترین نفوذ
      </Typography>

      <List disablePadding>
        {items.slice(0, 10).map((item, index) => (
          <ListItem key={item.id} disableGutters sx={{ py: 0.5 }}>
            <ListItemAvatar>
              <Avatar src={item.profile_image_url} sx={{ width: 36, height: 36 }}>
                {index + 1}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={item.name}
              secondary={`${item.category || '—'} • نفوذ: ${item.influence_score?.toFixed(1)}`}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
