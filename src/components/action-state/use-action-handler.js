'use client';

import { useRef, useState, useCallback } from 'react';

import { extractApiError } from 'src/lib/envelope';

// ----------------------------------------------------------------------
// هوک مدیریت حالت یک action ناهمگام (async).
//
// مسئولیت‌ها (Requirement 14.2 / 14.3):
//   - نگه‌داری حالت `loading` تا UI بتواند دکمه را disable و spinner نمایش دهد.
//   - جلوگیری از ارسال دوگانه: تا وقتی یک اجرا در جریان است، اجرای جدید نادیده
//     گرفته می‌شود.
//   - استخراج خطای نرمال‌شده (ApiError) از خطای axios برای نمایش پیام فارسی + retry.
// ----------------------------------------------------------------------

/**
 * @typedef {Object} UseActionHandlerOptions
 * @property {(result: any) => void} [onSuccess] callback پس از موفقیت
 * @property {(error: import('src/lib/envelope').ApiError) => void} [onError] callback پس از خطا
 * @property {boolean} [rethrow] اگر true باشد، پس از ثبت خطا دوباره پرتاب می‌شود (پیش‌فرض false)
 */

/**
 * یک action ناهمگام را در بر می‌گیرد و حالت loading/error آن را مدیریت می‌کند.
 *
 * @param {(...args: any[]) => Promise<any>} action تابع ناهمگامی که اجرا می‌شود
 * @param {UseActionHandlerOptions} [options]
 * @returns {{
 *   run: (...args: any[]) => Promise<any>,
 *   loading: boolean,
 *   error: import('src/lib/envelope').ApiError | null,
 *   reset: () => void,
 * }}
 */
export function useActionHandler(action, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // نگه‌داری آخرین مقادیر در ref تا `run` پایدار بماند و وابسته به هر render نشود.
  const actionRef = useRef(action);
  const optionsRef = useRef(options);
  const inFlightRef = useRef(false);
  actionRef.current = action;
  optionsRef.current = options;

  const run = useCallback(async (...args) => {
    // جلوگیری از ارسال دوگانه (double-submit).
    if (inFlightRef.current) {
      return undefined;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await actionRef.current(...args);
      optionsRef.current.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError);
      optionsRef.current.onError?.(apiError);
      if (optionsRef.current.rethrow) {
        throw err;
      }
      return undefined;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { run, loading, error, reset };
}
