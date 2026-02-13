import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import Header from '@/components/header';
import BackgroundShapes from '@/components/BackgroundShapes';
import { cookies } from 'next/headers';
  
export default async function BrowserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale: Locale = (cookieLocale === 'ar') ? 'ar' : 'en';

  return (
    <>
      <LocaleProvider locale={locale}>
        <AuthProvider>
          <Header />
          <div>
            {children}
          </div>
        </AuthProvider>
      </LocaleProvider>
    </>
  );
}