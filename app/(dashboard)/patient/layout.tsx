import { DashboardLayout } from '@/components/DashboardLayout'
import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import { cookies } from 'next/headers'

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale: Locale = (cookieLocale === 'ar') ? 'ar' : 'en';

  return (
    <LocaleProvider locale={locale}>
      <AuthProvider>
        <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DashboardLayout role="patient">
            {children}
          </DashboardLayout>
        </div>
      </AuthProvider>
    </LocaleProvider>
  )
}
