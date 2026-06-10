import { redirect } from 'next/navigation';

// خوشه‌ها به بخش تعاریف منتقل شده‌اند — اصل و مبنا: /definitions/clusters/
export default function Page() {
  redirect('/dashboard/definitions/clusters');
}
