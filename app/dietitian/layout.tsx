import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/dashboard-header'

export default function DietitianDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="dietitian" />
      <div className="flex flex-col flex-1 w-full">
        <Header role="dietitian" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}