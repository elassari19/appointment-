'use client';

import { useState } from 'react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiologist',
    rating: 4.9,
    experience: '12 Years',
    patients: 156,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    rating: 4.8,
    experience: '8 Years',
    patients: 89,
    status: 'primary',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    specialty: 'Pediatrician',
    rating: 5.0,
    experience: '15 Years',
    patients: 240,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Dermatologist',
    rating: 4.7,
    experience: '6 Years',
    patients: 64,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
  },
];

const schedule = [
  {
    time: '09:00',
    period: 'AM',
    title: 'Brain Scan Consultation',
    patient: 'Robert Fox',
    location: 'Room 304',
    type: 'In-Person',
    status: 'confirmed',
  },
  {
    time: '11:30',
    period: 'AM',
    title: 'Follow-up Call',
    patient: 'Jane Cooper',
    type: 'Virtual',
    status: 'confirmed',
  },
  {
    time: '02:00',
    period: 'PM',
    title: 'Neurology Review',
    patient: 'Guy Hawkins',
    location: 'Ward B',
    type: 'Pending',
    status: 'pending',
  },
];

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
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[1]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Doctors Directory</h2>
          <p className="text-muted-foreground">Manage your medical practitioners and their schedules</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform active:scale-95">
          <span className="material-icons-outlined">person_add</span>
          Add New Doctor
        </button>
      </header>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-sm font-medium">
          Total 42
        </div>
        <div className="px-4 py-2 bg-primary/10 text-foreground dark:bg-primary/20 dark:text-primary rounded-full text-sm font-medium border border-primary/20">
          Specialists 31
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
          Active Now 12
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
          On Call 4
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Doctors Grid */}
        <div className="xl:col-span-2 space-y-4">
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
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted">
                      <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(doctor.status)} border-2 border-card rounded-full`}></span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-foreground">{doctor.name}</h3>
                      <div className="flex items-center text-amber-500 gap-1 text-sm font-bold">
                        <span className="material-icons-outlined text-sm">star</span>
                        {doctor.rating}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-[11px] rounded-lg ${
                        doctor.status === 'primary'
                          ? 'bg-primary/20 text-primary-foreground dark:text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {doctor.experience} Exp.
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

          {/* Schedule Section */}
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">Dr. Michael Chen's Schedule</h3>
                <p className="text-muted-foreground text-sm">Appointments for Feb 2026</p>
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
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop"
                alt="Doctor Hero"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-primary text-foreground px-3 py-1 rounded-full text-xs font-bold">
                $120/hr
              </div>
            </div>
            <div className="p-8 relative -mt-20">
              <h2 className="text-2xl font-bold">{selectedDoctor.name}</h2>
              <p className="text-slate-400">{selectedDoctor.specialty}</p>
              <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xl font-bold">{selectedDoctor.patients}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{selectedDoctor.experience.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Years Exp.</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{selectedDoctor.rating}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">About</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Specializing in neurodegenerative disorders and advanced brain imaging. Member of the National Board of Neurologists.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">Epilepsy</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">Memory Care</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">Stroke Rehab</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <button className="material-icons-outlined text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                chevron_left
              </button>
              <h4 className="font-bold text-foreground">February 2026</h4>
              <button className="material-icons-outlined text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                chevron_right
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
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    day === 15
                      ? 'bg-primary text-primary-foreground font-bold'
                      : day < 26
                      ? 'text-muted-foreground'
                      : 'text-foreground hover:bg-muted transition-colors cursor-pointer'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
