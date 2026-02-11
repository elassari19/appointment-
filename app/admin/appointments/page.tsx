'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Search, Loader2, AlertCircle, Check, X } from 'lucide-react';
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
  };
  dietitian: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cancellationReason?: string;
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'cancel'>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const now = new Date();

      let matchesFilter = true;
      if (filter === 'upcoming') {
        matchesFilter = aptDate >= now && apt.status !== AppointmentStatus.CANCELLED;
      } else if (filter === 'past') {
        matchesFilter = aptDate < now || apt.status === AppointmentStatus.COMPLETED;
      } else if (filter === 'cancelled') {
        matchesFilter = apt.status === AppointmentStatus.CANCELLED;
      }

      let matchesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          apt.patient.firstName.toLowerCase().includes(query) ||
          apt.patient.lastName.toLowerCase().includes(query) ||
          apt.patient.email.toLowerCase().includes(query) ||
          apt.dietitian.firstName.toLowerCase().includes(query) ||
          apt.dietitian.lastName.toLowerCase().includes(query) ||
          apt.dietitian.email.toLowerCase().includes(query);
      }

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return filter === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

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
        return 'bg-blue-100 text-blue-700';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-700';
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-100 text-gray-700';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
      case AppointmentStatus.NO_SHOW:
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#facc15]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Appointment Management</h1>
          <p className="text-slate-500">Manage all appointments across the platform</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or dietitian name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-[#facc15] text-slate-900'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Dietitian</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{appointment.patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-sm">
                          {appointment.dietitian.firstName[0]}{appointment.dietitian.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {appointment.dietitian.firstName} {appointment.dietitian.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{appointment.dietitian.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{formatDate(appointment.startTime)}</p>
                      <p className="text-sm text-slate-500">{formatTime(appointment.startTime)}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{appointment.duration} min</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === AppointmentStatus.SCHEDULED && (
                          <>
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, AppointmentStatus.CONFIRMED)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Confirm"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActionType('cancel');
                                setSelectedAppointment(appointment);
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {appointment.status === AppointmentStatus.CONFIRMED && (
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, AppointmentStatus.COMPLETED)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Mark Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {appointment.meetingLink && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Join Meeting"
                          >
                            <Video className="w-4 h-4" />
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
      </div>

      {selectedAppointment && actionType === 'cancel' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Cancel Appointment</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to cancel this appointment between{' '}
              <strong>
                {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
              </strong>{' '}
              and{' '}
              <strong>
                {selectedAppointment.dietitian.firstName} {selectedAppointment.dietitian.lastName}
              </strong>
              ?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
                rows={3}
                placeholder="Please provide a reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleAppointmentAction(selectedAppointment.id, AppointmentStatus.CANCELLED, cancelReason)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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
