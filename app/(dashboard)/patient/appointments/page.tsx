'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, MapPin, MoreVertical, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { AppointmentStatus } from '@/lib/entities/Appointment';

interface Appointment {
  id: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  dietitian: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (response.ok) {
        setSelectedAppointment(null);
        setCancelReason('');
        fetchAppointments();
      } else {
        setError('Failed to cancel appointment');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    const now = new Date();

    if (filter === 'upcoming') {
      return aptDate >= now && apt.status !== AppointmentStatus.CANCELLED;
    } else if (filter === 'past') {
      return aptDate < now || apt.status === AppointmentStatus.COMPLETED;
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);
    return filter === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return <Calendar className="w-4 h-4" />;
      case AppointmentStatus.CONFIRMED:
        return <CheckCircle2 className="w-4 h-4" />;
      case AppointmentStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
          <h1 className="text-2xl font-bold text-[#1e293b]">My Appointments</h1>
          <p className="text-slate-500">View and manage your appointments</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'upcoming', 'past'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-[#facc15] text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-[#1e293b] mb-2">No appointments found</h3>
          <p className="text-slate-500 mb-4">
            {filter === 'upcoming'
              ? "You don't have any upcoming appointments"
              : filter === 'past'
              ? "You don't have any past appointments"
              : 'No appointments scheduled yet'}
          </p>
          <a
            href="/patient/book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#facc15] text-slate-900 font-medium rounded-xl hover:bg-[#eab308] transition-colors"
          >
            Book Appointment
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-lg">
                    {appointment.dietitian.firstName[0]}{appointment.dietitian.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e293b]">
                      {appointment.dietitian.firstName} {appointment.dietitian.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">Dietitian</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(appointment.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(appointment.startTime)} ({appointment.duration} min)
                      </span>
                    </div>
                    {appointment.meetingLink && (
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  {appointment.status === AppointmentStatus.SCHEDULED && (
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Cancel Appointment</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to cancel your appointment with{' '}
              <strong>
                {selectedAppointment.dietitian.firstName} {selectedAppointment.dietitian.lastName}
              </strong>{' '}
              on {formatDate(selectedAppointment.startTime)}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for cancellation (optional)
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
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
