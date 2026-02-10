import type {Metadata} from "next";
import {Plus_Jakarta_Sans, Geist_Mono} from "next/font/google";
import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import Header from '@/components/header';
import BackgroundShapes from '@/components/BackgroundShapes';
import { cookies } from 'next/headers';
import "../globals.css";
  
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});
  
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
  
export const metadata: Metadata = {
  title: "PureMed+ | Modern Healthcare Services",
  description: "Expert healthcare services with compassionate, patient-centered care. Book appointments with top doctors and access comprehensive medical services.",
};
  
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale: Locale = (cookieLocale === 'ar') ? 'ar' : 'en';

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`scroll-smooth ${plusJakartaSans.variable}`}>
      <body className={`${plusJakartaSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <Header />
            <div>
              {children}
            </div>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}