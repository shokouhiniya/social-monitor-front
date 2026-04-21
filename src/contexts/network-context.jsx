'use client';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

const NETWORKS = [
  { key: 'instagram', label: 'اینستاگرام', icon: 'mdi:instagram', color: '#E4405F' },
  { key: 'telegram', label: 'تلگرام', icon: 'mdi:telegram', color: '#0088cc' },
  // Future: { key: 'twitter', label: 'توییتر', icon: 'mdi:twitter', color: '#1DA1F2' },
  // Future: { key: 'youtube', label: 'یوتیوب', icon: 'mdi:youtube', color: '#FF0000' },
];

const NetworkContext = createContext(undefined);

export function NetworkProvider({ children }) {
  const [activeNetwork, setActiveNetwork] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('active_network') || 'instagram';
    }
    return 'instagram';
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
