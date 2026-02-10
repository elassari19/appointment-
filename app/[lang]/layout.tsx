import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import Header from '@/components/header';

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
            <div>{children}</div>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
