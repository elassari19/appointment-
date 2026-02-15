'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ArrowLeft,
  Loader2
} from "lucide-react"

interface DoctorData {
  id: string
  name: string
  firstName: string
  lastName: string
  title: string
  hospital: string
  languages: string[]
  rating: number
  patients: string
  experience: number
  verified: boolean
  available: boolean
  fee: number
  image: string | null
  specializations: string[]
  education: { school: string; degree: string }[]
  about: { summary: string; detailed: string }
  reviews: {
    list: { id: string; name: string; initials: string; date: string; rating: number; text: string; isVerified: boolean }[]
    total: number
    summary: { averageRating: number; distribution: { 1: number; 2: number; 3: number; 4: number; 5: number } }
  }
  calendar: {
    month: number
    year: number
    days: { day: string | null; date: number | null; slots: string[]; isPast?: boolean; isToday?: boolean }[]
  }
  clinic: {
    name: string
    address: string
    phone: string | null
    hours: { day: string; openTime: string; closeTime: string; isClosed: boolean }[]
    mapImage: string | null
  }
  insurance: string[]
  telemedicineEnabled: boolean
}

export default function DoctorPage() {
  const { t } = useLocale()
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<DoctorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() })

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/doctors/browser/${doctorId}?month=${calendarDate.month}&year=${calendarDate.year}`)
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
        } else {
          setDoctor(data)
        }
      } catch (err) {
        setError('Failed to load doctor')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId, calendarDate.month, calendarDate.year])

  const getDefaultImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e2e8f0' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
  }

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month]
  }

  const handlePrevMonth = () => {
    setCalendarDate(prev => {
      const newMonth = prev.month - 1
      if (newMonth < 0) {
        return { month: 11, year: prev.year - 1 }
      }
      return { month: newMonth, year: prev.year }
    })
  }

  const handleNextMonth = () => {
    setCalendarDate(prev => {
      const newMonth = prev.month + 1
      if (newMonth > 11) {
        return { month: 0, year: prev.year + 1 }
      }
      return { month: newMonth, year: prev.year }
    })
  }

  const getRatingPercentage = (stars: number) => {
    if (!doctor?.reviews?.summary?.distribution) return '0%'
    const total = Object.values(doctor.reviews.summary.distribution).reduce((a, b) => a + b, 0) || 1
    const count = doctor.reviews.summary.distribution[stars as keyof typeof doctor.reviews.summary.distribution] || 0
    return `${Math.round((count / total) * 100)}%`
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#eab308] w-12 h-12" />
      </main>
    )
  }

  if (error || !doctor) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-semibold mb-6 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="text-center py-20">
          <p className="text-xl text-slate-500">{error || 'Doctor not found'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-semibold mb-6 hover:text-slate-900 transition-colors">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative group">
            <img 
              alt="Doctor Portrait"
              className="w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover shadow-2xl shadow-[#eab308]/10 border-4 border-white"
              src={doctor.image || getDefaultImage()}
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

            <div className="grid grid-cols-3 gap-8 border-t border-slate-50">
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
              {doctor.about.summary}
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              {doctor.about.detailed}
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-10">
            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="text-[#eab308]" size={22} />
                {t('doctorPage.specializations')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.specializations.map((spec, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600">
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
                {doctor.education.map((edu, idx) => (
                  <div key={idx} className="flex gap-4">
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
              <span className="px-4 py-1.5 bg-slate-50 rounded-full text-sm font-bold text-slate-500">{doctor.reviews.total} {t('doctorPage.reviews')}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
              <div className="text-center shrink-0">
                <div className="text-6xl font-black text-slate-900 mb-2">{doctor.reviews.summary.averageRating}</div>
                <div className="flex justify-center text-[#eab308] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={i < Math.floor(doctor.reviews.summary.averageRating) ? "fill-current" : ""} size={20} />
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <span className="text-sm font-bold w-4 text-slate-400">{star}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#eab308]" style={{ width: getRatingPercentage(star) }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-10 text-right">{getRatingPercentage(star)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {doctor.reviews.list.map((review) => (
                <div key={review.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308] font-black text-lg">
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          {review.name}
                          {review.isVerified && <Verified className="text-green-500" size={16} />}
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

            {doctor.reviews.total > doctor.reviews.list.length && (
              <button className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                {t('doctorPage.viewAllReviews').replace('{count}', doctor.reviews.total.toString())}
              </button>
            )}
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
                  <span className="text-lg font-black text-slate-900">{getMonthName(calendarDate.month)} {calendarDate.year}</span>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {doctor.calendar.days.map((day, idx) => (
                    <button 
                      key={idx}
                      disabled={!day.date || day.isPast || day.slots.length === 0}
                      onClick={() => day.date && setSelectedDate(day.date)}
                      className={`flex flex-col items-center py-4 rounded-2xl transition-all ${
                        selectedDate === day.date 
                          ? 'bg-[#eab308] text-white shadow-lg shadow-[#eab308]/20 ring-4 ring-[#eab308]/10' 
                        : day.date && !day.isPast && day.slots.length > 0
                          ? 'hover:bg-slate-50 border border-transparent'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold mb-1 ${!day.date ? 'invisible' : ''}`}>{day.day || '-'}</span>
                      <span className={`text-lg font-black leading-none`}>{day.date || '-'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Sun size={18} /> {t('doctorPage.morning')}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {doctor.calendar.days.find(d => d.date === selectedDate)?.slots.filter((s: string) => s.includes('AM')).map((slot: string) => (
                        <button 
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all ${
                            selectedSlot === slot
                              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                              : 'border border-slate-200 text-slate-600 hover:border-[#eab308] hover:text-[#eab308]'
                          }`}
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
                      {doctor.calendar.days.find(d => d.date === selectedDate)?.slots.filter((s: string) => s.includes('PM')).map((slot: string, idx: number) => (
                        <button 
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all ${
                            selectedSlot === slot
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
              )}

              <div className="mt-12 space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <span className="text-sm font-bold text-slate-500">{t('doctorPage.consultationFee')}</span>
                  <span className="text-xl font-black text-slate-900">${doctor.fee}.00</span>
                </div>
                <button 
                  disabled={!selectedDate || !selectedSlot}
                  className="w-full bg-[#eab308] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#eab308]/30 hover:shadow-[#eab308]/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                  <p className="text-[11px] font-bold text-slate-400">{doctor.insurance.join(', ')}</p>
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
                <p className="text-lg font-black text-slate-900 mb-1">{doctor.clinic.name}</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{doctor.clinic.address}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-slate-400 mb-4 tracking-widest">{t('doctorPage.officeHours')}</p>
                <div className="space-y-3">
                  {doctor.clinic.hours.map((hours, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className={`font-bold ${hours.isClosed ? 'text-slate-400' : 'text-slate-600'}`}>{hours.day}</span>
                      <span className={`font-black ${hours.isClosed ? 'text-slate-400' : 'text-slate-900'}`}>
                        {hours.isClosed ? t('doctorPage.closed') : `${hours.openTime} - ${hours.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <Navigation size={20} /> {t('doctorPage.getDirections')}
              </button>
            </div>
          </div>
          <div className="md:col-span-8 h-[500px] relative">
            {doctor.clinic.mapImage ? (
              <img 
                alt="Map location"
                className="w-full h-full object-cover"
                src={doctor.clinic.mapImage}
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <MapPin className="text-slate-400" size={48} />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
