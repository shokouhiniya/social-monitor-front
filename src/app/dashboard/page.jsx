'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// Redirect /dashboard to the active network dashboard
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const activeNetwork = localStorage.getItem('active_network') || 'instagram';
    if (activeNetwork === 'telegram') {
      router.replace(paths.dashboard.telegram.root);
    } else {
      router.replace(paths.dashboard.instagram.root);
    }
  }, [router]);

  return null;
}
