import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/dashboard-header'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <div className="flex flex-col flex-1 w-full">
        <Header role="admin" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}