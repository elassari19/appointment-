'use client';

import { useState } from 'react';
import Image from 'next/image';

// Mock appointment data
const appointments = [
  {
    id: '#AP-2931',
    patient: {
      name: 'Sarah Jenkins',
      email: 'sarahj@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    doctor: {
      name: 'Dr. Sarah Mitchell',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    },
    date: 'Feb 15, 2026',
    time: '10:00 AM',
    type: 'Video',
    status: 'Confirmed',
  },
  {
    id: '#AP-2932',
    patient: {
      name: 'Michael Roberts',
      email: 'm.roberts@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    doctor: {
      name: 'Dr. James Wilson',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    },
    date: 'Feb 15, 2026',
    time: '11:30 AM',
    type: 'In-Person',
    status: 'Pending',
  },
  {
    id: '#AP-2933',
    patient: {
      name: 'Emily Davis',
      email: 'emily.d@test.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    doctor: {
      name: 'Dr. Alex Carter',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
    },
    date: 'Feb 15, 2026',
    time: '02:00 PM',
    type: 'Video',
    status: 'Cancelled',
  },
  {
    id: '#AP-2934',
    patient: {
      name: 'David Kim',
      email: 'dkim88@work.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    doctor: {
      name: 'Dr. Sarah Mitchell',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    },
    date: 'Feb 16, 2026',
    time: '09:15 AM',
    type: 'In-Person',
    status: 'Confirmed',
  },
];

const stats = [
  {
    title: 'Total Booking',
    value: '1,482',
    change: '+12%',
    trend: 'up',
    icon: 'event_note',
    color: 'blue',
  },
  {
    title: 'Confirmed',
    value: '948',
    change: '+5%',
    trend: 'up',
    icon: 'check_circle_outline',
    color: 'emerald',
  },
  {
    title: 'Pending',
    value: '156',
    change: '-2%',
    trend: 'down',
    icon: 'history',
    color: 'amber',
  },
  {
    title: 'Cancelled',
    value: '24',
    change: '-10%',
    trend: 'down',
    icon: 'cancel_presentation',
    color: 'rose',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
          Confirmed
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
          Pending
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 line-through opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
          Cancelled
        </span>
      );
    default:
      return null;
  }
};

const getTypeBadge = (type: string) => {
  const icon = type === 'Video' ? 'videocam' : 'location_on';
  const colorClass = type === 'Video' 
    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
  
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg w-fit ${colorClass}`}>
      <span className="material-icons-round text-sm">{icon}</span>
      {type}
    </div>
  );
};

export default function AppointmentsManagementPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-muted-foreground bg-card rounded-xl shadow-sm border border-border">
            <span className="material-icons-round">menu</span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
              Appointments Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage, reschedule or cancel patient appointments.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search patients, doctors..."
              className="pl-10 pr-4 py-2.5 w-64 bg-card border-border rounded-xl text-sm focus:ring-primary focus:border-primary dark:text-white border"
            />
          </div>
          <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors relative">
            <span className="material-icons-round">notifications_none</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <span className="material-icons-round text-lg">add</span>
            <span>New Appointment</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                {stat.title}
              </span>
              <span className={`p-2 ${
                stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                stat.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
              } rounded-xl`}>
                <span className="material-icons-round">{stat.icon}</span>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground dark:text-white mb-1">
              {stat.value}
            </div>
            <div className={`text-[12px] flex items-center gap-1 font-semibold ${
              stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              <span className="material-icons-round text-sm">
                {stat.trend === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card-stitch flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-muted dark:bg-muted/20 rounded-2xl">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-card dark:bg-muted text-foreground dark:text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-card dark:bg-muted text-foreground dark:text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                History
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-muted/20 rounded-xl border border-border cursor-pointer">
                <span className="material-icons-round text-muted-foreground text-lg">filter_list</span>
                <span className="text-xs font-semibold text-muted-foreground">All Doctors</span>
                <span className="material-icons-round text-muted-foreground text-sm">expand_more</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-muted/20 rounded-xl border border-border cursor-pointer">
                <span className="material-icons-round text-muted-foreground text-lg">event</span>
                <span className="text-xs font-semibold text-muted-foreground">Last 30 Days</span>
                <span className="material-icons-round text-muted-foreground text-sm">expand_more</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-muted/20 rounded-xl border border-border cursor-pointer">
                <span className="material-icons-round text-muted-foreground text-lg">category</span>
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                <span className="material-icons-round text-muted-foreground text-sm">expand_more</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round text-lg">file_download</span>
                <span className="text-xs font-bold uppercase tracking-wider">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-muted/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Patient
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Doctor
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="group hover:bg-muted/30 dark:hover:bg-muted/10 transition-all"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground dark:text-white">
                      {appointment.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                        <img
                          src={appointment.patient.avatar}
                          alt={appointment.patient.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground dark:text-white">
                          {appointment.patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{appointment.patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                        <img
                          src={appointment.doctor.avatar}
                          alt={appointment.doctor.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                        {appointment.doctor.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-bold text-foreground dark:text-white">{appointment.date}</p>
                      <p className="text-muted-foreground">{appointment.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(appointment.type)}</td>
                  <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {appointment.status === 'Cancelled' ? (
                      <button className="px-3 py-1.5 bg-muted dark:bg-muted/30 text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted/80 transition-colors">
                        Rebook
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Reschedule"
                        >
                          <span className="material-icons-round text-lg">edit_calendar</span>
                        </button>
                        <button
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          title="Cancel"
                        >
                          <span className="material-icons-round text-lg">cancel</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground dark:text-white">1 to 4</span> of 156 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-icons-round">chevron_left</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted dark:hover:bg-muted/20 font-bold transition-colors">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted dark:hover:bg-muted/20 font-bold transition-colors">
              3
            </button>
            <span className="px-2 text-muted-foreground">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted dark:hover:bg-muted/20 font-bold transition-colors">
              16
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-icons-round">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
