import { test, assert } from 'vitest';

import {
  ERROR_CODES,
  getErrorMessage,
  isRetryableErrorCode,
  GENERIC_ERROR_MESSAGE,
} from './error-messages';
import {
  extractItems,
  normalizePage,
  unwrapEnvelope,
  isErrorEnvelope,
  extractApiError,
  isSuccessEnvelope,
  mapStatusToErrorCode,
} from './envelope';

// ----------------------------------------------------------------------
// تست واحد برای helperهای envelope و نگاشت پیام خطا (Requirement 14.3).
// بدون mock — فقط منطق خالص.
// اجرا: yarn test
// ----------------------------------------------------------------------

const successEnvelope = {
  meta: { status: 'success', timestamp: '2025-01-01T10:00:00.000Z' },
  data: { id: 1, name: 'منبع' },
};

const errorEnvelope = {
  meta: { status: 'error', timestamp: '2025-01-01T10:00:00.000Z' },
  error: { code: 'NOT_FOUND', message: 'not found', details: { id: 1 } },
};

test('isSuccessEnvelope تشخیص درست envelope موفق', () => {
  assert.equal(isSuccessEnvelope(successEnvelope), true);
  assert.equal(isSuccessEnvelope(errorEnvelope), false);
  assert.equal(isSuccessEnvelope(null), false);
  assert.equal(isSuccessEnvelope([1, 2, 3]), false);
  assert.equal(isSuccessEnvelope({ foo: 'bar' }), false);
});

test('isErrorEnvelope تشخیص درست envelope خطا', () => {
  assert.equal(isErrorEnvelope(errorEnvelope), true);
  assert.equal(isErrorEnvelope(successEnvelope), false);
  assert.equal(isErrorEnvelope(undefined), false);
});

test('unwrapEnvelope مقدار data را از envelope موفق برمی‌گرداند', () => {
  assert.deepEqual(unwrapEnvelope(successEnvelope), { id: 1, name: 'منبع' });
});

test('unwrapEnvelope سازگاری عقب‌رو: پاسخ خام legacy را دست‌نخورده برمی‌گرداند', () => {
  const legacyArray = [{ id: 1 }, { id: 2 }];
  const legacyObject = { id: 9, title: 'بدون envelope' };
  assert.deepEqual(unwrapEnvelope(legacyArray), legacyArray);
  assert.deepEqual(unwrapEnvelope(legacyObject), legacyObject);
  assert.equal(unwrapEnvelope(null), null);
  assert.equal(unwrapEnvelope(42), 42);
});

// ----------------------------------------------------------------------
// تست‌های نرمال‌سازی لیست/صفحه‌بندی (Requirement 12.5/12.7).
// ----------------------------------------------------------------------

test('extractItems آرایه از envelope صفحه‌بندی‌شدهٔ V2 (items) را برمی‌گرداند', () => {
  const v2Paginated = {
    meta: { status: 'success', timestamp: '2025-01-01T10:00:00.000Z' },
    data: { items: [{ id: 1 }, { id: 2 }], total: 2, page: 1, pageSize: 20 },
  };
  assert.deepEqual(extractItems(v2Paginated), [{ id: 1 }, { id: 2 }]);
});

test('extractItems از پاسخ legacy صفحه‌بندی (data) آرایه می‌سازد', () => {
  const legacyPaginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
  assert.deepEqual(extractItems(legacyPaginated), [{ id: 1 }]);
});

test('extractItems از آرایهٔ خام و envelope حاوی آرایه آرایه می‌سازد', () => {
  assert.deepEqual(extractItems([{ id: 5 }]), [{ id: 5 }]);
  const v2Array = {
    meta: { status: 'success', timestamp: '2025-01-01T10:00:00.000Z' },
    data: [{ id: 7 }],
  };
  assert.deepEqual(extractItems(v2Array), [{ id: 7 }]);
});

test('extractItems برای ورودی نامعتبر همیشه آرایهٔ تهی می‌دهد', () => {
  assert.deepEqual(extractItems(null), []);
  assert.deepEqual(extractItems(undefined), []);
  assert.deepEqual(extractItems(42), []);
  assert.deepEqual(extractItems({ foo: 'bar' }), []);
});

test('normalizePage هم items (V2) و هم data (legacy) را به یک آرایه می‌دهد', () => {
  const v2Paginated = {
    meta: { status: 'success', timestamp: '2025-01-01T10:00:00.000Z' },
    data: { items: [{ id: 1 }, { id: 2 }], total: 5, page: 2, pageSize: 2 },
  };
  const norm = normalizePage(v2Paginated);
  assert.deepEqual(norm.items, [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(norm.data, [{ id: 1 }, { id: 2 }]); // alias سازگاری عقب‌رو
  assert.equal(norm.total, 5);
  assert.equal(norm.page, 2);
  assert.equal(norm.pageSize, 2);
  assert.equal(norm.limit, 2); // alias legacy
});

test('normalizePage پاسخ legacy { data, total, limit } را نرمال می‌کند', () => {
  const legacyPaginated = { data: [{ id: 1 }], total: 1, page: 1, limit: 20 };
  const norm = normalizePage(legacyPaginated);
  assert.deepEqual(norm.items, [{ id: 1 }]);
  assert.deepEqual(norm.data, [{ id: 1 }]);
  assert.equal(norm.total, 1);
  assert.equal(norm.pageSize, 20);
});

test('normalizePage برای آرایهٔ خام total را برابر طول آرایه می‌گذارد', () => {
  const norm = normalizePage([{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.deepEqual(norm.items, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.equal(norm.total, 3);
});

test('mapStatusToErrorCode نگاشت HTTP به کد نمادین', () => {
  assert.equal(mapStatusToErrorCode(400), ERROR_CODES.VALIDATION_ERROR);
  assert.equal(mapStatusToErrorCode(401), ERROR_CODES.UNAUTHORIZED);
  assert.equal(mapStatusToErrorCode(403), ERROR_CODES.FORBIDDEN);
  assert.equal(mapStatusToErrorCode(404), ERROR_CODES.NOT_FOUND);
  assert.equal(mapStatusToErrorCode(409), ERROR_CODES.CONFLICT);
  assert.equal(mapStatusToErrorCode(429), ERROR_CODES.RATE_LIMITED);
  assert.equal(mapStatusToErrorCode(500), ERROR_CODES.INTERNAL_ERROR);
  assert.equal(mapStatusToErrorCode(undefined), ERROR_CODES.INTERNAL_ERROR);
});

test('extractApiError از envelope خطای V2 کد و پیام فارسی استخراج می‌کند', () => {
  const err = { response: { status: 404, data: errorEnvelope } };
  const apiError = extractApiError(err);
  assert.equal(apiError.code, 'NOT_FOUND');
  assert.equal(apiError.message, getErrorMessage('NOT_FOUND'));
  assert.deepEqual(apiError.details, { id: 1 });
  assert.equal(apiError.retryable, false);
  assert.equal(apiError.status, 404);
});

test('extractApiError برای AI_TIMEOUT خطا را قابل‌تکرار می‌داند', () => {
  const err = {
    response: {
      status: 504,
      data: {
        meta: { status: 'error', timestamp: '2025-01-01T10:00:00.000Z' },
        error: { code: 'AI_TIMEOUT', message: 'timeout' },
      },
    },
  };
  const apiError = extractApiError(err);
  assert.equal(apiError.code, 'AI_TIMEOUT');
  assert.equal(apiError.retryable, true);
});

test('extractApiError سازگاری عقب‌رو: پاسخ legacy بدون envelope از HTTP status نگاشت می‌شود', () => {
  const err = { response: { status: 403, data: { message: 'Forbidden' } } };
  const apiError = extractApiError(err);
  assert.equal(apiError.code, ERROR_CODES.FORBIDDEN);
  assert.equal(apiError.message, getErrorMessage(ERROR_CODES.FORBIDDEN));
  assert.equal(apiError.retryable, false);
});

test('extractApiError از Error غنی‌شدهٔ interceptor کد را می‌خواند', () => {
  const enriched = new Error('Something went wrong');
  enriched.code = ERROR_CODES.CONFLICT;
  const apiError = extractApiError(enriched);
  assert.equal(apiError.code, ERROR_CODES.CONFLICT);
  assert.equal(apiError.message, getErrorMessage(ERROR_CODES.CONFLICT));
});

test('extractApiError نبود پاسخ سرور → NETWORK_ERROR قابل‌تکرار', () => {
  const err = new Error('Network Error');
  const apiError = extractApiError(err);
  assert.equal(apiError.code, ERROR_CODES.NETWORK_ERROR);
  assert.equal(apiError.retryable, true);
  assert.equal(apiError.status, undefined);
});

test('getErrorMessage برای کد ناشناخته پیام عمومی فارسی برمی‌گرداند', () => {
  assert.equal(getErrorMessage('SOMETHING_UNKNOWN'), GENERIC_ERROR_MESSAGE);
  assert.equal(getErrorMessage(undefined), GENERIC_ERROR_MESSAGE);
  assert.notEqual(getErrorMessage(ERROR_CODES.VALIDATION_ERROR), GENERIC_ERROR_MESSAGE);
});

test('isRetryableErrorCode فقط برای کدهای گذرا true است', () => {
  assert.equal(isRetryableErrorCode(ERROR_CODES.AI_PROVIDER_ERROR), true);
  assert.equal(isRetryableErrorCode(ERROR_CODES.INTERNAL_ERROR), true);
  assert.equal(isRetryableErrorCode(ERROR_CODES.VALIDATION_ERROR), false);
  assert.equal(isRetryableErrorCode(ERROR_CODES.FORBIDDEN), false);
  assert.equal(isRetryableErrorCode(undefined), false);
});
