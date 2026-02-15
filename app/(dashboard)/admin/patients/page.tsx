'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number | null;
  dateOfBirth?: string;
  gender: string | null;
  status: string;
  lastVisit: string | null;
  avatar: string | null;
  weight: string | null;
  height: string | null;
  bloodType: string | null;
  upcomingAppointments: Appointment[];
  historyAppointments: Appointment[];
  notes: Note[];
}

interface Appointment {
  id: string;
  type: string;
  title: string;
  doctor?: string;
  doctorAvatar?: string;
  location?: string;
  time: string;
  isPrimary: boolean;
  status?: string;
}

interface Note {
  text: string;
  author: string;
  date: string;
}

interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'files'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/patients?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      
      if (response.ok) {
        const data: PatientsResponse = await response.json();
        setPatients(data.patients);
        setTotalPatients(data.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load patients');
      }
    } catch (err) {
      setError('An error occurred while loading patients');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const fetchPatientDetails = useCallback(async (patient: Patient) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/admin/patients/${patient.patientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedPatient(data.patient);
      } else {
        setSelectedPatient(patient);
      }
    } catch (err) {
      setSelectedPatient(patient);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    fetchPatientDetails(patient);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Inactive
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

  const totalPages = Math.ceil(totalPatients / itemsPerPage);

  const getDefaultAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patients Directory</h2>
            <p className="text-slate-500 text-sm">Managing {totalPatients.toLocaleString()} registered patients</p>
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-md pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive">
              <p>{error}</p>
              <button 
                onClick={fetchPatients}
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
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
                      onClick={() => handlePatientSelect(patient)}
                      className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                            <img 
                              src={patient.avatar || getDefaultAvatar(patient.name)} 
                              alt={patient.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.gender || 'Not specified'}, {patient.age || '?'}y</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{patient.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{patient.email}</p>
                        <p className="text-xs text-muted-foreground">{patient.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{patient.lastVisit || 'Never'}</td>
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
                <span className="text-sm text-muted-foreground">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPatients)} of {totalPatients.toLocaleString()} patients</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    <span className="material-icons-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'border-primary bg-primary text-primary-foreground font-bold'
                            : 'border-border bg-card text-foreground hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={currentPage === totalPages}
                  >
                    <span className="material-icons-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side Panel - Patient Details */}
      <div className="w-[420px] bg-card border-l border-border overflow-y-auto hidden xl:block">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold text-foreground">Patient Details</h3>
            <button 
              onClick={() => setSelectedPatient(null)}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <span className="material-icons-outlined text-muted-foreground">close</span>
            </button>
          </div>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedPatient ? (
            <>
              {/* Profile Card */}
              <div className="bg-primary/10 dark:bg-primary/5 rounded-3xl p-6 mb-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg mb-4">
                  <img 
                    src={selectedPatient.avatar || getDefaultAvatar(selectedPatient.name)} 
                    alt={selectedPatient.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h4 className="text-lg font-bold text-foreground">{selectedPatient.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">Patient ID: {selectedPatient.id}</p>
                <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Weight</p>
                    <p className="font-bold text-foreground">{selectedPatient.weight || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Height</p>
                    <p className="font-bold text-foreground">{selectedPatient.height || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Blood</p>
                    <p className="font-bold text-foreground">{selectedPatient.bloodType || 'N/A'}</p>
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
                {(activeTab === 'upcoming' ? selectedPatient.upcomingAppointments : selectedPatient.historyAppointments)?.map((appointment: Appointment, index: number) => (
                  <div
                    key={appointment.id || index}
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
                          {appointment.doctorAvatar && (
                            <img src={appointment.doctorAvatar} alt={appointment.doctor} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{appointment.doctor}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-3">{appointment.location}</p>
                    )}
                    <div className="flex gap-2">
                      {appointment.isPrimary && activeTab === 'upcoming' ? (
                        <>
                          <button className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                            Confirm
                          </button>
                          <button className="px-2 py-1.5 bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                            <span className="material-icons-outlined text-sm">edit</span>
                          </button>
                        </>
                      ) : activeTab === 'upcoming' ? (
                        <button className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted/80 transition-colors">
                          Reschedule
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {((activeTab === 'upcoming' && (!selectedPatient.upcomingAppointments || selectedPatient.upcomingAppointments.length === 0)) ||
                  (activeTab === 'history' && (!selectedPatient.historyAppointments || selectedPatient.historyAppointments.length === 0))) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="material-icons-outlined text-4xl mb-2">event_busy</span>
                    <p className="text-sm">{activeTab === 'upcoming' ? 'No upcoming appointments' : 'No appointment history'}</p>
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
                  {selectedPatient.notes?.map((note, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-xl border-l-2 border-muted-foreground/30">
                      <p className="text-xs text-muted-foreground italic leading-relaxed">"{note.text}"</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">By {note.author} • {note.date}</p>
                    </div>
                  ))}

                  {(!selectedPatient.notes || selectedPatient.notes.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-xs">No medical notes available</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <span className="material-icons-outlined text-6xl mb-4 opacity-50">person</span>
              <p className="text-sm">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
