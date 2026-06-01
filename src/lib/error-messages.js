// ----------------------------------------------------------------------
// نگاشت مرکزی کد خطای نمادین بک‌اند (envelope V2) به پیام فارسی کاربرپسند.
//
// بک‌اند V2 همهٔ خطاها را در قالب envelope زیر برمی‌گرداند (design §7.1 / §11.1):
//   { meta: { status: 'error', timestamp }, error: { code, message, details } }
//
// این فایل تنها مسئول «کد نمادین → پیام فارسی» است تا UI بتواند مطابق
// Requirement 14.3 یک پیام خطای معنادار فارسی نمایش دهد. منطق استخراج خطا از
// پاسخ axios در `src/lib/envelope.js` قرار دارد.
// ----------------------------------------------------------------------

/**
 * کدهای خطای نمادینی که بک‌اند V2 تولید می‌کند (هم‌سو با AllExceptionsFilter).
 * مقادیر رشته‌ای دقیقاً با کدهای سمت سرور یکی هستند.
 */
export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_TIMEOUT: 'AI_TIMEOUT',
  JOB_TASK_FAILED: 'JOB_TASK_FAILED',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  // کد سمت کلاینت برای زمانی که اصلاً پاسخی از سرور دریافت نشد (قطع شبکه/تایم‌اوت شبکه).
  NETWORK_ERROR: 'NETWORK_ERROR',
});

/**
 * پیام فارسی پیش‌فرض وقتی کد ناشناخته است یا اصلاً کدی در دست نیست.
 */
export const GENERIC_ERROR_MESSAGE = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';

/**
 * نگاشت کد نمادین → پیام فارسی کاربرپسند.
 */
export const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.VALIDATION_ERROR]: 'اطلاعات واردشده معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.',
  [ERROR_CODES.NOT_FOUND]: 'موردی که دنبال آن بودید یافت نشد.',
  [ERROR_CODES.UNAUTHORIZED]: 'برای ادامه باید وارد حساب کاربری شوید.',
  [ERROR_CODES.FORBIDDEN]: 'شما اجازهٔ دسترسی به این بخش را ندارید.',
  [ERROR_CODES.CONFLICT]: 'این عملیات با وضعیت فعلی داده‌ها تداخل دارد.',
  [ERROR_CODES.RATE_LIMITED]: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
  [ERROR_CODES.AI_PROVIDER_ERROR]:
    'سرویس هوش مصنوعی در حال حاضر پاسخ‌گو نیست. لطفاً دوباره تلاش کنید.',
  [ERROR_CODES.AI_TIMEOUT]: 'زمان پاسخ‌گویی سرویس هوش مصنوعی به پایان رسید. لطفاً دوباره تلاش کنید.',
  [ERROR_CODES.JOB_TASK_FAILED]:
    'اجرای یک یا چند وظیفه با خطا مواجه شد. می‌توانید موارد ناموفق را دوباره اجرا کنید.',
  [ERROR_CODES.INVALID_STATE_TRANSITION]: 'این تغییر وضعیت در حال حاضر مجاز نیست.',
  [ERROR_CODES.INTERNAL_ERROR]: 'خطای داخلی سرور رخ داد. لطفاً بعداً دوباره تلاش کنید.',
  [ERROR_CODES.NETWORK_ERROR]: 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.',
});

/**
 * کدهایی که تلاش مجدد (retry) برایشان منطقی است؛ خطاهای گذرا یا سمت سرور.
 * خطاهایی مانند VALIDATION_ERROR یا FORBIDDEN با retry حل نمی‌شوند و در این
 * مجموعه نیستند.
 */
export const RETRYABLE_ERROR_CODES = Object.freeze(
  new Set([
    ERROR_CODES.AI_PROVIDER_ERROR,
    ERROR_CODES.AI_TIMEOUT,
    ERROR_CODES.JOB_TASK_FAILED,
    ERROR_CODES.INTERNAL_ERROR,
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.RATE_LIMITED,
  ])
);

/**
 * پیام فارسی متناظر با یک کد نمادین را برمی‌گرداند؛ در صورت ناشناخته‌بودن کد،
 * پیام عمومی فارسی برگردانده می‌شود (هرگز رشتهٔ خام انگلیسی به کاربر نشت نمی‌کند).
 *
 * @param {string} [code] کد نمادین خطا
 * @returns {string} پیام فارسی
 */
export function getErrorMessage(code) {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return GENERIC_ERROR_MESSAGE;
}

/**
 * مشخص می‌کند آیا برای این کد خطا تلاش مجدد منطقی است یا خیر.
 *
 * @param {string} [code] کد نمادین خطا
 * @returns {boolean}
 */
export function isRetryableErrorCode(code) {
  return !!code && RETRYABLE_ERROR_CODES.has(code);
}
