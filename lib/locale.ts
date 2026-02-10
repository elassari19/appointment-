import { headers } from 'next/headers';

export type Locale = 'en' | 'ar';

const locales: Locale[] = ['en', 'ar'];
const defaultLocale: Locale = 'en';

export async function getLocale(): Promise<Locale> {
  const headersList = await headers();
  const headerLocale = headersList.get('x-locale');
  if (headerLocale && locales.includes(headerLocale as Locale)) {
    return headerLocale as Locale;
  }
  return defaultLocale;
}

export async function isRTL(): Promise<boolean> {
  return (await getLocale()) === 'ar';
}

export async function getDirection(): Promise<'rtl' | 'ltr'> {
  return (await isRTL()) ? 'rtl' : 'ltr';
}

export function getDirectionSync(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
