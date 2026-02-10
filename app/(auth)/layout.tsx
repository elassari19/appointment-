import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import { cookies } from 'next/headers';
import BackgroundShapes from '@/components/BackgroundShapes';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale: Locale = (cookieLocale === 'ar') ? 'ar' : 'en';

  return (
    <LocaleProvider locale={locale}>
      <AuthProvider>
        <div 
          lang={locale} 
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/80 via-black/60 to-black/90 p-2 lg:p-8 relative overflow-hidden"
        >
          <BackgroundShapes />
          {children}
        </div>
      </AuthProvider>
    </LocaleProvider>
  );
}