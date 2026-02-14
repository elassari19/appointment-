'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { 
  Star,
  MapPin,
  Languages,
  User,
  FileText,
  GraduationCap,
  Award,
  MessageSquare,
  Verified,
  ChevronLeft,
  ChevronRight,
  Sun,
  SunMedium,
  Navigation,
  Check,
  Shield,
  ArrowLeft
} from "lucide-react"

export default function DoctorPage() {
  const { t } = useLocale()

  const doctor = {
    name: 'Dr. Julian Thorne, MD',
    title: t('doctorPage.seniorInterventional'),
    hospital: 'Mount Sinai Heart, New York',
    languages: ['English', 'Spanish', 'French'],
    rating: 4.9,
    patients: '2,400+',
    experience: 15,
    verified: true,
    available: true,
    fee: 150,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGS9WZWmD1vHYRKhfRNkWIC4iqC_IWtHIJolGKsddb5Vw-p_ituUUuDjZW5tb-cVacOu5rTc0RloW2J-xsyd2zQGEAh5M25eSFwdbG1KbzsTW945Hs1n7XxW2dPoSYOLSgnoO-OrnOH4X2w5FnTslf_QxT9N-fnUichxJr00_rhW42DW5St7_i2gxMF5lFH0i_FnYS-HpZGbMIYmJoBMhw941IKavdkplDwewmAPufCdqjoUyGWSQYd6CDEz67tsg4u8UAgyn7jkYD'
  }

  const specializations = [
    t('doctorPage.cardiacImaging'),
    t('doctorPage.interventionalCardio'),
    t('doctorPage.hypertension'),
    t('doctorPage.vascularSurgery')
  ]

  const education = [
    {
      school: 'Harvard Medical School',
      degree: t('doctorPage.medicalDoctorate')
    },
    {
      school: 'Johns Hopkins Hospital',
      degree: t('doctorPage.residency')
    }
  ]

  const reviews = [
    {
      name: 'Sarah Miller',
      initials: 'SM',
      date: '2 weeks ago',
      rating: 5,
      text: 'Dr. Thorne was incredibly thorough and took the time to explain my condition in terms I could understand. I felt truly heard and cared for.'
    },
    {
      name: 'Robert King',
      initials: 'RK',
      date: '1 month ago',
      rating: 5,
      text: 'Outstanding clinic experience. The staff was professional and Dr. Thorne is clearly an expert in his field.'
    }
  ]

  const days = [
    { day: 'Mon', date: 23, active: true },
    { day: 'Tue', date: 24, active: false },
    { day: 'Wed', date: 25, active: false },
    { day: 'Thu', date: 26, active: false },
    { day: 'Fri', date: 27, active: false }
  ]

  const morningSlots = ['09:00 AM', '10:30 AM', '11:15 AM']
  const afternoonSlots = ['02:30 PM', '04:00 PM', '05:15 PM']

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <button className="flex items-center gap-2 text-slate-600 font-semibold mb-6 hover:text-slate-900 transition-colors">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="relative group">
            <img 
              alt="Doctor Portrait"
              className="w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover shadow-2xl shadow-[#eab308]/10 border-4 border-white"
              src={doctor.image}
            />
            {doctor.available && (
              <div className="absolute -bottom-3 -right-3 bg-green-500 p-2 rounded-full border-4 border-white shadow-lg" title={t('doctorPage.availableToday')}>
                <Check className="text-white text-sm" size={14} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{doctor.name}</h1>
              {doctor.verified && (
                <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20">
                  <Shield className="mr-1" size={12} /> {t('doctorPage.verifiedSpecialist')}
                </span>
              )}
            </div>
            <p className="text-xl text-slate-500 font-medium mb-6">{doctor.title}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <MapPin className="text-[#eab308] mr-2" size={20} />
                <span className="text-sm font-semibold">{doctor.hospital}</span>
              </div>
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <Languages className="text-[#eab308] mr-2" size={20} />
                <span className="text-sm font-semibold">{doctor.languages.join(', ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-50">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-2xl font-black text-slate-900">{doctor.rating}</span>
                  <Star className="text-[#eab308] fill-[#eab308]" size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('doctorPage.rating')}</span>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-black text-slate-900 mb-1">{doctor.patients}</div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('doctorPage.patients')}</span>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-black text-slate-900 mb-1">{doctor.experience} {t('doctorPage.years')}</div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('doctorPage.experience')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3 space-y-10">
          <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <User className="text-[#eab308]" size={24} />
              {t('doctorPage.aboutMe')}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              {t('doctorPage.aboutDesc1')}
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              {t('doctorPage.aboutDesc2')}
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-10">
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="text-[#eab308]" size={22} />
                {t('doctorPage.specializations')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <span key={spec} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600">
                    {spec}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                <GraduationCap className="text-[#eab308]" size={22} />
                {t('doctorPage.education')}
              </h3>
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.school} className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center">
                      <Award className="text-slate-400" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">{edu.school}</p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{edu.degree}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                <MessageSquare className="text-[#eab308]" size={24} />
                {t('doctorPage.patientReviews')}
              </h2>
              <span className="px-4 py-1.5 bg-slate-50 rounded-full text-sm font-bold text-slate-500">128 {t('doctorPage.reviews')}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
              <div className="text-center shrink-0">
                <div className="text-6xl font-black text-slate-900 mb-2">4.9</div>
                <div className="flex justify-center text-[#eab308] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="fill-current" size={20} />
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {[5, 4, 3].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <span className="text-sm font-bold w-4 text-slate-400">{star}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#eab308]" style={{ width: star === 5 ? '85%' : star === 4 ? '12%' : '3%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-10 text-right">{star === 5 ? '85%' : star === 4 ? '12%' : '3%'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.name} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308] font-black text-lg">
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          {review.name}
                          <Verified className="text-green-500" size={16} />
                        </p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-[#eab308]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="fill-current" size={18} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{review.text}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              {t('doctorPage.viewAllReviews').replace('{count}', '128')}
            </button>
          </section>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-xl font-extrabold mb-1">{t('doctorPage.bookAppointment')}</h3>
              <p className="text-slate-400 text-sm font-medium">{t('doctorPage.availableSlots')}</p>
            </div>

            <div className="p-8">
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-black text-slate-900">February 2026</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {days.map((day) => (
                    <button 
                      key={day.day}
                      className={`flex flex-col items-center py-4 rounded-2xl transition-all ${
                        day.active 
                          ? 'bg-[#eab308] text-white shadow-lg shadow-[#eab308]/20 ring-4 ring-[#eab308]/10' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-${day.active ? 'black' : 'bold'} mb-1 ${!day.active ? 'text-slate-400' : ''}`}>{day.day}</span>
                      <span className={`text-lg font-black leading-none ${!day.active ? 'text-slate-900' : ''}`}>{day.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Sun size={18} /> {t('doctorPage.morning')}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {morningSlots.map((slot) => (
                      <button 
                        key={slot}
                        className="py-3 px-1 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#eab308] hover:text-[#eab308] transition-all"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <SunMedium size={18} /> {t('doctorPage.afternoon')}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {afternoonSlots.map((slot, idx) => (
                      <button 
                        key={slot}
                        className={`py-3 px-1 rounded-xl text-xs font-bold transition-all ${
                          idx === 0 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                            : 'border border-slate-200 text-slate-600 hover:border-[#eab308] hover:text-[#eab308]'
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
                  <span className="text-sm font-bold text-slate-500">{t('doctorPage.consultationFee')}</span>
                  <span className="text-xl font-black text-slate-900">${doctor.fee}.00</span>
                </div>
                <button className="w-full bg-[#eab308] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#eab308]/30 hover:shadow-[#eab308]/40 transition-all active:scale-[0.98]">
                  {t('doctorPage.confirmBooking')}
                </button>
                <p className="text-[11px] text-center font-bold text-slate-400 uppercase tracking-tighter">
                  {t('doctorPage.instantConfirmation')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-[#eab308]/10 p-2.5 rounded-full shrink-0">
                  <Shield className="text-[#eab308]" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{t('doctorPage.acceptedInsurance')}</p>
                  <p className="text-[11px] font-bold text-slate-400">BlueCross, Aetna, Medicare, Cigna</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-12">
          <div className="p-10 md:col-span-4 border-r border-slate-50">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
              <MapPin className="text-[#eab308]" size={24} />
              {t('doctorPage.clinicLocation')}
            </h2>
            <div className="space-y-8">
              <div>
                <p className="text-lg font-black text-slate-900 mb-1">Mount Sinai Heart Center</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">1190 5th Ave, New York, NY 10029, United States</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-widest">{t('doctorPage.officeHours')}</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">{t('doctorPage.monFri')}</span>
                    <span className="font-black text-slate-900">08:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">{t('doctorPage.saturday')}</span>
                    <span className="font-black text-slate-900">09:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-400">{t('doctorPage.sunday')}</span>
                    <span className="font-black text-slate-400">{t('doctorPage.closed')}</span>
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <Navigation size={20} /> {t('doctorPage.getDirections')}
              </button>
            </div>
          </div>
          <div className="md:col-span-8 h-[500px] relative">
            <img 
              alt="Map location"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOwya0moGwbJic5Dgxkk4HtZd7FSNgCeJv8p8duNOZyb9X-mQZ6LuqQ2h27k0Rh0vNSz6qFoP-dp6XKGQcWWlMwW5yTZB-NAQL1T7fJlUUZXQk1D4fWeMhhV_sWck42EbF0mPm3vnuFWA2IgTwSi4gpdws1uaqSbxld9Mks-yIsNIVImFk-43J47GAjjqdFmiOT48-4iWHfQbY0q9kVQLVdTac5nCRKMEJVrQiW-Mt6ck1LFukL0JVT1DlbmlofZpA27qh1inI21WR"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
