'use client';

import { useState } from 'react';

const patients = [
  {
    id: '#PT-8274',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 234-567-890',
    age: 28,
    gender: 'Female',
    status: 'Active',
    lastVisit: 'Oct 24, 2025',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    weight: '54 kg',
    height: '165 cm',
    bloodType: 'O+',
    appointments: [
      {
        type: 'Cardiology',
        title: 'Heart Rhythm Checkup',
        doctor: 'Dr. Aris Thorne',
        doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
        time: 'Tomorrow, 10:00 AM',
        isPrimary: true,
      },
      {
        type: 'Lab Test',
        title: 'Blood Analysis - Lipid Panel',
        location: 'Room 402, Level 2',
        time: 'Oct 28, 08:30 AM',
        isPrimary: false,
      },
    ],
    notes: [
      {
        text: "Patient reported mild chest tightness during morning exercise. EKG results normal. Suggested monitoring sodium intake.",
        author: 'Dr. Mitchell',
        date: 'Oct 15, 2025',
      },
    ],
  },
  {
    id: '#PT-8102',
    name: 'Robert Fox',
    email: 'robert.fox@email.com',
    phone: '+1 234-998-123',
    age: 42,
    gender: 'Male',
    status: 'Active',
    lastVisit: 'Oct 22, 2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    weight: '78 kg',
    height: '180 cm',
    bloodType: 'A+',
    appointments: [],
    notes: [],
  },
  {
    id: '#PT-7945',
    name: 'Emily Davis',
    email: 'emily.d@webmail.com',
    phone: '+1 555-010-999',
    age: 31,
    gender: 'Female',
    status: 'On Leave',
    lastVisit: 'Oct 19, 2025',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    weight: '62 kg',
    height: '170 cm',
    bloodType: 'B+',
    appointments: [],
    notes: [],
  },
  {
    id: '#PT-7721',
    name: 'Kevin Heart',
    email: 'k.heart@example.com',
    phone: '+1 234-888-001',
    age: 38,
    gender: 'Male',
    status: 'Active',
    lastVisit: 'Oct 15, 2025',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    weight: '85 kg',
    height: '175 cm',
    bloodType: 'AB+',
    appointments: [],
    notes: [],
  },
  {
    id: '#PT-7690',
    name: 'Alice Moore',
    email: 'alice.m@domain.com',
    phone: '+1 555-222-333',
    age: 45,
    gender: 'Female',
    status: 'Canceled',
    lastVisit: 'Oct 12, 2025',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    weight: '58 kg',
    height: '162 cm',
    bloodType: 'O-',
    appointments: [],
    notes: [],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Active
        </span>
      );
    case 'On Leave':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          On Leave
        </span>
      );
    case 'Canceled':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Canceled
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {status}
        </span>
      );
  }
};

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'files'>('upcoming');

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patients Directory</h2>
            <p className="text-slate-500 text-sm">Managing 1,284 registered patients</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
              <span className="material-icons-outlined text-sm">filter_list</span> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
              <span className="material-icons-outlined text-sm">file_download</span> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary/5 border-l-4 border-primary'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.gender}, {patient.age}y</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{patient.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{patient.email}</p>
                    <p className="text-xs text-muted-foreground">{patient.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{patient.lastVisit}</td>
                  <td className="px-6 py-4">{getStatusBadge(patient.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <span className="material-icons-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-muted/50 flex items-center justify-between border-t border-border">
            <span className="text-sm text-muted-foreground">Showing 1 to 5 of 1,284 patients</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-50" disabled>
                <span className="material-icons-outlined text-sm">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded-lg border border-primary bg-primary text-primary-foreground font-bold text-sm">1</button>
              <button className="px-3 py-1 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">2</button>
              <button className="px-3 py-1 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">3</button>
              <button className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors">
                <span className="material-icons-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel - Patient Details */}
      <div className="w-[420px] bg-card border-l border-border overflow-y-auto hidden xl:block">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold text-foreground">Patient Details</h3>
            <button className="p-2 hover:bg-muted rounded-xl transition-colors">
              <span className="material-icons-outlined text-muted-foreground">close</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-primary/10 dark:bg-primary/5 rounded-3xl p-6 mb-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg mb-4">
              <img src={selectedPatient?.avatar} alt={selectedPatient?.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-lg font-bold text-foreground">{selectedPatient?.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">Patient ID: {selectedPatient?.id}</p>
            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Weight</p>
                <p className="font-bold text-foreground">{selectedPatient?.weight}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Height</p>
                <p className="font-bold text-foreground">{selectedPatient?.height}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Blood</p>
                <p className="font-bold text-foreground">{selectedPatient?.bloodType}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Files
            </button>
          </div>

          {/* Appointments */}
          <div className="space-y-4">
            {selectedPatient?.appointments?.map((appointment, index) => (
              <div
                key={index}
                className={`bg-muted/50 p-4 rounded-2xl border border-border/50 relative overflow-hidden ${
                  appointment.isPrimary ? '' : ''
                }`}
              >
                {appointment.isPrimary && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-primary"></div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    appointment.isPrimary ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {appointment.type}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">{appointment.time}</span>
                </div>
                <h5 className="font-bold text-sm text-foreground mb-1">{appointment.title}</h5>
                {appointment.doctor ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                      <img src={appointment.doctorAvatar} alt={appointment.doctor} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-muted-foreground">{appointment.doctor}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">{appointment.location}</p>
                )}
                <div className="flex gap-2">
                  {appointment.isPrimary ? (
                    <>
                      <button className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Confirm
                      </button>
                      <button className="px-2 py-1.5 bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted/80 transition-colors">
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))}

            {selectedPatient?.appointments?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span className="material-icons-outlined text-4xl mb-2">event_busy</span>
                <p className="text-sm">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Recent Medical Notes */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-foreground">Recent Medical Notes</h4>
              <button className="text-primary text-xs font-bold hover:opacity-80 transition-opacity">View All</button>
            </div>
            <div className="space-y-4">
              {selectedPatient?.notes?.map((note, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-xl border-l-2 border-muted-foreground/30">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">"{note.text}"</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">By {note.author} • {note.date}</p>
                </div>
              ))}

              {selectedPatient?.notes?.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs">No medical notes available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
