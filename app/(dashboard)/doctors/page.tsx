'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp, Activity, MoreHorizontal, Loader2, Check, X, ChevronLeft, ChevronRight, Video, MapPin, User, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AppointmentStatus } from '@/lib/entities/Appointment'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

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
  const [selectedAppointment, setSelectedAppointment] = useState<typeof upcomingAppointments[0] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'decline' | 'complete'>('confirm');
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAppointmentAction = async () => {
    if (!selectedAppointment) return;
    
    setIsProcessing(true);
    try {
      let status: AppointmentStatus;
      
      if (actionType === 'confirm') {
        status = AppointmentStatus.CONFIRMED;
      } else if (actionType === 'decline') {
        status = AppointmentStatus.CANCELLED;
      } else if (actionType === 'complete') {
        status = AppointmentStatus.COMPLETED;
      } else {
        status = AppointmentStatus.SCHEDULED;
      }

      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          reason: actionType === 'decline' ? cancelReason : undefined 
        }),
      });

      if (response.ok) {
        setIsSheetOpen(false);
        setSelectedAppointment(null);
        setCancelReason('');
        fetchDashboardData();
      } else {
        setError('Failed to update appointment');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionSheet = (appointment: typeof upcomingAppointments[0], action: 'confirm' | 'decline' | 'complete') => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setCancelReason('');
    setIsSheetOpen(true);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatWeekRange = () => {
    const days = getWeekDays();
    const start = days[0];
    const end = days[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const year = start.getFullYear();
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return upcomingAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.toDateString() === date.toDateString();
    });
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

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
    <div className="p-3 sm:p-8">
      <DashboardHeader
        title="Welcome back, Doctor"
        subtitle="Here's your schedule and patient updates for today."
        searchPlaceholder="Search patients..."
      />

      <div className="flex gap-4 mb-8 border-b border-border">
        <div 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center cursor-pointer transition-colors ${
            activeTab === 'overview' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4 mr-2" /> Overview
        </div>
        <div 
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center cursor-pointer transition-colors ${
            activeTab === 'schedule' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4 mr-2" /> Schedule
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-content">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 rounded-xl border-2 border-gray-200 bg-white p-2 shadow-lg">
                            {appt.status === 'Scheduled' && (
                              <DropdownMenuItem onClick={() => openActionSheet(appt, 'confirm')} className="rounded-lg px-3 py-2.5 text-base text-emerald-500 font-semibold cursor-pointer">
                                <Check className="h-5 w-5 mr-3" />
                                Confirm Appointment
                              </DropdownMenuItem>
                            )}
                            {appt.status === 'Confirmed' && (
                              <DropdownMenuItem onClick={() => openActionSheet(appt, 'complete')} className="rounded-lg px-3 py-2.5 text-base text-green-500 font-semibold cursor-pointer">
                                <Check className="h-5 w-5 mr-3" />
                                Mark as Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openActionSheet(appt, 'decline')} className="rounded-lg px-3 py-2.5 text-base font-semibold text-red-500 focus:text-red-500 cursor-pointer">
                              <X className="h-5 w-5 mr-3" />
                              Cancel Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      )}

      {activeTab === 'schedule' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Weekly Calendar */}
          <div className="flex-1 bg-white rounded-2xl border border-yellow-200 shadow-sm">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-yellow-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">{formatWeekRange()}</h2>
                <div className="flex items-center bg-white rounded-lg border border-yellow-200 shadow-sm">
                  <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-yellow-50 rounded-l-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button onClick={() => setCurrentWeekStart(new Date())} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border-x border-yellow-100 hover:bg-yellow-50 transition-colors">
                    Today
                  </button>
                  <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-yellow-50 rounded-r-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid - Hidden on mobile, simplified view */}
            <div className="flex flex-col xl:flex-row w-screen sm:w-3xl overflow-x-auto">
              <div className="grid min-w-5xl" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                {/* Days Header */}
                <div className="p-4 border-r border-b border-yellow-100 bg-gray-50/50"></div>
                {getWeekDays().map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 text-center border-r border-b border-yellow-100 ${
                      isToday(day) ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-yellow-600 uppercase tracking-widest">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-lg font-extrabold ${isToday(day) ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                ))}

                {/* Time Grid */}
                <div className="border-r border-yellow-100 bg-gray-50/30">
                  {timeSlots.map((time, idx) => (
                    <div key={idx} className="px-2 py-6 text-xs font-bold text-gray-700 text-nowrap border-b border-yellow-100">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {getWeekDays().map((day, dayIdx) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  return (
                    <div key={dayIdx} className={`relative border-r border-yellow-100 ${isToday(day) ? 'bg-yellow-50/30' : ''}`}>
                      {timeSlots.map((_, timeIdx) => (
                        <div key={timeIdx} className="border-b border-yellow-100/50 h-16"></div>
                      ))}
                      {dayAppointments.map((appt) => {
                        const hour = parseInt(appt.time.split(':')[0]);
                        const minute = appt.time.includes(':30') ? 30 : 0;
                        const top = ((hour - 8) * 64) + (minute / 60 * 64);
                        return (
                          <div
                            key={appt.id}
                            onClick={() => openActionSheet(appt, appt.status === 'Scheduled' ? 'confirm' : 'complete')}
                            className={`absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                              appt.status === 'Confirmed' 
                                ? 'bg-yellow-100 border-l-4 border-yellow-500' 
                                : 'bg-emerald-100 border-l-4 border-emerald-500'
                            }`}
                            style={{ top: `${top}px`, height: '60px' }}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-gray-700">{appt.time}</span>
                              {appt.type.toLowerCase().includes('video') && (
                                <Video className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                            <div className="text-xs font-extrabold text-gray-900 truncate mt-1">{appt.patient}</div>
                            <div className="text-[10px] font-medium text-gray-600 truncate">{appt.type}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Today's Agenda */}
          <aside className="w-full lg:w-96 bg-white rounded-2xl border border-yellow-200 shadow-sm overflow-hidden flex flex-col max-h-[500px] lg:max-h-none">
            <div className="p-4 sm:p-6 border-b border-yellow-100 shrink-0">
              <h2 className="text-lg sm:text-xl font-extrabold mb-1">Today&apos;s Agenda</h2>
              <p className="text-sm text-gray-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {upcomingAppointments.filter(a => isToday(new Date(a.date))).length} Appointments
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
              {upcomingAppointments.filter(a => isToday(new Date(a.date))).length > 0 ? (
                upcomingAppointments
                  .filter(a => isToday(new Date(a.date)))
                  .map((appt) => (
                    <div 
                      key={appt.id}
                      onClick={() => openActionSheet(appt, appt.status === 'Scheduled' ? 'confirm' : 'complete')}
                      className="group cursor-pointer bg-white border border-yellow-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all hover:border-yellow-300"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                            appt.type.toLowerCase().includes('video') ? 'bg-blue-50' : 'bg-yellow-50'
                          }`}>
                            {appt.type.toLowerCase().includes('video') ? (
                              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                            ) : (
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{appt.patient}</h4>
                            <p className="text-[10px] sm:text-[11px] font-bold text-yellow-600 uppercase">{appt.type}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-black shrink-0 ${
                          appt.status === 'Confirmed' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {appt.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-500 border-t border-gray-50 pt-2 sm:pt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> {appt.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3 sm:w-4 sm:h-4" /> 45 min
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
              )}
            </div>
          </aside>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg border-2 border-gray-200 bg-white p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-bold text-gray-900">
              {actionType === 'confirm' && 'Confirm Appointment'}
              {actionType === 'decline' && 'Cancel Appointment'}
              {actionType === 'complete' && 'Complete Appointment'}
            </SheetTitle>
            <SheetDescription className="text-base text-gray-600">
              {actionType === 'confirm' && `Are you sure you want to confirm the appointment with ${selectedAppointment?.patient}?`}
              {actionType === 'decline' && `Are you sure you want to cancel the appointment with ${selectedAppointment?.patient}?`}
              {actionType === 'complete' && `Mark the appointment with ${selectedAppointment?.patient} as completed?`}
            </SheetDescription>
          </SheetHeader>
          
          {actionType === 'decline' && (
            <div className="py-4">
              <Label htmlFor="reason" className="text-base font-semibold text-gray-800">Reason for cancellation (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-3 rounded-xl border-gray-300 text-base"
                rows={4}
              />
            </div>
          )}

          {actionType === 'complete' && (
            <div className="py-6 text-base text-gray-600 bg-green-50 rounded-xl px-4">
              <p>This will mark the appointment as completed. The patient will be notified of the completion.</p>
            </div>
          )}
          
          <SheetFooter className="mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsSheetOpen(false)} 
              disabled={isProcessing}
              className="flex-1 rounded-xl h-16 text-base font-semibold border-2 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            {actionType === 'confirm' && (
              <Button 
                onClick={handleAppointmentAction} 
                disabled={isProcessing} 
                className="flex-1 rounded-xl h-16 text-base font-bold bg-emerald-500 hover:bg-emerald-600"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                Confirm
              </Button>
            )}
            {actionType === 'decline' && (
              <Button 
                onClick={handleAppointmentAction} 
                disabled={isProcessing}
                className="flex-1 rounded-xl h-16 text-base font-bold bg-red-500 hover:bg-red-600" 
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <X className="h-5 w-5 mr-2" />}
                Decline
              </Button>
            )}
            {actionType === 'complete' && (
              <Button 
                onClick={handleAppointmentAction} 
                disabled={isProcessing}
                className="flex-1 rounded-xl h-16 text-base font-bold bg-green-500 hover:bg-green-600"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                Mark Complete
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
