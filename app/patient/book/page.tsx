'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, User, Star, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';

interface Dietitian {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  specialty?: string;
  rating?: number;
  consultationFee?: number;
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function BookAppointmentPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [selectedDietitian, setSelectedDietitian] = useState<Dietitian | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDietitians();
  }, [searchQuery]);

  const fetchDietitians = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/dietitians?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setDietitians(data.dietitians || []);
      }
    } catch (err) {
      console.error('Failed to fetch dietitians:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async (dietitianId: string, date: Date) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/availability?dietitianId=${dietitianId}&date=${date.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDietitian = (dietitian: Dietitian) => {
    setSelectedDietitian(dietitian);
    setStep(2);
    fetchAvailability(dietitian.id, selectedDate);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
    if (selectedDietitian) {
      fetchAvailability(selectedDietitian.id, newDate);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDietitian || !selectedSlot) return;

    setIsLoading(true);
    setError('');

    try {
      const startTime = new Date(selectedSlot.start);
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietitianId: selectedDietitian.id,
          startTime: startTime.toISOString(),
          duration: 60,
          notes,
        }),
      });

      if (response.ok) {
        setStep(4);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('An error occurred while booking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">Book Appointment</h1>
        <p className="text-slate-500">Schedule a consultation with our expert dietitians</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <span className="font-medium">Select Dietitian</span>
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
          </div>
          <span className="font-medium">Choose Time</span>
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
          </div>
          <span className="font-medium">Confirm</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search dietitians by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#facc15]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dietitians.map((dietitian) => (
                <div
                  key={dietitian.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSelectDietitian(dietitian)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-lg">
                      {dietitian.firstName[0]}{dietitian.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1e293b]">
                        {dietitian.firstName} {dietitian.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{dietitian.specialty || 'Dietitian'}</p>
                      {dietitian.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{dietitian.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {dietitian.bio && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-2">{dietitian.bio}</p>
                  )}
                  <button className="mt-4 w-full py-2 bg-[#facc15] text-slate-900 font-medium rounded-lg hover:bg-[#eab308] transition-colors">
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedDietitian && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#facc15] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to dietitians
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-xl">
                {selectedDietitian.firstName[0]}{selectedDietitian.lastName[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1e293b]">
                  {selectedDietitian.firstName} {selectedDietitian.lastName}
                </h3>
                <p className="text-slate-500">{selectedDietitian.specialty || 'Dietitian'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#facc15]" />
              Select Date
            </h3>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-[#1e293b]">{formatDate(selectedDate)}</span>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-md font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#facc15]" />
              Available Slots
            </h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#facc15]" />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep(3);
                    }}
                    className="py-2 px-3 border border-slate-200 rounded-lg hover:border-[#facc15] hover:bg-[#facc15]/10 transition-colors text-sm font-medium"
                  >
                    {new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No available slots for this date</p>
            )}
          </div>
        </div>
      )}

      {step === 3 && selectedDietitian && selectedSlot && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#facc15] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to time selection
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Confirm Appointment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold">
                  {selectedDietitian.firstName[0]}{selectedDietitian.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-[#1e293b]">
                    {selectedDietitian.firstName} {selectedDietitian.lastName}
                  </p>
                  <p className="text-sm text-slate-500">Dietitian</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Date</p>
                  <p className="font-medium">{formatDate(selectedDate)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Time</p>
                  <p className="font-medium">
                    {new Date(selectedSlot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your health concerns or goals..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
                  rows={4}
                />
              </div>
            </div>

            <button
              onClick={handleBookAppointment}
              disabled={isLoading}
              className="mt-6 w-full py-3 bg-[#facc15] text-slate-900 font-medium rounded-xl hover:bg-[#eab308] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#1e293b] mb-2">Appointment Booked!</h2>
          <p className="text-slate-600 mb-6">
            Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/patient')}
              className="px-6 py-2 bg-[#facc15] text-slate-900 font-medium rounded-lg hover:bg-[#eab308] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
