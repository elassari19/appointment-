import { DashboardLayout } from '@/components/DashboardLayout'
import {LocaleProvider} from '@/contexts/LocaleContext';
import {AuthProvider} from '@/contexts/AuthContext';
import type {Locale} from '@/contexts/LocaleContext';
import { cookies } from 'next/headers'
import { getServerUser } from '@/lib/middleware/role-protection';
import { notFound } from 'next/navigation';
import { NotificationListener } from '@/components/NotificationListener';

export default async function DietitianDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale: Locale = (cookieLocale === 'ar') ? 'ar' : 'en';

  const user = await getServerUser();
  
  if (!user || !['doctor', 'admin'].includes(user.role)) {
    notFound();
  }

  return (
    <LocaleProvider locale={locale}>
      <AuthProvider>
        <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DashboardLayout role="doctor">
            {children}
          </DashboardLayout>
          <NotificationListener />
        </div>
      </AuthProvider>
    </LocaleProvider>
  )
}
