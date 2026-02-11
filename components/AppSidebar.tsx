'use client'

import { NavLink } from "@/components/NavLink";
import Image from "next/image";

interface NavItem {
  title: string;
  url: string;
  icon: string;
  roles: UserRole[];
}

type UserRole = "admin" | "doctor" | "patient";

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: "grid_view", roles: ["admin", "doctor", "patient"] },
  { title: "Appointments", url: "/admin/appointments", icon: "calendar_today", roles: ["admin", "doctor", "patient"] },
  { title: "Patients", url: "/admin/patients", icon: "people_outline", roles: ["admin", "doctor"] },
  { title: "Doctors", url: "/admin/doctors", icon: "medication", roles: ["admin", "patient"] },
  { title: "Messages", url: "/admin/messages", icon: "chat_bubble_outline", roles: ["admin", "doctor", "patient"] },
];

const managementNav: NavItem[] = [
  { title: "Reports", url: "/admin/reports", icon: "bar_chart", roles: ["admin", "doctor"] },
  { title: "Staff", url: "/admin/staff", icon: "badge", roles: ["admin"] },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: "history_toggle_off", roles: ["admin"] },
  { title: "Settings", url: "/admin/settings", icon: "settings", roles: ["admin", "doctor", "patient"] },
];

interface AppSidebarProps {
  role?: UserRole;
}

export function AppSidebar({ role = "admin" }: AppSidebarProps) {
  const filteredMainNav = mainNav.filter((item) => item.roles.includes(role));
  const filteredManagementNav = managementNav.filter((item) => item.roles.includes(role));

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
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-primary-foreground font-bold text-sm">
            DM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground dark:text-white leading-tight truncate">
              Dr. Mitchell
            </p>
            <p className="text-[12px] text-muted-foreground">Administrator</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="material-icons-round">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
