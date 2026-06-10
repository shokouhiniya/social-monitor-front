import { redirect } from 'next/navigation';

// جزئیات خوشه به بخش تعاریف منتقل شده‌اند
export default function Page({ params }) {
  redirect(`/dashboard/definitions/clusters/${params.id}`);
}
