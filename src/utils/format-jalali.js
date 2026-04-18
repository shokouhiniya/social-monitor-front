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
