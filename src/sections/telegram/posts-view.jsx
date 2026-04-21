'use client';

// Reuse the same posts view — in the future, filter by platform=telegram
import { PostsListView } from '../posts/view';

// ----------------------------------------------------------------------

export function TelegramPostsView() {
  return <PostsListView />;
}
