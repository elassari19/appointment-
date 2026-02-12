'use client';

import { useState } from 'react';

const staff = [
  {
    id: '#ST-001',
    name: 'Emma Thompson',
    role: 'Nurse',
    department: 'General',
    email: 'emma.t@medicare.com',
    phone: '+1 (555) 444-5555',
    status: 'Active',
    joinDate: 'Jan 15, 2024',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#ST-002',
    name: 'Robert Chen',
    role: 'Receptionist',
    department: 'Front Desk',
    email: 'robert.c@medicare.com',
    phone: '+1 (555) 555-6666',
    status: 'Active',
    joinDate: 'Mar 20, 2024',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#ST-003',
    name: 'Lisa Anderson',
    role: 'Lab Technician',
    department: 'Laboratory',
    email: 'lisa.a@medicare.com',
    phone: '+1 (555) 666-7777',
    status: 'On Leave',
    joinDate: 'Jun 10, 2023',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#ST-004',
    name: 'John Martinez',
    role: 'Nurse',
    department: 'General',
    email: 'john.m@medicare.com',
    phone: '+1 (555) 777-8888',
    status: 'Active',
    joinDate: 'Aug 5, 2023',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
];

const getStatusBadge = (status: string) => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
      On Leave
    </span>
  );
};

export default function StaffPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Staff Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage clinic staff and employees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              type="text"
              placeholder="Search staff..."
              className="pl-10 pr-4 py-2.5 w-64 bg-card border-border rounded-xl text-sm border focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <span className="material-icons-round text-lg">add</span>
            <span>Add Staff</span>
          </button>
        </div>
      </header>

      {/* Staff Table */}
      <div className="bg-card rounded-3xl shadow-sm border border-border flex flex-col overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Join Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((member) => (
                <tr key={member.id} className="group hover:bg-muted/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{member.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{member.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{member.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{member.joinDate}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-icons-round text-lg">visibility</span>
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-icons-round text-lg">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
