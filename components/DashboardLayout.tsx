"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useState } from "react";

type UserRole = "admin" | "doctor" | "patient";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          {/* Desktop Sidebar */}
          <AppSidebar role={role} />
          
          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <AppSidebar role={role} />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
