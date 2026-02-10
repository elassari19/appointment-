import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/dashboard-header'
import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import { cookies } from 'next/headers'

export default async function DietitianDashboardLayout({
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
        <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen bg-background">
          <Sidebar role="dietitian" />
          <div className="flex flex-col flex-1 w-full">
            <Header role="dietitian" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </LocaleProvider>
  )
}