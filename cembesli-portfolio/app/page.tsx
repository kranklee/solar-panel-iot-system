// Root index that redirects to the default locale segment of the App Router
// Keeps the URL clean while delegating rendering to the locale aware page
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function RootPage(): never {
  redirect(`/${defaultLocale}`);
}
