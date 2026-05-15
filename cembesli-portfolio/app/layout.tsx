// Top level root layout that lets next-intl handle locale aware nested layouts
// Renders the html shell so the [locale] layout can supply lang and providers
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
