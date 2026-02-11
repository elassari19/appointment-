'use client';

import { useState } from 'react';

const stats = [
  {
    label: 'Total Events',
    value: '24,592',
    icon: 'visibility',
    color: 'blue',
  },
  {
    label: 'Failed Logins',
    value: '142',
    icon: 'error_outline',
    color: 'amber',
  },
  {
    label: 'Staff Changes',
    value: '12',
    icon: 'person_add',
    color: 'green',
  },
  {
    label: 'Server Status',
    value: 'Healthy',
    icon: 'dns',
    color: 'purple',
    isStatus: true,
  },
];

const auditLogs = [
  {
    id: 1,
    timestamp: { date: 'Feb 24, 2026', time: '10:42:15 AM' },
    user: { name: 'Dr. Emily Chen', type: 'Doctor', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face' },
    action: 'Patient Record Updated',
    actionIcon: 'edit_note',
    status: 'Success',
    ip: '192.168.1.15',
  },
  {
    id: 2,
    timestamp: { date: 'Feb 24, 2026', time: '10:35:02 AM' },
    user: { name: 'Unknown', type: 'Public', hasAvatar: false },
    action: 'Failed Login Attempt',
    actionIcon: 'login',
    actionColor: 'text-amber-500',
    status: 'Denied',
    ip: '45.122.8.210',
  },
  {
    id: 3,
    timestamp: { date: 'Feb 24, 2026', time: '09:12:44 AM' },
    user: { name: 'Admin Sarah', type: 'Admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    action: 'Doctor Profile Created',
    actionIcon: 'person_add',
    status: 'Success',
    ip: '192.168.1.5',
  },
  {
    id: 4,
    timestamp: { date: 'Feb 24, 2026', time: '08:55:20 AM' },
    user: { name: 'Martha Stewart', type: 'Reception', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    action: 'Settings Changed (Hours)',
    actionIcon: 'settings',
    status: 'Success',
    ip: '192.168.1.12',
  },
  {
    id: 5,
    timestamp: { date: 'Feb 24, 2026', time: '07:20:11 AM' },
    user: { name: 'System Core', type: 'Automated', isSystem: true },
    action: 'Database Backup Completed',
    actionIcon: 'backup',
    status: 'Success',
    ip: '::1 (Localhost)',
  },
];

const getStatusBadge = (status: string) => {
  const isSuccess = status === 'Success';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isSuccess
        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {status}
    </span>
  );
};

const getUserBadgeColor = (type: string) => {
  switch (type) {
    case 'Doctor':
      return 'text-blue-500';
    case 'Admin':
      return 'text-amber-600';
    case 'Reception':
      return 'text-purple-600';
    default:
      return 'text-slate-400';
  }
};

const getIconBgColor = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20';
    case 'amber':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20';
    case 'green':
      return 'bg-green-50 text-green-600 dark:bg-green-900/20';
    case 'purple':
      return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
  }
};

export default function AuditLogsPage() {
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [userType, setUserType] = useState('All User Types');
  const [eventType, setEventType] = useState('All Event Types');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="relative w-96">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search logs, actions, or IP addresses..."
            className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-full text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative">
            <span className="material-icons-outlined text-muted-foreground">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">Admin Sarah</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase">Super Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">System Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Review system activity and security events across the platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card p-5 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor(stat.color)}`}>
                  <span className="material-icons-outlined">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.isStatus ? 'text-green-500' : 'text-foreground'}`}>
                    {stat.value}
                  </p>
                  {stat.isStatus && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Healthy
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 flex gap-4 min-w-[300px]">
            <div className="relative flex-1">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">calendar_month</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary"
              >
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>
            <div className="relative flex-1">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">badge</span>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary"
              >
                <option>All User Types</option>
                <option>Administrators</option>
                <option>Doctors</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="relative flex-1">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">category</span>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary"
              >
                <option>All Event Types</option>
                <option>Authentication</option>
                <option>Patient Records</option>
                <option>System Config</option>
                <option>Financial</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
              <span className="material-icons-outlined text-sm">file_download</span>
              Export
            </button>
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action Taken</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-foreground">{log.timestamp.date}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {log.user.hasAvatar === false ? (
                          <span className="material-icons-outlined text-sm">person</span>
                        ) : log.user.isSystem ? (
                          <span className="material-icons-outlined text-sm">support_agent</span>
                        ) : (
                          <img src={log.user.avatar} alt={log.user.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.user.name}</p>
                        <p className={`text-[10px] font-bold uppercase ${getUserBadgeColor(log.user.type)}`}>
                          {log.user.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`material-icons-outlined text-sm ${log.actionColor || 'text-muted-foreground'}`}>
                        {log.actionIcon}
                      </span>
                      <span className="text-sm text-foreground">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{log.ip}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
                      <span className="material-icons-outlined text-muted-foreground group-hover:text-foreground">info</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground">1</span> to <span className="text-foreground">5</span> of <span className="text-foreground">12,490</span> results
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm font-medium cursor-not-allowed" disabled>Previous</button>
              <button className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-md text-sm font-bold">1</button>
              <button className="w-8 h-8 hover:bg-muted text-muted-foreground flex items-center justify-center rounded-md text-sm font-medium transition-colors">2</button>
              <button className="w-8 h-8 hover:bg-muted text-muted-foreground flex items-center justify-center rounded-md text-sm font-medium transition-colors">3</button>
              <span className="text-muted-foreground mx-1">...</span>
              <button className="w-8 h-8 hover:bg-muted text-muted-foreground flex items-center justify-center rounded-md text-sm font-medium transition-colors">450</button>
              <button className="px-3 py-1 bg-card border border-border text-muted-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Monitoring Badge */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce cursor-pointer">
        <div className="bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="material-icons-outlined text-primary dark:text-zinc-900">security</span>
          <span className="text-sm font-bold">Live Monitoring Active</span>
        </div>
      </div>
    </div>
  );
}
