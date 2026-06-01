'use client';

import { ErrorState } from './error-state';
import { EmptyState } from './empty-state';
import { LoadingState, LoadingSkeleton } from './loading-state';

// ----------------------------------------------------------------------
// combinator سه‌حالتی loading / error / empty (Requirement 14.2, 14.3, 14.4).
//
// یک wrapper سبک که ترتیب استاندارد نمایش حالت‌های یک نمای داده‌محور را اعمال
// می‌کند: ابتدا loading، سپس error (با retry)، سپس empty، و در نهایت محتوای اصلی.
// این primitive قرار است در task 9.3 توسط صفحات اصلی مصرف شود تا هر نما هر سه
// حالت کامل را داشته باشد.
// ----------------------------------------------------------------------

/**
 * تشخیص خالی بودن داده. آرایهٔ تهی، null/undefined و شیء envelope صفحه‌بندی با
 * items خالی، «خالی» محسوب می‌شوند.
 *
 * @param {unknown} data
 * @returns {boolean}
 */
function isEmptyData(data) {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  // پاسخ صفحه‌بندی استاندارد: { items, total, page, pageSize }
  if (typeof data === 'object' && Array.isArray(data.items)) {
    return data.items.length === 0;
  }
  return false;
}

/**
 * @param {object} props
 * @param {boolean} props.loading
 * @param {import('src/lib/envelope').ApiError | Error | string | null} [props.error]
 * @param {unknown} [props.data] دادهٔ نهایی برای تشخیص حالت خالی
 * @param {boolean} [props.isEmpty] override صریح حالت خالی (در صورت ارائه، جایگزین تشخیص خودکار می‌شود)
 * @param {() => void} [props.onRetry] هندلر retry برای حالت خطا
 * @param {boolean} [props.retrying]
 * @param {boolean} [props.skeleton] اگر true باشد، در حالت loading از skeleton استفاده می‌شود
 * @param {object} [props.loadingProps] props اضافی برای LoadingState/LoadingSkeleton
 * @param {object} [props.errorProps] props اضافی برای ErrorState
 * @param {object} [props.emptyProps] props اضافی برای EmptyState
 * @param {React.ReactNode} props.children محتوای اصلی هنگام وجود داده
 */
export function ActionStateView({
  loading,
  error,
  data,
  isEmpty,
  onRetry,
  retrying = false,
  skeleton = false,
  loadingProps,
  errorProps,
  emptyProps,
  children,
}) {
  if (loading) {
    return skeleton ? <LoadingSkeleton {...loadingProps} /> : <LoadingState {...loadingProps} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} retrying={retrying} {...errorProps} />;
  }

  const empty = typeof isEmpty === 'boolean' ? isEmpty : isEmptyData(data);
  if (empty) {
    return <EmptyState {...emptyProps} />;
  }

  return children;
}
