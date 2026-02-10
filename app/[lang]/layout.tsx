import {LocaleProvider} from '@/contexts/LocaleContext';
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
          <Header />
          <div>{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
