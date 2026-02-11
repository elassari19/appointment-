'use client';

import { useState } from 'react';

// Mock stats data
const stats = [
  {
    title: 'Total Patients',
    value: '1,248',
    change: '+12%',
    icon: 'people',
    color: 'blue',
  },
  {
    title: 'Active Doctors',
    value: '48',
    change: '+3%',
    icon: 'medication',
    color: 'emerald',
  },
  {
    title: 'Appointments',
    value: '156',
    change: '+8%',
    icon: 'event_available',
    color: 'primary',
  },
  {
    title: 'Completed',
    value: '1,204',
    change: '+15%',
    icon: 'task_alt',
    color: 'violet',
  },
];

// Mock today's appointments
const todayAppointments = [
  {
    id: '#AP-2931',
    patient: 'Sarah Jenkins',
    doctor: 'Dr. Sarah Mitchell',
    time: '10:00 AM',
    type: 'Video',
    status: 'Confirmed',
  },
  {
    id: '#AP-2932',
    patient: 'Michael Roberts',
    doctor: 'Dr. James Wilson',
    time: '11:30 AM',
    type: 'In-Person',
    status: 'Pending',
  },
  {
    id: '#AP-2933',
    patient: 'Emily Davis',
    doctor: 'Dr. Alex Carter',
    time: '02:00 PM',
    type: 'Video',
    status: 'Confirmed',
  },
];

// Mock recent activity
const recentActivity = [
  {
    action: 'New appointment booked',
    user: 'Sarah Jenkins',
    time: '5 minutes ago',
    icon: 'event_available',
  },
  {
    action: 'Doctor joined platform',
    user: 'Dr. James Wilson',
    time: '1 hour ago',
    icon: 'person_add',
  },
  {
    action: 'Appointment cancelled',
    user: 'Michael Roberts',
    time: '2 hours ago',
    icon: 'event_busy',
  },
  {
    action: 'Payment received',
    user: 'Emily Davis',
    time: '3 hours ago',
    icon: 'payments',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'Pending':
      return 'text-amber-600 dark:text-amber-400';
    default:
      return 'text-muted-foreground';
  }
};

export default function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <span className="material-icons-round">calendar_today</span>
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
              <span className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </span>
              <span className={`p-2 ${
                stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                stat.color === 'primary' ? 'bg-primary/20 text-primary-foreground' :
                'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
              } rounded-xl`}>
                <span className="material-icons-round">{stat.icon}</span>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-[12px] flex items-center gap-1 font-semibold text-emerald-500">
              <span className="material-icons-round text-sm">trending_up</span>
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 card-stitch p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground dark:text-white">
              Today's Appointments
            </h2>
            <button className="text-primary font-semibold text-sm hover:opacity-80 transition-opacity">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 bg-muted/50 dark:bg-muted/10 rounded-2xl hover:bg-muted dark:hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="material-icons-round text-primary-foreground">
                      {apt.type === 'Video' ? 'videocam' : 'location_on'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground dark:text-white">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground dark:text-white">{apt.time}</p>
                  <p className={`text-sm font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-stitch p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground dark:text-white">
              Recent Activity
            </h2>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="material-icons-round">more_vert</span>
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-primary-foreground text-sm">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{activity.user}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Add Patient', icon: 'person_add', href: '/admin/patients/new' },
          { title: 'Add Doctor', icon: 'medication', href: '/admin/doctors/new' },
          { title: 'View Reports', icon: 'bar_chart', href: '/admin/reports' },
          { title: 'Settings', icon: 'settings', href: '/admin/settings' },
        ].map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="card-stitch p-4 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 dark:hover:bg-muted/10 transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-icons-round text-primary-foreground text-xl">
                {action.icon}
              </span>
            </div>
            <span className="font-semibold text-foreground dark:text-white text-sm">
              {action.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
