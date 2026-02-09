'use client'

import { 
  UserIcon, 
  CalendarIcon, 
  FileTextIcon, 
  SettingsIcon, 
  LogOutIcon,
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  MenuIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
    { label: 'Dashboard', href: '/patient', icon: HomeIcon },
    { label: 'Book Appointment', href: '/patient/book', icon: CalendarIcon },
    { label: 'My Appointments', href: '/patient/appointments', icon: CalendarIcon },
    { label: 'Health Records', href: '/patient/records', icon: FileTextIcon },
    { label: 'Profile', href: '/patient/profile', icon: UserIcon },
  ],
  dietitian: [
    { label: 'Dashboard', href: '/dietitian', icon: HomeIcon },
    { label: 'Schedule', href: '/dietitian/schedule', icon: CalendarIcon },
    { label: 'My Patients', href: '/dietitian/patients', icon: UsersIcon },
    { label: 'Appointments', href: '/dietitian/appointments', icon: CalendarIcon },
    { label: 'Profile', href: '/dietitian/profile', icon: UserIcon },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: HomeIcon },
    { label: 'Patient Management', href: '/admin/patients', icon: UsersIcon },
    { label: 'Dietitian Management', href: '/admin/dietitians', icon: BriefcaseIcon },
    { label: 'Appointments', href: '/admin/appointments', icon: CalendarIcon },
    { label: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { label: 'System Security', href: '/admin/security', icon: ShieldCheckIcon },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
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
                  <HugeiconsIcon icon={item.icon} className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500">
          <HugeiconsIcon icon={LogOutIcon} className="mr-2 h-4 w-4" />
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
          <HugeiconsIcon icon={MenuIcon} />
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
                      <HugeiconsIcon icon={item.icon} className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-2 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500">
              <HugeiconsIcon icon={LogOutIcon} className="mr-2 h-4 w-4" />
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