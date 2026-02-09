'use client'

import { 
  User, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Home, 
  Users, 
  Briefcase, 
  BarChart3, 
  ShieldCheck, 
  Menu 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps {
  role: 'patient' | 'dietitian' | 'admin'
}

const navItems = {
  patient: [
    { label: 'Dashboard', href: '/patient', icon: Home },
    { label: 'Book Appointment', href: '/patient/book', icon: Calendar },
    { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Health Records', href: '/patient/records', icon: FileText },
    { label: 'Profile', href: '/patient/profile', icon: User },
  ],
  dietitian: [
    { label: 'Dashboard', href: '/dietitian', icon: Home },
    { label: 'Schedule', href: '/dietitian/schedule', icon: Calendar },
    { label: 'My Patients', href: '/dietitian/patients', icon: Users },
    { label: 'Appointments', href: '/dietitian/appointments', icon: Calendar },
    { label: 'Profile', href: '/dietitian/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Patient Management', href: '/admin/patients', icon: Users },
    { label: 'Dietitian Management', href: '/admin/dietitians', icon: Briefcase },
    { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'System Security', href: '/admin/security', icon: ShieldCheck },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const items = navItems[role]
  
  // Desktop sidebar
  const DesktopSidebar = () => (
    <aside className="hidden md:flex md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-xl font-bold capitalize">{role} Dashboard</h2>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )

  // Mobile sidebar
  const MobileSidebar = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold capitalize">{role} Dashboard</h2>
          </div>
          
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-2 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}