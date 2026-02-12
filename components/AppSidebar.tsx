'use client'

import { useState, useRef, useEffect } from 'react';
import { NavLink } from "@/components/NavLink";
import Image from "next/image";
import { Bell, Globe, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useRouter } from 'next/navigation';

interface NavItem {
  title: string;
  url: string;
  icon: string;
  roles: UserRole[];
}

type UserRole = "admin" | "doctor" | "patient";

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: "grid_view", roles: ["admin"] },
  { title: "Dashboard", url: "/doctors", icon: "grid_view", roles: ["doctor"] },
  { title: "Dashboard", url: "/patient", icon: "grid_view", roles: ["patient"] },
  { title: "Appointments", url: "/admin/appointments", icon: "calendar_today", roles: ["admin"] },
  { title: "My Appointments", url: "/doctors/appointments", icon: "calendar_today", roles: ["doctor"] },
  { title: "My Appointments", url: "/patient/appointments", icon: "calendar_today", roles: ["patient"] },
  { title: "Book Appointment", url: "/patient/book", icon: "add_circle", roles: ["patient"] },
  { title: "My Availability", url: "/doctors/availability", icon: "schedule", roles: ["doctor"] },
  { title: "Patients", url: "/admin/patients", icon: "people_outline", roles: ["admin"] },
  { title: "Doctors", url: "/admin/doctors", icon: "medication", roles: ["admin"] },
  { title: "Profile", url: "/admin/profile", icon: "person", roles: ["admin"] },
  { title: "Profile", url: "/doctors/profile", icon: "person", roles: ["doctor"] },
  { title: "Profile", url: "/patient/profile", icon: "person", roles: ["patient"] },
];

const managementNav: NavItem[] = [
  { title: "Reports", url: "/admin/reports", icon: "bar_chart", roles: ["admin"] },
  { title: "Staff", url: "/admin/staff", icon: "badge", roles: ["admin"] },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: "history_toggle_off", roles: ["admin"] },
  { title: "Settings", url: "/admin/settings", icon: "settings", roles: ["admin"] },
];

interface AppSidebarProps {
  role?: UserRole;
}

export function AppSidebar({ role = "admin" }: AppSidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { user, logout, isAuthenticated } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();

  const filteredMainNav = mainNav.filter((item) => item.roles.includes(role));
  const filteredManagementNav = managementNav.filter((item) => item.roles.includes(role));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'Administrator';
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      default: return 'User';
    }
  };

  return (
    <aside className="w-64 bg-sidebar dark:bg-[#1a1d21] border-r border-sidebar-border dark:border-[#374151] flex-shrink-0 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-icons-round text-primary-foreground text-xl">medical_services</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground dark:text-white">MediCare</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
        {/* Main Section */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">
            Main
          </p>
          {filteredMainNav.map((item) => (
            <NavLink
              key={item.title}
              href={item.url}
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground dark:text-[#9ca3af] dark:hover:text-white transition-all rounded-xl"
              activeClassName="sidebar-item-active !text-foreground dark:!text-black"
            >
              <span className="material-icons-round">{item.icon}</span>
              <span className="font-medium text-sm">{item.title}</span>
            </NavLink>
          ))}
        </div>

        {/* Management Section */}
        {filteredManagementNav.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">
              Management
            </p>
            {filteredManagementNav.map((item) => (
              <NavLink
                key={item.title}
                href={item.url}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground dark:text-[#9ca3af] dark:hover:text-white transition-all rounded-xl"
                activeClassName="sidebar-item-active !text-foreground dark:!text-black"
              >
                <span className="material-icons-round">{item.icon}</span>
                <span className="font-medium text-sm">{item.title}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="mt-auto pt-6 border-t border-border dark:border-[#374151]">
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center gap-3 px-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-foreground dark:text-white leading-tight truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {user ? getRoleLabel(user.role) : 'User'}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg py-2 border border-border z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground">
                <User className="h-4 w-4" />
                {t('auth.profile')}
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground">
                <Settings className="h-4 w-4" />
                {t('auth.settings')}
              </button>
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
