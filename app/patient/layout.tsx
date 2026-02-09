import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/dashboard-header'

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="patient" />
      <div className="flex flex-col flex-1 w-full">
        <Header role="patient" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}