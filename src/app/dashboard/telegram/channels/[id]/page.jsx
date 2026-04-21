import { PageProfileView } from 'src/sections/pages/profile-view';

export const metadata = { title: 'پروفایل کانال' };

export default function Page({ params }) {
  return <PageProfileView id={params.id} />;
}
