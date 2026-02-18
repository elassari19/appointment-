import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Cake, 
  User, 
  Activity, 
  Pill, 
  FlaskConical, 
  Heart, 
  Thermometer, 
  Scale, 
  Calendar, 
  Video, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  Shield, 
  Phone, 
  Droplets, 
  AlertTriangle, 
  ClipboardList, 
  Edit,
  Check,
  ChevronRight
} from "lucide-react";

const mockPatient = {
  name: "Sarah Mitchell",
  title: "Patient",
  verified: true,
  location: "New York, NY",
  dateOfBirth: "March 15, 1985",
  gender: "Female",
  bloodType: "O+",
  allergies: ["Penicillin", "Peanuts"],
  emergencyContact: {
    name: "John Mitchell",
    relation: "Spouse",
    phone: "+1 (555) 123-4567"
  },
  medicalHistory: {
    conditions: ["Hypertension", "Type 2 Diabetes"],
    surgeries: ["Appendectomy (2018)", "Knee Arthroscopy (2020)"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
    ]
  },
  insurance: {
    provider: "BlueCross BlueShield",
    policyNumber: "BCB-123456789",
    groupNumber: "GRP-987654",
    validUntil: "December 31, 2026"
  },
  appointments: {
    upcoming: {
      doctor: "Dr. Julian Thorne",
      specialty: "Cardiologist",
      date: "February 27, 2026",
      time: "10:30 AM",
      location: "Mount Sinai Heart Center"
    },
    past: 12,
    completed: 10
  },
  vitals: {
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "145 lbs",
    height: "5'6\"",
    lastUpdated: "2 days ago"
  },
  labResults: [
    {
      name: "Complete Blood Count",
      date: "January 20, 2026",
      status: "Normal",
      icon: "droplet"
    },
    {
      name: "Lipid Panel",
      date: "January 20, 2026",
      status: "Attention",
      icon: "heart"
    },
    {
      name: "HbA1c",
      date: "January 20, 2026",
      status: "Normal",
      icon: "activity"
    }
  ]
};

function InfoBadge({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
      <Icon className="text-amber-400 mr-2 w-5 h-5" />
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
        <span className="text-2xl font-black text-slate-900">{value}</span>
      </div>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
      <Icon className="text-amber-400 w-6 h-6" />
      {children}
    </h2>
  );
}

function MedicationCard({ medication }: { medication: { name: string; dosage: string; frequency: string } }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center">
          <Pill className="text-amber-400 w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{medication.name}</p>
          <p className="text-xs font-semibold text-slate-400">{medication.dosage} • {medication.frequency}</p>
        </div>
      </div>
      <button className="text-amber-400 hover:text-amber-500">
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
}

function LabResultCard({ result }: { result: { name: string; date: string; status: string; icon: string } }) {
  const statusColors = {
    Normal: "text-green-500 bg-green-500/10",
    Attention: "text-amber-500 bg-amber-500/10"
  };

  const iconMap: Record<string, React.ElementType> = {
    droplet: Droplets,
    heart: Heart,
    activity: Activity
  };
  
  const Icon = iconMap[result.icon] || FlaskConical;
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <Icon className="text-slate-600 w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{result.name}</p>
          <p className="text-xs font-semibold text-slate-400">{result.date}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[result.status as keyof typeof statusColors] || statusColors.Normal}`}>
        {result.status}
      </span>
    </div>
  );
}

function VitalsCard() {
  const { vitals } = mockPatient;
  
  const vitalItems = [
    { icon: Heart, value: vitals.bloodPressure, label: "Blood Pressure", unit: "mmHg" },
    { icon: Activity, value: vitals.heartRate, label: "Heart Rate", unit: "bpm" },
    { icon: Thermometer, value: vitals.temperature, label: "Temperature", unit: "°F" },
    { icon: Scale, value: vitals.weight, label: "Weight", unit: "lbs" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {vitalItems.map((vital) => (
        <div key={vital.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <vital.icon className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-xl font-black text-slate-900">{vital.value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{vital.label}</p>
        </div>
      ))}
    </div>
  );
}

function UpcomingAppointmentCard() {
  const { upcoming } = mockPatient.appointments;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-extrabold">Upcoming Appointment</h3>
        <span className="px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">Confirmed</span>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <User className="text-white w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white">{upcoming.doctor}</p>
            <p className="text-xs text-slate-400">{upcoming.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white">{upcoming.date}</p>
            <p className="text-xs text-slate-400">{upcoming.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white">{upcoming.location}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button className="flex-1 bg-amber-400 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-500 transition-colors">
          Reschedule
        </button>
        <button className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: PlusCircle, label: "Book Appointment", color: "bg-amber-400" },
    { icon: Video, label: "Video Consult", color: "bg-blue-500" },
    { icon: MessageSquare, label: "Message Doctor", color: "bg-green-500" },
    { icon: FileText, label: "View Bills", color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
        >
          <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
            <action.icon className="text-white w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-600">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function PatientProfilePage() {
  const patient = mockPatient;

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-slate-800 font-display">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative group">
              <Avatar className="w-48 h-48 md:w-56 md:h-56 rounded-3xl shadow-2xl shadow-amber-400/10">
                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuKGQGW7P4NGAVYBqKn7nJ3sT1iX-H0p8V7K5tXjKGHgKJhK4tY7uQ1xC2vR5qW8hK3xL2mN9pJ7kH4tY6vR1xC5qW8hK3xL" />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-3xl font-bold">
                  SM
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-3 -right-3 bg-green-500 p-2 rounded-full border-4 border-white shadow-lg">
                <Check className="text-white w-3 h-3" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                  Verified Patient
                </span>
              </div>
              <p className="text-xl text-slate-500 font-medium mb-6">{patient.title}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                <InfoBadge icon={MapPin}>{patient.location}</InfoBadge>
                <InfoBadge icon={Cake}>{patient.dateOfBirth}</InfoBadge>
                <InfoBadge icon={User}>{patient.gender}</InfoBadge>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <StatBlock value={patient.appointments.upcoming ? "1" : "0"} label="Upcoming" />
                <StatBlock value={patient.appointments.completed.toString()} label="Completed" />
                <StatBlock value={patient.appointments.past.toString()} label="Total Visits" />
              </div>
            </div>
          </div>
        </div>

        <QuickActions />

        <div className="flex flex-col lg:flex-row gap-10 mt-10">
          <div className="lg:w-2/3 space-y-10">
            <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
              <SectionTitle icon={Activity}>Vitals & Health</SectionTitle>
              <VitalsCard />
              <p className="text-xs font-bold text-slate-400 mt-4 text-right">Last updated: {patient.vitals.lastUpdated}</p>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <Activity className="text-amber-400 w-6 h-6" />
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.conditions.map((condition) => (
                    <span
                      key={condition}
                      className="px-4 py-2 bg-amber-400/10 text-amber-600 border border-amber-400/20 rounded-xl text-sm font-semibold"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="text-amber-400 w-6 h-6" />
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <Pill className="text-amber-400 w-6 h-6" />
                  Current Medications
                </h3>
                <div className="space-y-3">
                  {patient.medicalHistory.medications.map((medication, index) => (
                    <MedicationCard key={index} medication={medication} />
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <FlaskConical className="text-amber-400 w-6 h-6" />
                  Lab Results
                </h3>
                <div className="space-y-3">
                  {patient.labResults.map((result, index) => (
                    <LabResultCard key={index} result={result} />
                  ))}
                </div>
                <button className="w-full mt-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  View All Results
                  <ChevronRight className="w-4 h-4" />
                </button>
              </section>
            </div>

            <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                <ClipboardList className="text-amber-400 w-6 h-6" />
                Surgical History
              </h3>
              <div className="space-y-4">
                {patient.medicalHistory.surgeries.map((surgery, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Activity className="text-slate-600 w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-900">{surgery}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:w-1/3 space-y-6">
            <UpcomingAppointmentCard />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                  <Shield className="text-amber-400 w-5 h-5" />
                  Insurance Info
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Provider</p>
                  <p className="font-bold text-slate-900">{patient.insurance.provider}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Policy #</p>
                    <p className="font-bold text-slate-900 text-sm">{patient.insurance.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Group #</p>
                    <p className="font-bold text-slate-900 text-sm">{patient.insurance.groupNumber}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                  <p className="font-bold text-slate-900">{patient.insurance.validUntil}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                  <Phone className="text-amber-400 w-5 h-5" />
                  Emergency Contact
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-bold text-slate-900">{patient.emergencyContact.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Relation</p>
                    <p className="font-bold text-slate-900 text-sm">{patient.emergencyContact.relation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-bold text-slate-900 text-sm">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                  <Droplets className="text-amber-400 w-5 h-5" />
                  Blood Type
                </h3>
              </div>
              <div className="p-6 text-center">
                <p className="text-4xl font-black text-red-500">{patient.bloodType}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
