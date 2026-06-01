// ----------------------------------------------------------------------
// Helperهای کار با Response Envelope استاندارد بک‌اند V2 (design §7.1).
//
//   موفق: { meta: { status: 'success', timestamp }, data }
//   خطا : { meta: { status: 'error', timestamp }, error: { code, message, details } }
//
// این helperها به‌صورت backward-compatible طراحی شده‌اند: اگر پاسخی هنوز به شکل
// envelope V2 نباشد (پاسخ خام legacy در دورهٔ گذار)، همان مقدار خام بازگردانده
// می‌شود تا callerهای فعلی نشکنند.
// ----------------------------------------------------------------------

import {
  ERROR_CODES,
  getErrorMessage,
  isRetryableErrorCode,
  GENERIC_ERROR_MESSAGE,
} from './error-messages';

// ----------------------------------------------------------------------
// مقادیر پیش‌فرض صفحه‌بندی (هم‌خوان با قرارداد بک‌اند V2: pageSize پیش‌فرض ۲۰).
const DEFAULT_LIST_PAGE = 1;
const DEFAULT_LIST_PAGE_SIZE = 20;
// ----------------------------------------------------------------------

/**
 * تشخیص می‌دهد که آیا یک payload یک envelope موفق V2 است.
 * شرط: شیء بوده و `meta.status === 'success'` و دارای کلید `data` باشد.
 *
 * @param {unknown} payload
 * @returns {boolean}
 */
export function isSuccessEnvelope(payload) {
  return (
    !!payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    !!payload.meta &&
    payload.meta.status === 'success' &&
    'data' in payload
  );
}

/**
 * تشخیص می‌دهد که آیا یک payload یک envelope خطای V2 است.
 *
 * @param {unknown} payload
 * @returns {boolean}
 */
export function isErrorEnvelope(payload) {
  return (
    !!payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    !!payload.meta &&
    payload.meta.status === 'error' &&
    !!payload.error
  );
}

/**
 * اگر payload یک envelope موفق V2 باشد، فیلد `data` آن را برمی‌گرداند؛ در غیر
 * این صورت همان payload خام بازگردانده می‌شود (سازگاری با پاسخ‌های legacy).
 *
 * این تابع نسبت به ورودی‌های null/undefined و آرایه‌ها مقاوم است.
 *
 * @template T
 * @param {T} payload
 * @returns {T | any} مقدار `data` در صورت envelope بودن، وگرنه خود payload
 */
export function unwrapEnvelope(payload) {
  if (isSuccessEnvelope(payload)) {
    return payload.data;
  }
  return payload;
}

/**
 * یک نتیجهٔ لیستی را به آرایهٔ آیتم‌ها نرمال می‌کند (Requirement 12.5, 12.7).
 *
 * این تابع نسبت به سه شکل ممکن در دورهٔ گذار مقاوم است:
 *   1) envelope V2 صفحه‌بندی‌شده → `data` به شکل `{ items, total, page, pageSize }`
 *   2) پاسخ legacy صفحه‌بندی‌شده → `{ data, total, page, limit }`
 *   3) آرایهٔ خام (`[...]`) یا envelope حاوی آرایه
 *
 * همیشه یک آرایه برمی‌گرداند (هرگز undefined)، بنابراین callerهایی که `.map`
 * می‌زنند یا `|| []` می‌گذارند بدون تغییر کار می‌کنند.
 *
 * @param {unknown} payload پاسخ خام (envelope V2 یا legacy)
 * @returns {any[]}
 */
export function extractItems(payload) {
  const data = unwrapEnvelope(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) return data.items; // V2 paginated
    if (Array.isArray(data.data)) return data.data; // legacy paginated
  }
  return [];
}

/**
 * @typedef {Object} NormalizedPage
 * @property {any[]} items آرایهٔ آیتم‌های صفحهٔ جاری (شکل استاندارد V2)
 * @property {any[]} data نام مستعار `items` برای سازگاری عقب‌رو با viewهای legacy
 * @property {number} total تعداد کل رکوردها
 * @property {number} page شمارهٔ صفحهٔ مؤثر
 * @property {number} pageSize اندازهٔ صفحهٔ مؤثر (شکل V2)
 * @property {number} limit نام مستعار `pageSize` برای سازگاری عقب‌رو
 */

/**
 * یک نتیجهٔ لیستی را به یک شیء صفحه‌بندی نرمال می‌کند که هم‌زمان شکل V2
 * (`items`/`pageSize`) و شکل legacy (`data`/`limit`) را در خود دارد
 * (Requirement 12.5, 12.7).
 *
 * این کار اجازه می‌دهد viewهای فعلی که `result.data` و `result.total` را
 * می‌خوانند بدون تغییر کار کنند، در حالی که کد جدید می‌تواند `result.items`
 * (هم‌خوان با `ActionStateView`) را بخواند. هر دو نام به یک آرایهٔ واحد اشاره
 * می‌کنند.
 *
 * @param {unknown} payload پاسخ خام (envelope V2 یا legacy)
 * @returns {NormalizedPage}
 */
export function normalizePage(payload) {
  const data = unwrapEnvelope(payload);
  const items = extractItems(payload);

  // مقادیر total/page/pageSize را از شیء استخراج می‌کنیم (با fallback معقول).
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const total = typeof source.total === 'number' ? source.total : items.length;
  const page = source.page ?? DEFAULT_LIST_PAGE;
  const pageSize = source.pageSize ?? source.limit ?? (items.length || DEFAULT_LIST_PAGE_SIZE);

  return {
    ...(Array.isArray(data) ? {} : source),
    items,
    data: items,
    total,
    page,
    pageSize,
    limit: pageSize,
  };
}

/**
 * کد HTTP را به یک کد خطای نمادین نگاشت می‌کند (fallback زمانی که بدنهٔ پاسخ
 * envelope خطای V2 نباشد، مثلاً پاسخ‌های legacy یا خطاهای زیرساختی).
 *
 * @param {number} [status] کد وضعیت HTTP
 * @returns {string} کد نمادین خطا
 */
export function mapStatusToErrorCode(status) {
  switch (status) {
    case 400:
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 429:
      return ERROR_CODES.RATE_LIMITED;
    default:
      return ERROR_CODES.INTERNAL_ERROR;
  }
}

/**
 * @typedef {Object} ApiError
 * @property {string} code کد نمادین خطا (همیشه مقداردهی می‌شود)
 * @property {string} message پیام فارسی کاربرپسند (همیشه مقداردهی می‌شود)
 * @property {Object|null} details جزئیات اختیاری فیلدمحور (مثلاً خطاهای اعتبارسنجی)
 * @property {boolean} retryable آیا تلاش مجدد برای این خطا منطقی است
 * @property {number} [status] کد وضعیت HTTP در صورت وجود
 */

/**
 * از یک خطای axios (یا هر خطای پرتاب‌شده) یک `ApiError` نرمال‌شده استخراج می‌کند.
 *
 * ترتیب اولویت استخراج کد:
 *   1) `error.error.code` از envelope خطای V2 در بدنهٔ پاسخ
 *   2) `error.code` که interceptor به Error غنی‌شده الصاق کرده است
 *   3) نگاشت از روی `error.response.status` (HTTP)
 *   4) در نبود پاسخ سرور: `NETWORK_ERROR`
 *
 * پیام نمایش‌داده‌شده همیشه فارسی است (از نگاشت کد). پیام انگلیسی سرور هرگز
 * مستقیم به کاربر نشت نمی‌کند، اما در صورت نیاز در `details` قابل دسترسی است.
 *
 * @param {unknown} err خطای دریافتی (معمولاً از catch یک فراخوانی axios)
 * @returns {ApiError}
 */
export function extractApiError(err) {
  const response = err?.response;
  const body = response?.data;
  const status = response?.status;

  // 1) envelope خطای استاندارد V2
  if (isErrorEnvelope(body)) {
    const code = body.error.code || mapStatusToErrorCode(status);
    return {
      code,
      message: getErrorMessage(code),
      details: body.error.details ?? null,
      retryable: isRetryableErrorCode(code),
      status,
    };
  }

  // 2) کد نمادینی که interceptor روی Error قرار داده است
  if (err?.code && typeof err.code === 'string' && getErrorMessage(err.code) !== GENERIC_ERROR_MESSAGE) {
    return {
      code: err.code,
      message: getErrorMessage(err.code),
      details: err.details ?? null,
      retryable: isRetryableErrorCode(err.code),
      status,
    };
  }

  // 3) پاسخ سرور وجود دارد ولی envelope نیست → نگاشت از HTTP status
  if (status != null) {
    const code = mapStatusToErrorCode(status);
    return {
      code,
      message: getErrorMessage(code),
      details: body && typeof body === 'object' ? (body.details ?? null) : null,
      retryable: isRetryableErrorCode(code),
      status,
    };
  }

  // 4) هیچ پاسخی از سرور نیامد (قطع شبکه/تایم‌اوت)
  return {
    code: ERROR_CODES.NETWORK_ERROR,
    message: getErrorMessage(ERROR_CODES.NETWORK_ERROR),
    details: null,
    retryable: true,
    status: undefined,
  };
}
