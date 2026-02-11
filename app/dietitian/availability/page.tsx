'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DayOfWeek } from '@/lib/entities/Availability';

interface TimeSlot {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  defaultDuration: number;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.MONDAY, label: 'Monday' },
  { value: DayOfWeek.TUESDAY, label: 'Tuesday' },
  { value: DayOfWeek.WEDNESDAY, label: 'Wednesday' },
  { value: DayOfWeek.THURSDAY, label: 'Thursday' },
  { value: DayOfWeek.FRIDAY, label: 'Friday' },
  { value: DayOfWeek.SATURDAY, label: 'Saturday' },
  { value: DayOfWeek.SUNDAY, label: 'Sunday' },
];

export default function DietitianAvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/availability');
      if (response.ok) {
        const data = await response.json();
        const formattedSlots: TimeSlot[] = (data.availability || []).map((a: any) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
          defaultDuration: a.defaultDuration || 60,
        }));
        setSlots(formattedSlots);
      }
    } catch (err) {
      setError('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  const addSlot = (day: DayOfWeek) => {
    const newSlot: TimeSlot = {
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
      defaultDuration: 60,
    };
    setSlots([...slots, newSlot]);
  };

  const updateSlot = (day: DayOfWeek, slotIndex: number, field: keyof TimeSlot, value: any) => {
    const daySlots = slots.filter(s => s.dayOfWeek === day);
    const slotToUpdate = daySlots[slotIndex];
    const updated = slots.map(slot => 
      slot === slotToUpdate ? { ...slot, [field]: value } : slot
    );
    setSlots(updated);
  };

  const removeSlot = (day: DayOfWeek, slotIndex: number) => {
    const daySlots = slots.filter(s => s.dayOfWeek === day);
    const slotToRemove = daySlots[slotIndex];
    const updated = slots.filter(s => s !== slotToRemove);
    setSlots(updated);
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const availability = slots
        .filter(s => s.isAvailable)
        .map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.isAvailable,
          defaultDuration: s.defaultDuration,
        }));

      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });

      if (response.ok) {
        setSuccess('Availability saved successfully');
        fetchAvailability();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save availability');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotsForDay = (day: DayOfWeek) => {
    return slots.filter(s => s.dayOfWeek === day);
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
          <h1 className="text-2xl font-bold text-[#1e293b]">Availability Management</h1>
          <p className="text-slate-500">Set your working hours and availability for appointments</p>
        </div>
        <button
          onClick={saveAvailability}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-[#facc15] text-slate-900 font-medium rounded-xl hover:bg-[#eab308] transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-6">
        {DAYS.map((day) => {
          const daySlots = getSlotsForDay(day.value);
          const hasActiveSlot = daySlots.some(s => s.isAvailable);

          return (
            <div
              key={day.value}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#facc15]" />
                  <h3 className="font-semibold text-[#1e293b]">{day.label}</h3>
                  {hasActiveSlot && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Available
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addSlot(day.value)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#facc15] text-slate-900 font-medium rounded-lg hover:bg-[#eab308] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              </div>

              <div className="p-6">
                {daySlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No time slots set for {day.label}</p>
                    <p className="text-sm mt-1">Click "Add Time Slot" to set your availability</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {daySlots.map((slot, index) => (
                      <div
                        key={`${day.value}-${index}`}
                        className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">From</span>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(day.value, index, 'startTime', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
                          />
                          <span className="text-sm font-medium text-slate-700">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(day.value, index, 'endTime', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Duration:</span>
                          <select
                            value={slot.defaultDuration}
                            onChange={(e) => updateSlot(day.value, index, 'defaultDuration', parseInt(e.target.value))}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
                          >
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                            <option value={90}>90 min</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={slot.isAvailable}
                              onChange={(e) => updateSlot(day.value, index, 'isAvailable', e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-[#facc15] focus:ring-[#facc15]"
                            />
                            <span className="text-sm font-medium text-slate-700">Active</span>
                          </label>

                          <button
                            onClick={() => removeSlot(day.value, index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
