import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import Header from '@/components/header';
import BackgroundShapes from '@/components/BackgroundShapes';

export default async function LangLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;
  const locale: Locale = lang === 'ar' ? 'ar' : 'en';
 
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/80 via-black/60 to-black/90 p-2 lg:p-8 relative overflow-hidden">
              <BackgroundShapes />
              {children}
            </div>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
