'use client';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

/**
 * Scope context — controls which subset of the network drives the dashboards.
 *
 * مقادیر scope:
 *  - 'all'                          → کل شبکه (بدون فیلتر)
 *  - 'representatives'              → پیج‌های is_representative (قدیمی)
 *  - 'cluster'                      → پیج‌های یک خوشه (نیاز به clusterId)
 *  - 'cluster-representatives'      → نمایندگان خوشه (میکرورسانه is_cluster_representative)
 *                                     + clusterId اختیاری برای فیلتر یک خوشه خاص
 *  - 'identity:<title>'             → میکرورسانه‌های یک هویت خاص
 *  - 'identity-representatives'     → نمایندگان هویت (is_identity_representative)
 *  - 'identity-representatives:<title>' → نمایندگان یک هویت خاص
 */

const ScopeContext = createContext(undefined);

const STORAGE_KEY = 'dashboard_scope';

function readInitialScope() {
  if (typeof window === 'undefined')
    return { scope: 'cluster-representatives', clusterId: null, identityTitle: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { scope: 'cluster-representatives', clusterId: null, identityTitle: null };
    const parsed = JSON.parse(raw);
    return {
      scope: parsed?.scope || 'cluster-representatives',
      clusterId: parsed?.clusterId ?? null,
      identityTitle: parsed?.identityTitle ?? null,
    };
  } catch {
    return { scope: 'cluster-representatives', clusterId: null, identityTitle: null };
  }
}

function buildParams(scope, clusterId, identityTitle) {
  if (scope === 'cluster' && clusterId) {
    return { scope: 'cluster', clusterId };
  }
  if (scope === 'cluster-representatives' && clusterId) {
    return { scope: 'cluster-representatives', clusterId };
  }
  if (scope === 'cluster-representatives') {
    return { scope: 'cluster-representatives' };
  }
  if (scope === 'identity' && identityTitle) {
    return { scope: `identity:${encodeURIComponent(identityTitle)}` };
  }
  if (scope === 'identity-representatives' && identityTitle) {
    return { scope: `identity-representatives:${encodeURIComponent(identityTitle)}` };
  }
  if (scope === 'identity-representatives') {
    return { scope: 'identity-representatives' };
  }
  if (scope && scope !== 'all') {
    return { scope };
  }
  return { __noScope: true };
}

export function ScopeProvider({ children }) {
  const [state, setState] = useState(readInitialScope);

  const setScope = useCallback((scope, { clusterId = null, identityTitle = null } = {}) => {
    const next = { scope, clusterId, identityTitle };
    setState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const value = useMemo(
    () => ({
      scope: state.scope,
      clusterId: state.clusterId,
      identityTitle: state.identityTitle,
      setScope,
      params: buildParams(state.scope, state.clusterId, state.identityTitle),
    }),
    [state, setScope],
  );

  return <ScopeContext value={value}>{children}</ScopeContext>;
}

export function useScopeContext() {
  const context = useContext(ScopeContext);
  if (!context) throw new Error('useScopeContext must be used within ScopeProvider');
  return context;
}

/**
 * StaticScopeProvider — scope ثابت برای صفحات تحلیل (بدون localStorage).
 */
export function StaticScopeProvider({ scope, clusterId = null, identityTitle = null, children }) {
  const value = useMemo(
    () => ({
      scope,
      clusterId,
      identityTitle,
      setScope: () => {},
      params: buildParams(scope, clusterId, identityTitle),
    }),
    [scope, clusterId, identityTitle],
  );
  return <ScopeContext value={value}>{children}</ScopeContext>;
}
