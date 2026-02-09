'use client'

import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface HeaderProps {
  role: 'patient' | 'dietitian' | 'admin'
}

export function Header({ role }: HeaderProps) {
  return (
    <header className="border-b border-sidebar-border bg-background p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl md:text-2xl font-bold capitalize">{role} Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-8 w-40 md:w-64"
          />
        </div>

        <Button variant="ghost" size="icon" className="hidden md:block">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden md:inline capitalize">{role}</span>
        </div>
      </div>
    </header>
  )
}