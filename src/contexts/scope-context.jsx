'use client';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

/**
 * Scope context — controls which subset of the network drives the dashboards.
 *
 *  - 'all'             → entire monitored network
 *  - 'representatives' → pages flagged is_representative = true
 *  - 'cluster'         → pages belonging to a specific cluster (clusterId)
 */

const ScopeContext = createContext(undefined);

const STORAGE_KEY = 'dashboard_scope';

function readInitialScope() {
  if (typeof window === 'undefined') return { scope: 'representatives', clusterId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { scope: 'representatives', clusterId: null };
    const parsed = JSON.parse(raw);
    return {
      scope: parsed?.scope || 'representatives',
      clusterId: parsed?.clusterId ?? null,
    };
  } catch {
    return { scope: 'representatives', clusterId: null };
  }
}

export function ScopeProvider({ children }) {
  const [state, setState] = useState(readInitialScope);

  const setScope = useCallback((scope, clusterId = null) => {
    const next = { scope, clusterId: scope === 'cluster' ? clusterId : null };
    setState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const value = useMemo(
    () => ({
      scope: state.scope,
      clusterId: state.clusterId,
      setScope,
      // params helper for axios requests
      params: state.scope === 'cluster' && state.clusterId
        ? { scope: 'cluster', clusterId: state.clusterId }
        : state.scope && state.scope !== 'all'
          ? { scope: state.scope }
          : {},
    }),
    [state, setScope]
  );

  return <ScopeContext value={value}>{children}</ScopeContext>;
}

export function useScopeContext() {
  const context = useContext(ScopeContext);
  if (!context) throw new Error('useScopeContext must be used within ScopeProvider');
  return context;
}
