import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";

const mockDoctor = {
  name: "Dr. Julian Thorne, MD",
  title: "Senior Interventional Cardiologist",
  verified: true,
  location: "Mount Sinai Heart, New York",
  languages: ["English", "Spanish", "French"],
  rating: 4.9,
  patients: "2,400+",
  experience: "15 Yrs",
  bio: "Dr. Julian Thorne is a board-certified cardiologist specializing in complex interventional procedures. With over 15 years of experience, he has dedicated his career to providing compassionate, evidence-based care for patients with heart failure, coronary artery disease, and valvular disorders.",
  bioContinued: "He believes in a patient-centered approach, combining cutting-edge technology with personalized treatment plans to ensure the best possible outcomes. Outside the clinic, Dr. Thorne is an active researcher.",
  specializations: ["Cardiac Imaging", "Interventional Cardiology", "Hypertension", "Vascular Surgery"],
  education: [
    { institution: "Harvard Medical School", degree: "Medical Doctorate (MD)" },
    { institution: "Johns Hopkins Hospital", degree: "Residency Internal Medicine" }
  ],
  reviews: {
    total: 128,
    average: 4.9,
    distribution: { 5: 85, 4: 12, 3: 3, 2: 0, 1: 0 },
    items: [
      {
        author: "Sarah Miller",
        initials: "SM",
        verified: true,
        date: "2 weeks ago",
        rating: 5,
        content: "Dr. Thorne was incredibly thorough and took the time to explain my condition in terms I could understand. I felt truly heard and cared for."
      },
      {
        author: "Robert King",
        initials: "RK",
        verified: true,
        date: "1 month ago",
        rating: 5,
        content: "Outstanding clinic experience. The staff was professional and Dr. Thorne is clearly an expert in his field."
      }
    ]
  },
  clinic: {
    name: "Mount Sinai Heart Center",
    address: "1190 5th Ave, New York, NY 10029, United States",
    hours: [
      { days: "Mon - Fri", hours: "08:00 - 18:00" },
      { days: "Saturday", hours: "09:00 - 13:00" },
      { days: "Sunday", hours: "Closed" }
    ]
  },
  booking: {
    month: "February 2026",
    days: [
      { day: "Mon", date: 23, selected: true },
      { day: "Tue", date: 24 },
      { day: "Wed", date: 25 },
      { day: "Thu", date: 26 },
      { day: "Fri", date: 27 }
    ],
    morningSlots: ["09:00 AM", "10:30 AM", "11:15 AM"],
    afternoonSlots: ["02:30 PM", "04:00 PM", "05:15 PM"],
    fee: 150
  },
  insurance: ["BlueCross", "Aetna", "Medicare", "Cigna"]
};

function StarRating({ filled = true }: { filled?: boolean }) {
  return (
    <span className={`material-symbols-outlined ${filled ? "text-amber-400" : "text-slate-200"}`}>
      star
    </span>
  );
}

function InfoBadge({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
      <span className="material-symbols-outlined text-amber-400 mr-2 text-xl">{icon}</span>
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        {label === "Rating" && <span className="material-symbols-outlined text-amber-400 text-xl">star</span>}
      </div>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
      <span className="material-symbols-outlined text-amber-400">{icon}</span>
      {children}
    </h2>
  );
}

function RatingBar({ stars, percentage }: { stars: number; percentage: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold w-4 text-slate-400">{stars}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-xs font-bold text-slate-500 w-10 text-right">{percentage}%</span>
    </div>
  );
}

function ReviewCard({ review }: { review: typeof mockDoctor.reviews.items[0] }) {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-black text-lg">
            {review.initials}
          </div>
          <div>
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              {review.author}
              {review.verified && <span className="material-symbols-outlined text-[16px] text-green-500">verified</span>}
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{review.date}</p>
          </div>
        </div>
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <StarRating key={i} />
          ))}
        </div>
      </div>
      <p className="text-slate-600 leading-relaxed font-medium">"{review.content}"</p>
    </div>
  );
}

function BookingSidebar() {
  const { booking } = mockDoctor;

  return (
    <div className="sticky top-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-8 text-white">
        <h3 className="text-xl font-extrabold mb-1">Book Appointment</h3>
        <p className="text-slate-400 text-sm font-medium">Available slots for this week</p>
      </div>
      <div className="p-8">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-black text-slate-900">{booking.month}</span>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="material-symbols-outlined text-sm block">chevron_left</span>
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="material-symbols-outlined text-sm block">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {booking.days.map((dayInfo) => (
              <button
                key={dayInfo.day}
                className={`flex flex-col items-center py-4 rounded-2xl transition-all ${
                  dayInfo.selected
                    ? "bg-amber-400 text-white shadow-lg shadow-amber-400/20 ring-4 ring-amber-400/10"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span className={`text-[10px] uppercase ${dayInfo.selected ? "font-black" : "font-bold text-slate-400"} mb-1`}>
                  {dayInfo.day}
                </span>
                <span className={`text-lg font-black leading-none ${dayInfo.selected ? "text-white" : "text-slate-900"}`}>
                  {dayInfo.date}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">light_mode</span> Morning
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {booking.morningSlots.map((slot) => (
                <button
                  key={slot}
                  className="py-3 px-1 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-amber-400 hover:text-amber-400 transition-all"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">wb_sunny</span> Afternoon
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {booking.afternoonSlots.map((slot, i) => (
                <button
                  key={slot}
                  className={`py-3 px-1 rounded-xl text-xs font-bold transition-all ${
                    i === 0
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-400"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
            <span className="text-sm font-bold text-slate-500">Consultation Fee</span>
            <span className="text-xl font-black text-slate-900">${booking.fee.toFixed(2)}</span>
          </div>
          <button className="w-full bg-amber-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-400/30 hover:shadow-amber-400/40 transition-all active:scale-[0.98]">
            Confirm Booking
          </button>
          <p className="text-[11px] text-center font-bold text-slate-400 uppercase tracking-tighter">
            Instant confirmation • No payment required
          </p>
        </div>
      </div>
      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400/10 p-2.5 rounded-full shrink-0">
            <span className="material-symbols-outlined text-amber-400 text-xl">verified_user</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Accepted Insurance</p>
            <p className="text-[11px] font-bold text-slate-400">{mockDoctor.insurance.join(", ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicSection() {
  const { clinic } = mockDoctor;

  return (
    <section className="mt-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-12">
        <div className="p-10 md:col-span-4 border-r border-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400">distance</span>
            Clinic Location
          </h2>
          <div className="space-y-8">
            <div>
              <p className="text-lg font-black text-slate-900 mb-1">{clinic.name}</p>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{clinic.address}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-widest">Office Hours</p>
              <div className="space-y-3">
                {clinic.hours.map((hour) => (
                  <div key={hour.days} className="flex justify-between text-sm">
                    <span className={`font-bold ${hour.hours === "Closed" ? "text-slate-400" : "text-slate-600"}`}>
                      {hour.days}
                    </span>
                    <span className={`font-black ${hour.hours === "Closed" ? "text-slate-400" : "text-slate-900"}`}>
                      {hour.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              <span className="material-symbols-outlined text-xl">directions</span>
              Get Directions
            </button>
          </div>
        </div>
        <div className="md:col-span-8 h-[500px] relative">
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-300 text-6xl">map</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DoctorProfilePage() {
  const doctor = mockDoctor;
  const reviews = mockDoctor.reviews;

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-slate-800 font-display">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 p-2 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">health_and_safety</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                Medi<span className="text-amber-400">Care</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-amber-400 transition-colors">
                Find Doctors
              </Link>
              <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-amber-400 transition-colors">
                Specialties
              </Link>
              <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-amber-400 transition-colors">
                How it Works
              </Link>
              <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative group">
              <Avatar className="w-48 h-48 md:w-56 md:h-56 rounded-3xl shadow-2xl shadow-amber-400/10">
                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGS9WZWmD1vHYRKhfRNkWIC4iqC_IWtHIJolGKsddb5Vw-p_ituUUuDjZW5tb-cVacOu5rTc0RloW2J-xsyd2zQGEAh5M25eSFwdbG1KbzsTW945Hs1n7XxW2dPoSYOLSgnoO-OrnOH4X2w5FnTslf_QxT9N-fnUichxJr00_rhW42DW5St7_i2gxMF5lFH0i_FnYS-HpZGbMIYmJoBMhw941IKavdkplDwewmAPufCdqjoUyGWSQYd6CDEz67tsg4u8UAgyn7jkYD" />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-3xl font-bold">
                  JT
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-3 -right-3 bg-green-500 p-2 rounded-full border-4 border-white shadow-lg">
                <span className="material-symbols-outlined text-white text-sm block">check</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{doctor.name}</h1>
                <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-500 border border-amber-400/20">
                  Verified Specialist
                </span>
              </div>
              <p className="text-xl text-slate-500 font-medium mb-6">{doctor.title}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                <InfoBadge icon="location_on">{doctor.location}</InfoBadge>
                <InfoBadge icon="translate">{doctor.languages.join(", ")}</InfoBadge>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <StatBlock value={doctor.rating.toString()} label="Rating" />
                <StatBlock value={doctor.patients} label="Patients" />
                <StatBlock value={doctor.experience} label="Experience" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3 space-y-10">
            <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
              <SectionTitle icon="person">About Me</SectionTitle>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed mb-6">{doctor.bio}</p>
                <p className="text-slate-600 text-lg leading-relaxed">{doctor.bioContinued}</p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400">clinical_notes</span>
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400">school</span>
                  Education
                </h3>
                <div className="space-y-6">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-xl">workspace_premium</span>
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">{edu.institution}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{edu.degree}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <SectionTitle icon="reviews">Patient Reviews</SectionTitle>
                <span className="px-4 py-1.5 bg-slate-50 rounded-full text-sm font-bold text-slate-500">
                  {reviews.total} Reviews
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
                <div className="text-center shrink-0">
                  <div className="text-6xl font-black text-slate-900 mb-2">{reviews.average}</div>
                  <div className="flex justify-center text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <StarRating key={i} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                  <RatingBar stars={5} percentage={reviews.distribution[5]} />
                  <RatingBar stars={4} percentage={reviews.distribution[4]} />
                  <RatingBar stars={3} percentage={reviews.distribution[3]} />
                </div>
              </div>

              <div className="space-y-8">
                {reviews.items.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                View All {reviews.total} Reviews
              </button>
            </section>
          </div>

          <div className="lg:w-1/3">
            <BookingSidebar />
          </div>
        </div>

        <ClinicSection />
      </main>

      <footer className="mt-20 bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-amber-400 text-2xl">health_and_safety</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Medi<span className="text-amber-400">Care</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-slate-400">
              <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">© 2026 MediCare Global</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
