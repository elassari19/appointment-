'use client';

import { useState } from 'react';

interface Appointment {
  id: string;
  startTime: string;
  duration: number;
  doctor?: {
    firstName: string;
    lastName: string;
    specialty?: string;
  };
}

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RescheduleModal({ appointment, isOpen, onClose, onSuccess }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const currentDate = new Date(appointment.startTime);
  const minDate = new Date().toISOString().split('T')[0];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setIsRescheduling(true);
    setError('');

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`).toISOString();
      
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleClose = () => {
    setSelectedDate('');
    setSelectedTime('');
    setError('');
    onClose();
  };

  const formatCurrentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Reschedule Appointment</h3>
        
        <p className="text-slate-600 mb-4 text-sm">
          Current: <strong>{formatCurrentDate(appointment.startTime)}</strong>
        </p>

        {appointment.doctor && (
          <p className="text-slate-600 mb-4 text-sm">
            Doctor: <strong>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</strong>
            {appointment.doctor.specialty && (
              <span className="text-slate-500"> - {appointment.doctor.specialty}</span>
            )}
          </p>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isRescheduling}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={isRescheduling || !selectedDate || !selectedTime}
            className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isRescheduling ? 'Rescheduling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
