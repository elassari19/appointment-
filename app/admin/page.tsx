'use client';

import { useState } from 'react';

// Mock stats data
const stats = [
  {
    label: 'Total Patients',
    value: '1,284',
    change: '+12%',
    icon: 'group',
    color: 'primary',
  },
  {
    label: 'Total Doctors',
    value: '42',
    change: '+3',
    icon: 'medical_information',
    color: 'emerald',
  },
  {
    label: 'Appointments',
    value: '356',
    change: '+8%',
    icon: 'calendar_month',
    color: 'amber',
  },
  {
    label: 'Total Revenue',
    value: '$42,500',
    change: '+15%',
    icon: 'payments',
    color: 'blue',
  },
];

// Mock activity data
const recentActivity = [
  {
    action: 'New patient registered',
    detail: 'Sarah Johnson joined the platform',
    time: '09:30 AM',
    icon: 'person_add',
    color: 'primary',
  },
  {
    action: 'Appointment Confirmed',
    detail: 'Dr. Mitchell confirmed appointment #4402',
    time: '10:15 AM',
    icon: 'check_circle',
    color: 'emerald',
  },
  {
    action: 'Security Audit',
    detail: 'Admin performed routine data backup',
    time: '11:00 AM',
    icon: 'shield',
    color: 'amber',
  },
];

// Mock staff data
const staffMembers = [
  {
    name: 'Dr. Emily Chen',
    email: 'emily.c@medicare.com',
    specialty: 'Pediatrician',
    status: 'Active',
    dateJoined: 'Jan 12, 2024',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Dr. James Wilson',
    email: 'j.wilson@medicare.com',
    specialty: 'Neurologist',
    status: 'On Leave',
    dateJoined: 'Feb 02, 2024',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  },
];

const filterPills = [
  { label: 'Pending', percent: '15%', active: false, color: 'dark' },
  { label: 'Confirmed', percent: '72%', active: true, color: 'primary' },
  { label: 'Completed', percent: '60%', active: false, color: 'default' },
  { label: 'Cancelled', percent: '8%', active: false, color: 'default' },
];

const weekDays = [
  { day: 'Mon', height: 64, color: 'dark' },
  { day: 'Tue', height: 70, color: 'primary' },
  { day: 'Wed', height: 80, color: 'dark' },
  { day: 'Thu', height: 90, color: 'primary' },
  { day: 'Fri', height: 96, color: 'dark' },
  { day: 'Sat', height: 48, color: 'primary' },
  { day: 'Sun', height: 32, color: 'dark' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'On Leave':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getIconBgColor = (color: string) => {
  switch (color) {
    case 'primary':
      return 'bg-primary/10 text-primary';
    case 'emerald':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'amber':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'blue':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Confirmed');

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's a snapshot of the platform's performance today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl w-64 outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button className="w-11 h-11 flex items-center justify-center bg-card border border-border rounded-xl hover:bg-muted transition-all relative">
            <span className="material-icons-round text-muted-foreground">notifications</span>
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground">A</div>
        </div>
      </header>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filterPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => setActiveFilter(pill.label)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              pill.label === activeFilter
                ? pill.color === 'primary'
                  ? 'bg-primary text-primary-foreground'
                  : pill.color === 'dark'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-card border border-border'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            {pill.label} <span className="opacity-70">{pill.percent}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBgColor(stat.color)}`}>
                <span className="material-icons-round">{stat.icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-bold flex items-center">
                <span className="material-icons-round text-xs">trending_up</span> {stat.change}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-card p-8 rounded-[2rem] border border-border/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-foreground">Appointment Trends</h2>
              <p className="text-muted-foreground text-sm">Monthly appointment volume for 2024</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold bg-muted rounded-lg">Month</button>
              <button className="px-3 py-1.5 text-xs font-semibold hover:bg-muted rounded-lg transition-colors">Week</button>
            </div>
          </div>
          <div className="w-full h-64 relative mt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
              <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="0" y2="0" />
              <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
              <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="100" y2="100" />
              <line className="text-border" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,180 L50,160 L100,170 L150,120 L200,130 L250,90 L300,100 L350,60 L400,80 L450,40 L500,55 L550,20 L600,45 L650,15 L700,30 L750,10 L800,25 V200 H0 Z"
                fill="url(#gradient)"
                opacity="0.4"
              />
              <path
                d="M0,180 L50,160 L100,170 L150,120 L200,130 L250,90 L300,100 L350,60 L400,80 L450,40 L500,55 L550,20 L600,45 L650,15 L700,30 L750,10 L800,25"
                fill="none"
                stroke="#facc15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
              <circle cx="550" cy="20" fill="#facc15" r="5" stroke="white" strokeWidth="2" />
              <circle cx="750" cy="10" fill="#facc15" r="5" stroke="white" strokeWidth="2" />
            </svg>
            <div className="flex justify-between mt-6 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-1">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded">Last 24h</span>
          </div>
          <div className="space-y-6 relative z-10">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className={`material-icons-round text-sm ${
                      activity.color === 'primary' ? 'text-primary' :
                      activity.color === 'emerald' ? 'text-emerald-400' :
                      'text-amber-400'
                    }`}>{activity.icon}</span>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[2px] h-full bg-slate-800"></div>
                  )}
                </div>
                <div className={`flex-1 ${index < recentActivity.length - 1 ? 'pb-6 border-b border-slate-800/50' : ''}`}>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.detail}</p>
                  <span className="text-[10px] text-slate-500 mt-2 inline-block">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 top-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Weekly Distribution */}
        <div className="bg-card p-6 rounded-[2rem] border border-border/60 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-bold text-foreground">Weekly Distribution</h4>
              <p className="text-xs text-muted-foreground">Appointments this week</p>
            </div>
            <span className="text-2xl font-bold text-foreground">94</span>
          </div>
          <div className="flex items-end justify-between h-32 mt-10 px-2">
            {weekDays.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-2.5 rounded-full ${
                    day.color === 'primary' ? 'bg-primary' : 'bg-slate-900 dark:bg-slate-700'
                  }`}
                  style={{ height: `${day.height}%` }}
                ></div>
                <span className="text-[10px] font-bold text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        <div className="lg:col-span-3 bg-card p-8 rounded-[2rem] border border-border/60 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-foreground">New Staff Members</h4>
            <button className="text-sm font-semibold text-primary">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-widest border-b border-border">
                  <th className="pb-4 font-semibold">Member</th>
                  <th className="pb-4 font-semibold">Specialty</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Date Joined</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffMembers.map((member, index) => (
                  <tr key={index}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted overflow-hidden">
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{member.name}</p>
                          <p className="text-[11px] text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-foreground">{member.specialty}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${getStatusColor(member.status)}`}>
                        {member.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{member.dateJoined}</td>
                    <td className="py-4 text-right">
                      <button className="material-icons-round text-muted-foreground hover:text-foreground transition-colors">more_vert</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
