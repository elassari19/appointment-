'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, User, Star, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, Repeat, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { RecurrenceFrequency } from '@/lib/entities/Appointment';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Doctor {
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
  status?: 'available' | 'booked';
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ 
  amount, 
  onSuccess, 
  onError,
  clientSecret,
  isProcessing,
  setIsProcessing 
}: { 
  amount: number; 
  onSuccess: () => void;
  onError: (error: string) => void;
  clientSecret: string | null;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  if (!clientSecret) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 bg-[#facc15] text-slate-900 font-medium rounded-xl hover:bg-[#eab308] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {amount} SAR
          </>
        )}
      </button>
    </form>
  );
}

export default function BookAppointmentPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [weeklySlots, setWeeklySlots] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.WEEKLY);
  const [recurrenceCount, setRecurrenceCount] = useState(4);
  const [bookedMeetingLink, setBookedMeetingLink] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/doctors?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async (doctorId: string, date: Date) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/availability?doctorId=${doctorId}&date=${date.toISOString()}&week=true`
      );
      if (response.ok) {
        const data = await response.json();
        setWeeklySlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    fetchAvailability(doctor.id, selectedDate);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
    if (selectedDoctor) {
      fetchAvailability(selectedDoctor.id, newDate);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setIsLoading(true);
    setError('');

    try {
      const startTime = new Date(selectedSlot.start);
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          startTime: startTime.toISOString(),
          duration: 60,
          notes,
          createMeetLink: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setClientSecret(data.clientSecret);
        setAppointmentId(data.appointmentId);
        setPaymentAmount(data.amount);
        setStep(3);
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('An error occurred while initializing payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const startTime = new Date(selectedSlot!.start);
      const response = await fetch('/api/appointments/book-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor!.id,
          startTime: startTime.toISOString(),
          duration: 60,
          notes,
          createMeetLink: true,
          appointmentId: appointmentId,
          paymentCompleted: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookedMeetingLink(data.appointment.meetingLink || null);
        setStep(5);
      } else {
        setError(data.error || 'Failed to confirm appointment');
      }
    } catch (err) {
      setError('An error occurred while confirming appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handleBookRecurringAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setIsLoading(true);
    setError('');

    try {
      const startTime = new Date(selectedSlot.start);
      const response = await fetch('/api/appointments/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          startTime: startTime.toISOString(),
          duration: 60,
          notes,
          recurrenceFrequency,
          recurrenceCount,
        }),
      });

      if (response.ok) {
        setStep(5);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to book recurring appointments');
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

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startMonth} ${startOfWeek.getFullYear()}`;
    }
    return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${startOfWeek.getFullYear()}`;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">Book Appointment</h1>
        <p className="text-slate-500">Schedule a consultation with our expert doctors</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <span className="font-medium whitespace-nowrap">Select Doctor</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 min-w-[20px]" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
          </div>
          <span className="font-medium whitespace-nowrap">Choose Time</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 min-w-[20px]" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
          </div>
          <span className="font-medium whitespace-nowrap">Payment</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 min-w-[20px]" />
        <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 4 ? <CheckCircle2 className="w-5 h-5" /> : '4'}
          </div>
          <span className="font-medium whitespace-nowrap">Confirm</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 min-w-[20px]" />
        <div className={`flex items-center gap-2 ${step >= 5 ? 'text-[#facc15]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-[#facc15] text-slate-900' : 'bg-slate-200'}`}>
            {step > 5 ? <CheckCircle2 className="w-5 h-5" /> : '5'}
          </div>
          <span className="font-medium whitespace-nowrap">Done</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
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
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-lg">
                      {doctor.firstName[0]}{doctor.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1e293b]">
                        {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{doctor.specialty || 'Doctor'}</p>
                      {doctor.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {doctor.consultationFee && doctor.consultationFee > 0 && (
                        <div className="mt-2 text-sm font-medium text-[#facc15]">
                          {doctor.consultationFee} SAR / session
                        </div>
                      )}
                    </div>
                  </div>
                  {doctor.bio && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-2">{doctor.bio}</p>
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

      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#facc15] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to doctors
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold text-xl">
                {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1e293b]">
                  {selectedDoctor.firstName} {selectedDoctor.lastName}
                </h3>
                <p className="text-slate-500">{selectedDoctor.specialty || 'Doctor'}</p>
                {selectedDoctor.consultationFee && selectedDoctor.consultationFee > 0 && (
                  <p className="text-sm font-medium text-[#facc15] mt-1">
                    {selectedDoctor.consultationFee} SAR / session
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-[#1e293b]">
                {formatWeekRange(selectedDate)}
              </h3>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#facc15]" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weeklySlots.map((day, idx) => {
                  const date = new Date(day.date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                  const hasSlots = day.slots.length > 0;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center p-3 rounded-xl border ${
                        isPast
                          ? 'border-slate-100 bg-slate-50 opacity-50'
                          : hasSlots
                          ? 'border-slate-200 hover:border-[#facc15] bg-white'
                          : 'border-slate-100 bg-slate-50'
                      } transition-colors`}
                    >
                      <span className="text-xs font-medium text-slate-500">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={`text-lg font-bold ${isToday ? 'text-[#facc15]' : 'text-[#1e293b]'}`}>
                        {date.getDate()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>

                      {hasSlots && !isPast && (
                        <div className="mt-2 w-full space-y-1 max-h-40 overflow-y-auto">
                          {day.slots.map((slot, slotIdx) => {
                            const isBooked = slot.status === 'booked';
                            return (
                              <button
                                key={slotIdx}
                                disabled={isBooked}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setSelectedDate(date);
                                  setStep(3);
                                }}
                                className={`w-full py-1 px-2 text-xs rounded transition-colors font-medium ${
                                  isBooked
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                    : 'bg-[#facc15]/10 hover:bg-[#facc15] hover:text-slate-900'
                                }`}
                              >
                                {new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!hasSlots && !isPast && (
                        <span className="mt-2 text-xs text-slate-400">No slots</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && selectedDoctor && selectedSlot && !clientSecret && (
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
                  {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-[#1e293b]">
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500">Doctor</p>
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

              <div className="p-4 bg-[#facc15]/10 border border-[#facc15]/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1e293b]">Consultation Fee</span>
                  <span className="text-xl font-bold text-[#facc15]">
                    {selectedDoctor.consultationFee || 0} SAR
                  </span>
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
              onClick={handleProceedToPayment}
              disabled={isLoading || !selectedDoctor.consultationFee}
              className="mt-6 w-full py-3 bg-[#facc15] text-slate-900 font-medium rounded-xl hover:bg-[#eab308] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !selectedDoctor.consultationFee ? (
                'Consultation fee not available'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 3 && clientSecret && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setClientSecret(null);
              setStep(3);
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-[#facc15] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to details
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Payment</h3>
            
            <div className="p-4 bg-[#facc15]/10 border border-[#facc15]/30 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#1e293b]">Total Amount</span>
                <span className="text-2xl font-bold text-[#facc15]">
                  {paymentAmount} SAR
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Consultation with Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
              </p>
            </div>

            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#facc15',
                    colorBackground: '#f8fafc',
                    colorText: '#1e293b',
                  },
                },
              }}
            >
              <PaymentForm 
                amount={paymentAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                clientSecret={clientSecret}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </Elements>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Your payment is secured by Stripe
            </p>
          </div>
        </div>
      )}

      {step === 4 && selectedDoctor && selectedSlot && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#facc15] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to payment
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Confirm Appointment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 bg-[#facc15]/20 rounded-full flex items-center justify-center text-[#facc15] font-bold">
                  {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-[#1e293b]">
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500">Doctor</p>
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

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Payment Successful</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookRecurringAppointment}
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

      {step === 5 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#1e293b] mb-2">
            {isRecurring ? 'Recurring Appointments Booked!' : 'Appointment Booked!'}
          </h2>
          <p className="text-slate-600 mb-6">
            {isRecurring
              ? `Your ${recurrenceCount} recurring appointments have been successfully scheduled. You will receive confirmation emails for each session.`
              : 'Your appointment has been successfully scheduled. You will receive a confirmation email shortly.'}
          </p>
          
          {bookedMeetingLink && !isRecurring && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-600 mb-2 font-medium">Your Google Meet Link</p>
              <a
                href={bookedMeetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Join Google Meet
              </a>
              <p className="text-xs text-blue-500 mt-2">
                This link will also be sent to your email
              </p>
            </div>
          )}
          
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
