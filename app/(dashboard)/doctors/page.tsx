'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp, Activity, MoreHorizontal, Search, Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardData {
  stats: {
    todayAppointments: { value: number; trend: string; trendUp: boolean };
    activePatients: { value: number; trend: string; trendUp: boolean };
    pendingRequests: { value: number; trend: string; trendUp: boolean };
    completionRate: { value: string; trend: string; trendUp: boolean };
  };
  recentActivity: Array<{
    action: string;
    detail: string;
    time: string;
    icon: string;
    color: string;
  }>;
  upcomingAppointments: Array<{
    id: string;
    patient: string;
    patientFirstName: string;
    time: string;
    date: string;
    type: string;
    status: string;
    statusEnum: string;
  }>;
  weeklyActivity: Array<{
    day: string;
    count: number;
    height: number;
  }>;
}

export default function DietitianDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/doctors/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = data ? [
    {
      title: "Today's Appointments",
      value: data.stats.todayAppointments.value.toString(),
      description: "Scheduled for today",
      icon: Calendar,
      trend: data.stats.todayAppointments.trend,
      trendUp: data.stats.todayAppointments.trendUp,
    },
    {
      title: "Active Patients",
      value: data.stats.activePatients.value.toString(),
      description: "Currently managing",
      icon: Users,
      trend: data.stats.activePatients.trend,
      trendUp: data.stats.activePatients.trendUp,
    },
    {
      title: "Pending Requests",
      value: data.stats.pendingRequests.value.toString(),
      description: "Awaiting approval",
      icon: Clock,
      trend: data.stats.pendingRequests.trend,
      trendUp: data.stats.pendingRequests.trendUp,
    },
    {
      title: "Completion Rate",
      value: data.stats.completionRate.value,
      description: "This month",
      icon: TrendingUp,
      trend: data.stats.completionRate.trend,
      trendUp: data.stats.completionRate.trendUp,
    },
  ] : [];

  const recentActivity = data?.recentActivity || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const weeklyActivity = data?.weeklyActivity || [];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Doctor</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here&apos;s your schedule and patient updates for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl w-64 outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground">D</div>
        </div>
      </header>

      <div className="flex gap-4 mb-8 border-b border-border">
        <div className="px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary flex items-center">
          <Activity className="h-4 w-4 mr-2" /> Overview
        </div>
        <div className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground flex items-center cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" /> Schedule
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                stat.title.includes('Appointments') ? 'bg-amber-100 text-amber-600' :
                stat.title.includes('Active') ? 'bg-emerald-100 text-emerald-600' :
                stat.title.includes('Pending') ? 'bg-blue-100 text-blue-600' :
                'bg-primary/10 text-primary'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-bold flex items-center ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${!stat.trendUp ? 'rotate-90' : ''}`} /> {stat.trend}
              </span>
              <span className="text-muted-foreground">from last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-8 rounded-[2rem] border border-border/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-foreground">Weekly Activity</h2>
              <p className="text-muted-foreground text-sm">Patient consultations overview</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="px-3 py-1.5 text-xs font-semibold bg-muted rounded-lg">This Week</Button>
            </div>
          </div>
          <div className="w-full h-64 relative mt-4 flex items-end justify-between px-4">
             {weeklyActivity.length > 0 ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="doctorGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const maxCount = Math.max(...weeklyActivity.map(d => d.count), 1);
                  const points = weeklyActivity.map((day, index) => {
                    const x = (index / (weeklyActivity.length - 1)) * 800;
                    const y = 180 - (day.count / maxCount) * 140;
                    return { x, y };
                  });
                  
                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                  const areaPath = `${linePath} V200 H0 Z`;
                  
                  return (
                    <>
                      <path d={areaPath} fill="url(#doctorGradient)" opacity="0.2" />
                      <path d={linePath} fill="none" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                    </>
                  );
                })()}
              </svg>
             ) : (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="doctorGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,180 L100,140 L200,150 L300,100 L400,110 L500,60 L600,70 L700,20 L800,30 V200 H0 Z" fill="url(#doctorGradient)" opacity="0.2" />
                <path d="M0,180 L100,140 L200,150 L300,100 L400,110 L500,60 L600,70 L700,20 L800,30" fill="none" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
              </svg>
             )}
             <div className="flex justify-between w-full absolute bottom-0 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pb-[-20px]">
                {weeklyActivity.length > 0 ? (
                  weeklyActivity.map((day) => (
                    <span key={day.day}>{day.day}</span>
                  ))
                ) : (
                  <>
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded">Today</span>
          </div>
          <div className="space-y-6 relative z-10">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      {activity.icon === 'check_circle' && <Activity className={`h-5 w-5 text-emerald-400`} />}
                      {activity.icon === 'person_add' && <Users className={`h-5 w-5 text-primary`} />}
                      {activity.icon === 'edit_note' && <Clock className={`h-5 w-5 text-amber-400`} />}
                    </div>
                    {index < recentActivity.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[2px] h-full bg-slate-800"></div>}
                  </div>
                  <div className={`flex-1 ${index < recentActivity.length - 1 ? 'pb-6 border-b border-slate-800/50' : ''}`}>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.detail}</p>
                    <span className="text-[10px] text-slate-500 mt-2 inline-block">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No recent activity</p>
            )}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <div className="lg:col-span-4 bg-card p-8 rounded-[2rem] border border-border/60 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-foreground">Upcoming Schedule</h4>
            <Button variant="ghost" className="text-sm font-semibold text-primary hover:text-primary">View Calendar</Button>
          </div>
          <div className="overflow-x-auto">
            {upcomingAppointments.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase tracking-widest border-b border-border">
                    <th className="pb-4 font-semibold">Patient</th>
                    <th className="pb-4 font-semibold">Time</th>
                    <th className="pb-4 font-semibold">Type</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcomingAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {appt.patientFirstName ? appt.patientFirstName.charAt(0) : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{appt.patient}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-foreground">{appt.time}</td>
                      <td className="py-4 text-sm text-muted-foreground">{appt.type}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                          appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {appt.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
