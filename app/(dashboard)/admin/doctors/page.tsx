'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialty: string;
  rating: number;
  experience: string;
  patients: string;
  status: string;
  avatar: string;
  image?: string;
  fee?: number;
  available?: boolean;
}

interface ScheduleItem {
  time: string;
  period: string;
  title: string;
  patient: string;
  location?: string;
  type: string;
  status: string;
}

interface DoctorDetail {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  doctorProfile?: {
    specialty: string;
    yearsOfExperience: number;
    totalPatients: number;
    consultationFee: number;
    professionalSummary?: string;
    subSpecialties?: string[];
  };
  rating?: number;
  totalReviews?: number;
}

const calendarDays = [
  26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
];

const getStatusDot = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'primary':
      return 'bg-slate-300 dark:bg-slate-600';
    default:
      return 'bg-slate-300';
  }
};

const getCardStyle = (status: string) => {
  switch (status) {
    case 'primary':
      return 'bg-card shadow-md border-2 border-primary';
    default:
      return 'bg-card shadow-sm border border-border hover:shadow-md transition-shadow';
  }
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const getScheduleItemStyle = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-primary/10 border-l-4 border-primary';
    case 'pending':
      return 'bg-muted/50 border-l-4 border-muted-foreground/30 opacity-60';
    default:
      return '';
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'In-Person':
      return 'bg-primary text-primary-foreground';
    case 'Virtual':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Pending':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 1, 15));
  const [stats, setStats] = useState({ total: 0, specialists: 0, activeNow: 0, onCall: 0 });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorDetail(selectedDoctor.id);
    }
  }, [selectedDoctor, activeTab, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors/list?limit=100');
      const data = await response.json();
      const doctorsData = data.doctors || [];
      setDoctors(doctorsData);
      
      const specialists = doctorsData.filter((d: Doctor) => d.specialty && d.specialty !== 'General Practice').length;
      const activeNow = doctorsData.filter((d: Doctor) => d.available).length;
      
      setStats({
        total: data.pagination?.total || doctorsData.length,
        specialists,
        activeNow,
        onCall: Math.floor(activeNow / 3),
      });

      if (doctorsData.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctorsData.find((d: Doctor) => d.status === 'primary') || doctorsData[0]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorDetail = async (doctorId: string) => {
    setLoadingDetail(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = activeTab === 'upcoming' ? today.toISOString() : undefined;
      const endDate = activeTab === 'past' ? today.toISOString() : undefined;
      
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const startOfDay = new Date(selectedDateStr);
      const endOfDay = new Date(selectedDateStr);
      endOfDay.setHours(23, 59, 59, 999);

      const [detailRes, appointmentsRes] = await Promise.all([
        fetch(`/api/doctors/${doctorId}`),
        fetch(`/api/appointments?doctorId=${doctorId}&startDate=${encodeURIComponent(startOfDay.toISOString())}&endDate=${encodeURIComponent(endOfDay.toISOString())}&limit=20`),
      ]);

      const detailData = await detailRes.json();
      const appointmentsData = await appointmentsRes.json();

      setDoctorDetail(detailData);

      const now = new Date();
      const allAppointments = (appointmentsData.appointments || []).map((apt: { startTime: string; title?: string; patient?: { firstName: string; lastName: string }; location?: string; type: string; status: string }) => ({
        time: new Date(apt.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        period: new Date(apt.startTime).getHours() >= 12 ? 'PM' : 'AM',
        title: apt.title || 'Appointment',
        patient: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Patient',
        location: apt.location || undefined,
        type: apt.type === 'virtual' ? 'Virtual' : 'In-Person',
        status: apt.status === 'confirmed' ? 'confirmed' : apt.status === 'pending' ? 'pending' : 'confirmed',
        startTime: new Date(apt.startTime),
      }));

      const filteredAppointments = allAppointments.filter((apt: { startTime: Date }) => {
        const isUpcoming = apt.startTime >= now;
        return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
      });

      setSchedule(filteredAppointments);
    } catch (error) {
      console.error('Error fetching doctor detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Doctors Directory</h2>
          <p className="text-muted-foreground">Manage your medical practitioners and their schedules</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform active:scale-95">
          <Plus className="w-5 h-5" />
          Add New Doctor
        </button>
      </header>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-sm font-medium">
          Total {stats.total}
        </div>
        <div className="px-4 py-2 bg-primary/10 text-foreground dark:bg-primary/20 dark:text-primary rounded-full text-sm font-medium border border-primary/20">
          Specialists {stats.specialists}
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
          Active Now {stats.activeNow}
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
          On Call {stats.onCall}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Doctors Grid */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`${getCardStyle(doctor.status)} rounded-3xl p-6 cursor-pointer group ${
                  selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                      {doctor.avatar || doctor.image ? (
                        <img src={doctor.avatar || doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{getInitials(doctor.name)}</span>
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(doctor.status)} border-2 border-card rounded-full`}></span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-foreground">{doctor.name}</h3>
                      <div className="flex items-center text-amber-500 gap-1 text-sm font-bold">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {doctor.rating?.toFixed(1) || doctor.rating}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-[11px] rounded-lg ${
                        doctor.status === 'primary'
                          ? 'bg-primary/20 text-primary-foreground dark:text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {typeof doctor.experience === 'number' ? `${doctor.experience} Years` : doctor.experience} Exp.
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-[11px] rounded-lg">
                        {doctor.patients} Patients
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Schedule Section */}
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedDoctor?.name || 'Doctor'}&apos;s Schedule</h3>
                <p className="text-muted-foreground text-sm">Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="flex bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'past'
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {schedule.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-24 text-right">
                    <p className={`text-lg font-bold ${item.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {item.time}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{item.period}</p>
                  </div>
                  <div className={`flex-1 pb-6 border-b border-border ${index === schedule.length - 1 ? 'border-0 pb-0' : ''}`}>
                    <div className={`p-4 rounded-xl flex items-center justify-between ${getScheduleItemStyle(item.status)}`}>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Patient: {item.patient}
                          {item.location && ` • ${item.location}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel - Doctor Details */}
        <div className="space-y-8">
          {/* Hero Card */}
          <div className="bg-zinc-900 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="relative h-64 overflow-hidden">
              {loadingDetail ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
              ) : doctorDetail?.profilePicture || selectedDoctor?.avatar ? (
                <img
                  src={doctorDetail?.profilePicture || selectedDoctor?.avatar}
                  alt={selectedDoctor?.name || 'Doctor'}
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-6xl font-bold text-zinc-600">{getInitials(selectedDoctor?.name)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-primary text-foreground px-3 py-1 rounded-full text-xs font-bold">
                ${doctorDetail?.doctorProfile?.consultationFee || selectedDoctor?.fee || 120}/hr
              </div>
            </div>
            <div className="p-8 relative -mt-20">
              <h2 className="text-2xl font-bold">{selectedDoctor?.name || 'Select a Doctor'}</h2>
              <p className="text-slate-400">{selectedDoctor?.specialty || 'Specialty'}</p>
              <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xl font-bold">{doctorDetail?.doctorProfile?.totalPatients || selectedDoctor?.patients || 0}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{doctorDetail?.doctorProfile?.yearsOfExperience || (typeof selectedDoctor?.experience === 'string' ? selectedDoctor?.experience?.split(' ')[0] : selectedDoctor?.experience) || 0}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Years Exp.</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{doctorDetail?.rating?.toFixed(1) || selectedDoctor?.rating || 0}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">About</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {doctorDetail?.doctorProfile?.professionalSummary || 'No information available.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {doctorDetail?.doctorProfile?.subSpecialties?.map((sub, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">{sub}</span>
                  ))}
                  {!doctorDetail?.doctorProfile?.subSpecialties && (
                    <>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">General Practice</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <button className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-bold text-foreground">February 2026</h4>
              <button className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground mb-2">
              <div>MO</div>
              <div>TU</div>
              <div>WE</div>
              <div>TH</div>
              <div>FR</div>
              <div>SA</div>
              <div>SU</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
              {calendarDays.map((day, index) => {
                const isSelected = day === selectedDate.getDate();
                return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(new Date(2026, 1, day))}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold'
                      : day < 26
                      ? 'text-muted-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {day}
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
