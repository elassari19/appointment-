'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Video, MapPin, Phone, Mail, GraduationCap, 
  Award, Globe, Languages, X, Loader2, AlertCircle, CheckCircle2, 
  XCircle, ChevronRight, Stethoscope, Building2, DollarSign, Star,
  ExternalLink, BookOpen, Clock3, Users
} from 'lucide-react';
import { AppointmentStatus } from '@/lib/entities/Appointment';

interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  year: number;
  description?: string;
}

interface LanguageEntry {
  name: string;
  level: 'Basic' | 'Conversational' | 'Professional' | 'Native';
  isPrimary: boolean;
}

interface AwardEntry {
  title: string;
  organization: string;
  year: number;
  description?: string;
}

interface DoctorProfile {
  specialty: string | null;
  subSpecialties: string[];
  yearsOfExperience: number | null;
  medicalSchool: string | null;
  residency: string | null;
  fellowship: string | null;
  boardCertifications: string[];
  clinicName: string | null;
  clinicAddress: string | null;
  clinicPhone: string | null;
  consultationFee: number | null;
  telemedicineEnabled: boolean;
  acceptingNewPatients: boolean;
  professionalSummary: string | null;
  education: EducationEntry[];
  languages: LanguageEntry[];
  awards: AwardEntry[];
  professionalMemberships: string[];
  websiteUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  totalPatients: number | null;
  totalAppointments: number | null;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  profile: DoctorProfile | null;
}

interface Appointment {
  id: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  doctor: Doctor | null;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDoctorPanel, setShowDoctorPanel] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (showDoctorPanel) {
      // Small delay to ensure the panel is rendered before animating in
      requestAnimationFrame(() => {
        setPanelOpen(true);
      });
    }
  }, [showDoctorPanel]);

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

  const handleCardClick = (appointment: Appointment) => {
    if (appointment.doctor) {
      setSelectedDoctor(appointment.doctor);
      setShowDoctorPanel(true);
    }
  };

  const closeDoctorPanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setShowDoctorPanel(false);
      setSelectedDoctor(null);
    }, 400);
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
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-700 border-green-200';
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-700 border-red-200';
      case AppointmentStatus.NO_SHOW:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
              onClick={() => handleCardClick(appointment)}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#facc15]/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {appointment.doctor?.profilePicture ? (
                      <img 
                        src={appointment.doctor.profilePicture} 
                        alt={`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-[#facc15]" />
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="font-semibold text-[#1e293b] text-lg">
                      Dr. {appointment.doctor?.firstName || 'Unknown'} {appointment.doctor?.lastName || ''}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {appointment.doctor?.profile?.specialty || 'Healthcare Professional'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pl-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(appointment.startTime)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatTime(appointment.startTime)} ({appointment.duration} min)
                    </span>
                  </div>

                  <div className="flex items-center justify-around sm:gap-3 mt-3">
                    {appointment.doctor?.phone && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="hidden sm:inline">{appointment.doctor.phone}</span>
                        <span className="sm:hidden">Call</span>
                      </span>
                    )}
                    {appointment.doctor?.email && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline">{appointment.doctor.email}</span>
                        <span className="sm:hidden">Email</span>
                      </span>
                    )}
                    {appointment.doctor?.profile?.clinicAddress && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="hidden sm:inline">{appointment.doctor.profile.clinicAddress}</span>
                        <span className="sm:hidden">Map</span>
                      </span>
                    )}
                  </div>

                  {appointment.meetingLink && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="hidden sm:inline">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                    <span className="sm:hidden">{appointment.status.slice(0, 3)}</span>
                  </span>
                  {appointment.status === AppointmentStatus.SCHEDULED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appointment);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors sm:p-2 sm:bg-transparent sm:hover:bg-red-50"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="sm:hidden text-sm font-medium">Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Cancel Appointment</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to cancel your appointment with{' '}
              <strong>
                Dr. {selectedAppointment.doctor?.firstName || 'Unknown'} {selectedAppointment.doctor?.lastName || ''}
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

      {/* Doctor Details Slide Panel */}
      {showDoctorPanel && selectedDoctor && (
        <>
          <div 
            className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all duration-400 ease-out ${
              panelOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeDoctorPanel}
          />
          <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-all duration-400 ease-out overflow-hidden flex flex-col ${
            panelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-br from-[#facc15] to-amber-400 flex-shrink-0">
              <button
                onClick={closeDoctorPanel}
                className={`absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 ${
                  panelOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
              <div className={`absolute -bottom-12 left-8 transition-all duration-500 ease-out delay-100 ${
                panelOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'
              }`}>
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                  {selectedDoctor.profilePicture ? (
                    <img 
                      src={selectedDoctor.profilePicture} 
                      alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto pt-16 px-8 pb-8 transition-all duration-500 ease-out ${
              panelOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {/* Basic Info */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1e293b] mb-1">
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </h2>
                <p className="text-slate-500 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#facc15]" />
                  {selectedDoctor.profile?.specialty || 'Healthcare Professional'}
                </p>
                
                {selectedDoctor.profile?.yearsOfExperience && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <Clock3 className="w-4 h-4" />
                    {selectedDoctor.profile.yearsOfExperience} years of experience
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#facc15]" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {selectedDoctor.email && (
                    <a href={`mailto:${selectedDoctor.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <Mail className="w-4 h-4" />
                      {selectedDoctor.email}
                    </a>
                  )}
                  {selectedDoctor.phone && (
                    <a href={`tel:${selectedDoctor.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors">
                      <Phone className="w-4 h-4" />
                      {selectedDoctor.phone}
                    </a>
                  )}
                  {selectedDoctor.profile?.clinicPhone && (
                    <a href={`tel:${selectedDoctor.profile.clinicPhone}`} className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors">
                      <Building2 className="w-4 h-4" />
                      Clinic: {selectedDoctor.profile.clinicPhone}
                    </a>
                  )}
                  {selectedDoctor.profile?.clinicAddress && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{selectedDoctor.profile.clinicAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {selectedDoctor.profile?.professionalSummary && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#facc15]" />
                    About
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedDoctor.profile.professionalSummary}
                  </p>
                </div>
              )}

              {/* Bio */}
              {selectedDoctor.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#facc15]" />
                    Biography
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}

              {/* Education */}
              {selectedDoctor.profile?.education && selectedDoctor.profile.education.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#facc15]" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {selectedDoctor.profile.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3">
                        <div className="font-medium text-[#1e293b]">{edu.degree} in {edu.fieldOfStudy}</div>
                        <div className="text-sm text-slate-500">{edu.institution} • {edu.year}</div>
                        {edu.description && (
                          <p className="text-sm text-slate-600 mt-1">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Board Certifications */}
              {selectedDoctor.profile?.boardCertifications && selectedDoctor.profile.boardCertifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#facc15]" />
                    Board Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.profile.boardCertifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {selectedDoctor.profile?.awards && selectedDoctor.profile.awards.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#facc15]" />
                    Awards & Honors
                  </h3>
                  <div className="space-y-2">
                    {selectedDoctor.profile.awards.map((award, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#1e293b]">{award.title}</span>
                          <span className="text-slate-500"> — {award.organization}, {award.year}</span>
                          {award.description && (
                            <p className="text-sm text-slate-600">{award.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedDoctor.profile?.languages && selectedDoctor.profile.languages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-[#facc15]" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.profile.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                        {lang.name} <span className="text-blue-500">({lang.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinic Info */}
              {selectedDoctor.profile?.clinicName && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#facc15]" />
                    Clinic Information
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="font-medium text-[#1e293b]">{selectedDoctor.profile.clinicName}</div>
                    {selectedDoctor.profile.consultationFee && (
                      <div className="flex items-center gap-2 mt-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        Consultation Fee: ${selectedDoctor.profile.consultationFee}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {selectedDoctor.profile.telemedicineEnabled && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Video className="w-4 h-4" />
                          Telemedicine Available
                        </span>
                      )}
                      {selectedDoctor.profile.acceptingNewPatients && (
                        <span className="flex items-center gap-1 text-sm text-blue-600">
                          <Users className="w-4 h-4" />
                          Accepting New Patients
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Memberships */}
              {selectedDoctor.profile?.professionalMemberships && selectedDoctor.profile.professionalMemberships.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#facc15]" />
                    Professional Memberships
                  </h3>
                  <ul className="space-y-1">
                    {selectedDoctor.profile.professionalMemberships.map((membership, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-600">
                        <div className="w-1.5 h-1.5 bg-[#facc15] rounded-full" />
                        {membership}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Social Links */}
              {(selectedDoctor.profile?.websiteUrl || selectedDoctor.profile?.linkedInUrl || 
                selectedDoctor.profile?.twitterUrl || selectedDoctor.profile?.instagramUrl) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#facc15]" />
                    Social & Web
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedDoctor.profile.websiteUrl && (
                      <a 
                        href={selectedDoctor.profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedDoctor.profile.linkedInUrl && (
                      <a 
                        href={selectedDoctor.profile.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {selectedDoctor.profile.twitterUrl && (
                      <a 
                        href={selectedDoctor.profile.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 rounded-lg text-sky-600 hover:bg-sky-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {selectedDoctor.profile.instagramUrl && (
                      <a 
                        href={selectedDoctor.profile.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 rounded-lg text-pink-600 hover:bg-pink-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              {(selectedDoctor.profile?.totalPatients || selectedDoctor.profile?.totalAppointments) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedDoctor.profile.totalPatients && (
                    <div className="bg-gradient-to-br from-[#facc15]/10 to-amber-100 rounded-xl p-4 text-center">
                      <Users className="w-6 h-6 text-[#facc15] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#1e293b]">{selectedDoctor.profile.totalPatients}</div>
                      <div className="text-sm text-slate-500">Total Patients</div>
                    </div>
                  )}
                  {selectedDoctor.profile.totalAppointments && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                      <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#1e293b]">{selectedDoctor.profile.totalAppointments}</div>
                      <div className="text-sm text-slate-500">Total Appointments</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
