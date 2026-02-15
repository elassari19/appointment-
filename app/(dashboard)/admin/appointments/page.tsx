'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle, Check, X, Video, TrendingUp, TrendingDown } from 'lucide-react';
import { AppointmentStatus } from '@/lib/entities/Appointment';

interface Appointment {
  id: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  cancellationReason?: string;
  createdAt: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'cancel'>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/appointments');
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        const allAppointments = data.appointments || [];
        setStats({
          total: allAppointments.length,
          confirmed: allAppointments.filter((a: Appointment) => a.status === AppointmentStatus.CONFIRMED).length,
          pending: allAppointments.filter((a: Appointment) => a.status === AppointmentStatus.SCHEDULED).length,
          cancelled: allAppointments.filter((a: Appointment) => a.status === AppointmentStatus.CANCELLED).length,
          completed: allAppointments.filter((a: Appointment) => a.status === AppointmentStatus.COMPLETED).length,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load appointments');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/appointments/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors || []);
        }
      } catch (err) {
        console.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, []);

  const handleAppointmentAction = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        setSelectedAppointment(null);
        setCancelReason('');
        fetchAppointments();
      } else {
        setError('Failed to update appointment');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const csvData = sortedAppointments.map(apt => ({
      'ID': `#${apt.id.slice(0, 8).toUpperCase()}`,
      'Patient Name': `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim(),
      'Patient Email': apt.patient?.email || '',
      'Doctor Name': `Dr. ${apt.doctor?.firstName || ''} ${apt.doctor?.lastName || ''}`.trim(),
      'Date': formatDate(apt.startTime),
      'Time': formatTime(apt.startTime),
      'Duration (min)': apt.duration,
      'Status': apt.status,
      'Type': apt.meetingLink ? 'Video' : 'In-Person',
      'Meeting Link': apt.meetingLink || '',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortedAppointments = [...appointments]
    .filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const now = new Date();
      
      if (viewMode === 'upcoming') {
        if (aptDate < now || apt.status === AppointmentStatus.CANCELLED || apt.status === AppointmentStatus.COMPLETED) {
          return false;
        }
      } else if (viewMode === 'history') {
        if (aptDate >= now && apt.status !== AppointmentStatus.CANCELLED && apt.status !== AppointmentStatus.COMPLETED) {
          return false;
        }
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const patientMatch = apt.patient?.firstName?.toLowerCase().includes(query) ||
          apt.patient?.lastName?.toLowerCase().includes(query) ||
          apt.patient?.email?.toLowerCase().includes(query);
        const doctorMatch = apt.doctor?.firstName?.toLowerCase().includes(query) ||
          apt.doctor?.lastName?.toLowerCase().includes(query);
        if (!patientMatch && !doctorMatch) return false;
      }
      if (selectedDoctor && apt.doctor?.id !== selectedDoctor) return false;
      if (selectedStatus && apt.status !== selectedStatus) return false;
      if (dateRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        if (aptDate < startDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return viewMode === 'history' ? dateB - dateA : dateA - dateB;
    });

  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
      case AppointmentStatus.CONFIRMED:
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
      case AppointmentStatus.COMPLETED:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case AppointmentStatus.CANCELLED:
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400';
      case AppointmentStatus.NO_SHOW:
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const isVideoAppointment = (appointment: Appointment) => {
    return appointment.meetingLink && appointment.meetingLink.includes('meet');
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#facc15]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointments Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, reschedule or cancel patient appointments.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl w-5 h-5" />
            <input
              className="pl-10 pr-4 py-2.5 w-64 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary focus:border-primary dark:text-white"
              placeholder="Search patients, doctors..."
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button 
            onClick={() => fetchAppointments()}
            className="bg-primary hover:opacity-90 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>New Appointment</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Booking</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.total.toLocaleString()}</div>
          <div className="text-[12px] flex items-center gap-1 text-emerald-500 font-semibold">
            <TrendingUp className="text-sm w-4 h-4" /> +12% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Confirmed</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <CheckCircleIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.confirmed.toLocaleString()}</div>
          <div className="text-[12px] flex items-center gap-1 text-emerald-500 font-semibold">
            <TrendingUp className="text-sm w-4 h-4" /> +5% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
              <ClockIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.pending.toLocaleString()}</div>
          <div className="text-[12px] flex items-center gap-1 text-rose-500 font-semibold">
            <TrendingDown className="text-sm w-4 h-4" /> -2% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cancelled</span>
            <span className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
              <CancelIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.cancelled.toLocaleString()}</div>
          <div className="text-[12px] flex items-center gap-1 text-emerald-500 font-semibold">
            <TrendingDown className="text-sm w-4 h-4" /> -10% from last month
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl self-start">
              <button
                onClick={() => {
                  setViewMode('upcoming');
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === 'upcoming'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => {
                  setViewMode('history');
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'history'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                History
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <FilterIcon className="text-slate-400 text-lg" />
                <select
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
                <ExpandIcon className="text-slate-400 text-sm" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <EventIcon className="text-slate-400 text-lg" />
                <select
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
                <ExpandIcon className="text-slate-400 text-sm" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <CategoryIcon className="text-slate-400 text-lg" />
                <select
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                  <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                  <option value={AppointmentStatus.COMPLETED}>Completed</option>
                  <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                  <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                </select>
                <ExpandIcon className="text-slate-400 text-sm" />
              </div>
              <button 
                onClick={() => handleExport()}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ExportIcon className="text-lg" />
                <span className="text-xs font-bold uppercase tracking-wider">Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Doctor</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date & Time</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appointment) => (
                  <tr key={appointment.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">#{appointment.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{appointment.patient?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs grayscale">
                          {appointment.doctor?.firstName?.[0]}{appointment.doctor?.lastName?.[0]}
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-bold text-slate-900 dark:text-white">{formatDate(appointment.startTime)}</p>
                        <p className="text-slate-500">{formatTime(appointment.startTime)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg w-fit ${
                        isVideoAppointment(appointment)
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isVideoAppointment(appointment) ? (
                          <Video className="text-sm w-4 h-4" />
                        ) : (
                          <LocationIcon className="text-sm w-4 h-4" />
                        )}
                        {isVideoAppointment(appointment) ? 'Video' : 'In-Person'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(appointment.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          appointment.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-500' :
                          appointment.status === AppointmentStatus.SCHEDULED ? 'bg-amber-500' :
                          appointment.status === AppointmentStatus.CANCELLED ? 'bg-rose-500' :
                          appointment.status === AppointmentStatus.COMPLETED ? 'bg-slate-500' :
                          'bg-yellow-500'
                        }`}></span>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appointment.status === AppointmentStatus.SCHEDULED && (
                          <>
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, AppointmentStatus.CONFIRMED)}
                              className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                              title="Confirm"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setActionType('cancel');
                                setSelectedAppointment(appointment);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {appointment.status === AppointmentStatus.CONFIRMED && (
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, AppointmentStatus.COMPLETED)}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Mark Complete"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        {appointment.status === AppointmentStatus.CANCELLED && (
                          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                            Rebook
                          </button>
                        )}
                        {appointment.meetingLink && appointment.status !== AppointmentStatus.CANCELLED && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Join Meeting"
                          >
                            <Video className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedAppointments.length)}</span> of {sortedAppointments.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold ${
                    currentPage === page
                      ? 'bg-primary text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold ${
                    currentPage === totalPages
                      ? 'bg-primary text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {selectedAppointment && actionType === 'cancel' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cancel Appointment</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to cancel this appointment between{' '}
              <strong>
                {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
              </strong>{' '}
              and{' '}
              <strong>
                Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
              </strong>
              ?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                rows={3}
                placeholder="Please provide a reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleAppointmentAction(selectedAppointment.id, AppointmentStatus.CANCELLED, cancelReason)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor"/>
    </svg>
  );
}

function EventIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="currentColor"/>
    </svg>
  );
}

function CategoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17ZM2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12V19H5V12H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12H19ZM13 12.67L15.59 10.09L17 11.5L12 16.5L7 11.5L8.41 10.09L11 12.67V3H13V12.67Z" fill="currentColor"/>
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="currentColor"/>
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="currentColor"/>
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
    </svg>
  );
}

function CancelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19Z" fill="currentColor"/>
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
    </svg>
  );
}
