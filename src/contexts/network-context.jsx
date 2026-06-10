'use client';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

const NETWORKS = [
  { key: 'management', label: 'مدیریت میکرورسانه', icon: 'mdi:view-dashboard', color: '#1976d2' },
  // اینستاگرام/تلگرام از سوییچر بالای منو حذف شدند؛ قابلیت‌های تحلیل/پایش محتوا
  // اکنون مستقیماً در منوی «مدیریت» ادغام شده‌اند. تعاریف برای رفرنس نگه داشته شد:
  // { key: 'instagram', label: 'اینستاگرام', icon: 'mdi:instagram', color: '#E4405F' },
  // { key: 'telegram', label: 'تلگرام', icon: 'mdi:telegram', color: '#0088cc' },
];

const NetworkContext = createContext(undefined);

export function NetworkProvider({ children }) {
  const [activeNetwork, setActiveNetwork] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('active_network');
      // اگر مقدار ذخیره‌شده دیگر در فهرست شبکه‌ها نباشد (مثلاً instagram/telegram حذف‌شده)
      // به management برگردان تا منوی قدیمی نمایش داده نشود.
      if (stored && NETWORKS.some((n) => n.key === stored)) {
        return stored;
      }
    }
    return 'management';
  });

  const switchNetwork = useCallback((network) => {
    setActiveNetwork(network);
    localStorage.setItem('active_network', network);
  }, []);

  const value = useMemo(
    () => ({
      activeNetwork,
      switchNetwork,
      networks: NETWORKS,
      currentNetwork: NETWORKS.find((n) => n.key === activeNetwork) || NETWORKS[0],
    }),
    [activeNetwork, switchNetwork]
  );

  return <NetworkContext value={value}>{children}</NetworkContext>;
}

export function useNetworkContext() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetworkContext must be used within NetworkProvider');
  return context;
}

export { NETWORKS };
