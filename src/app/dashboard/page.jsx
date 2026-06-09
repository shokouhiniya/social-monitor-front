'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// micromedia-transformation (تصمیم ۷): تجربهٔ اصلی، مدیریت میکرورسانه است.
// /dashboard به فضاهای پلتفرمی قدیمی redirect می‌شود فقط اگر کاربر صراحتاً آن
// شبکه را انتخاب کرده باشد؛ در غیر این صورت به داشبورد کلان مدیریت می‌رود.
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const activeNetwork =
      (typeof window !== 'undefined' && localStorage.getItem('active_network')) ||
      'management';
    if (activeNetwork === 'telegram') {
      router.replace(paths.dashboard.telegram.root);
    } else if (activeNetwork === 'instagram') {
      router.replace(paths.dashboard.instagram.root);
    } else {
      router.replace(paths.dashboard.overview);
    }
  }, [router]);

  return null;
}
