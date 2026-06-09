import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

export function toJalali(date) {
  if (!date) return '—';
  try {
    return dayjs(date).calendar('jalali').locale('fa').format('YYYY/MM/DD HH:mm');
  } catch {
    return new Date(date).toLocaleDateString('fa-IR');
  }
}

export function toJalaliDate(date) {
  if (!date) return '—';
  try {
    return dayjs(date).calendar('jalali').locale('fa').format('YYYY/MM/DD');
  } catch {
    return new Date(date).toLocaleDateString('fa-IR');
  }
}

export function toJalaliShort(date) {
  if (!date) return '—';
  try {
    return dayjs(date).calendar('jalali').locale('fa').format('MM/DD HH:mm');
  } catch {
    return '—';
  }
}

// ----------------------------------------------------------------------
// کمک‌تابع‌های انتخاب دوره (سال/ماه شمسی) — برای ثبت امتیاز دوره‌ای.
// ----------------------------------------------------------------------

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** سال و ماه شمسیِ جاری: { jy, jm } (jm از 1 تا 12). */
export function jalaliNow() {
  const d = dayjs().calendar('jalali');
  return { jy: d.year(), jm: d.month() + 1 };
}

/**
 * تبدیل سال/ماه شمسی به تاریخ میلادیِ اولِ همان ماه به‌صورت ISO `YYYY-MM-DD`.
 * برای ذخیرهٔ `period_start` در بک‌اند استفاده می‌شود.
 */
export function jalaliMonthToGregorianISO(jy, jm) {
  try {
    const g = dayjs(`${jy}/${jm}/1`, { jalali: true }).calendar('gregory');
    return g.format('YYYY-MM-DD');
  } catch {
    return `${jy}-${String(jm).padStart(2, '0')}-01`;
  }
}

/** فهرست سال‌های شمسی برای dropdown (از 5 سال قبل تا سال جاری). */
export function jalaliYearOptions(span = 6) {
  const { jy } = jalaliNow();
  return Array.from({ length: span }, (_, i) => jy - (span - 1) + i);
}

// ----------------------------------------------------------------------
// کمک‌تابع‌های انتخاب تاریخ کامل شمسی (سال/ماه/روز) — برای ثبت تعامل و ...
// ----------------------------------------------------------------------

/** اجزای تاریخ شمسیِ یک تاریخ (میلادی/ISO): { jy, jm, jd } (jm و jd از 1 شروع می‌شوند). */
export function dateToJalaliParts(date) {
  const d = (date ? dayjs(date) : dayjs()).calendar('jalali');
  return { jy: d.year(), jm: d.month() + 1, jd: d.date() };
}

/** تبدیل سال/ماه/روز شمسی به تاریخ میلادی ISO `YYYY-MM-DD`. */
export function jalaliToGregorianISO(jy, jm, jd) {
  try {
    const g = dayjs(`${jy}/${jm}/${jd}`, { jalali: true }).calendar('gregory');
    return g.format('YYYY-MM-DD');
  } catch {
    return null;
  }
}

/** تعداد روزهای یک ماه شمسی (با در نظر گرفتن سال کبیسه برای اسفند). */
export function jalaliDaysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // اسفند: بررسی کبیسه بودن سال
  try {
    const d = dayjs(`${jy}/12/30`, { jalali: true }).calendar('jalali');
    return d.month() === 11 && d.date() === 30 ? 30 : 29;
  } catch {
    return 29;
  }
}
