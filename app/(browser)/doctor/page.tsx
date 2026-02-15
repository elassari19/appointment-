'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Star,
  Briefcase,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  firstName: string
  lastName: string
  specialty: string
  rating: number
  fee: number
  experience: number
  patients: string
  available: boolean
  availableDay: string | null
  image: string | null
  hasAvailability: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DoctorsPage() {
  const { t } = useLocale()
  const router = useRouter()
  const { user } = useAuth()

  const getBookingUrl = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'patient': return '/patient/book'
      case 'doctor': return '/doctors/appointments'
      case 'admin': return '/admin/appointments'
      default: return '/login'
    }
  }

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [search, setSearch] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [feeRange, setFeeRange] = useState(500)

  const specialties = [
    { key: 'Weight Management', label: t('doctorsPage.weightManagement') || 'Weight Management' },
    { key: 'Sports Nutrition', label: t('doctorsPage.sportsNutrition') || 'Sports Nutrition' },
    { key: 'Diabetes Management', label: t('doctorsPage.diabetesManagement') || 'Diabetes Management' },
    { key: 'Pediatric Nutrition', label: t('doctorsPage.pediatricNutrition') || 'Pediatric Nutrition' },
    { key: 'Gut Health', label: t('doctorsPage.gutHealth') || 'Gut Health' }
  ]

  const availability = [
    { key: 'today', label: t('doctorsPage.today') },
    { key: 'tomorrow', label: t('doctorsPage.tomorrow') },
    { key: 'week', label: t('doctorsPage.thisWeek') }
  ]

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', '10')
      
      if (search) params.set('search', search)
      if (selectedSpecialties.length > 0) params.set('specialties', selectedSpecialties.join(','))
      if (selectedAvailability) params.set('availability', selectedAvailability)
      if (sortBy) params.set('sortBy', sortBy)
      if (feeRange < 500) params.set('maxFee', feeRange.toString())

      const response = await fetch(`/api/doctors/list?${params.toString()}`)
      const data = await response.json()
      
      if (data.doctors) {
        setDoctors(data.doctors)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }, [search, selectedSpecialties, selectedAvailability, sortBy, feeRange, pagination.page])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchDoctors()
  }

  const handleSpecialtyChange = (key: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(key) 
        ? prev.filter(s => s !== key)
        : [...prev, key]
    )
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleAvailabilityChange = (key: string) => {
    setSelectedAvailability(prev => prev === key ? '' : key)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedSpecialties([])
    setSelectedAvailability('')
    setSortBy('rating')
    setFeeRange(500)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDoctorClick = (doctorId: string) => {
    router.push(`/doctor/${doctorId}`)
  }

  const renderPageNumbers = () => {
    const pages = []
    const { page, totalPages } = pagination
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const getDefaultImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e2e8f0' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
  }

  return (
    <main className="mx-auto p-4 lg:pt-24 min-h-screen pt-24 px-2 lg:px-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('doctorsPage.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('doctorsPage.subtitle')}
          </p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="flex items-center max-w-2xl bg-white dark:bg-slate-800 focus:ring-[#f1c40f]/50 border-none shadow-sm rounded-3xl focus:ring-2 mb-8 px-2">
        <div className="pl-5 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input 
          className="block w-full pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 ring-none border-none"
          placeholder={t('doctorsPage.searchPlaceholder')}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-[#f1c40f] text-slate-900 px-6 py-2.5 rounded-2xl font-semibold hover:opacity-90 transition-all">
          {t('doctorsPage.searchBtn')}
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">{t('doctorsPage.filters')}</h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#f1c40f] hover:underline"
              >
                {t('doctorsPage.resetAll')}
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {t('doctorsPage.specialty')}
              </h3>
              <div className="space-y-3">
                {specialties.map((spec) => (
                  <label key={spec.key} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      checked={selectedSpecialties.includes(spec.key)}
                      onChange={() => handleSpecialtyChange(spec.key)}
                      className="w-5 h-5 rounded border-slate-300 text-[#f1c40f] focus:ring-[#f1c40f]" 
                      type="checkbox"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#f1c40f] transition-colors">
                      {spec.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {t('doctorsPage.availability')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {availability.map((avail) => (
                  <button 
                    key={avail.key}
                    onClick={() => handleAvailabilityChange(avail.key)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      selectedAvailability === avail.key
                        ? 'bg-[#f1c40f] text-slate-900' 
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {avail.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {t('doctorsPage.consultationFee')}
              </h3>
              <input 
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#f1c40f]" 
                type="range"
                min="10"
                max="500"
                value={feeRange}
                onChange={(e) => {
                  setFeeRange(parseInt(e.target.value))
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs font-medium text-slate-500">$10</span>
                <span className="text-xs font-medium text-slate-500">${feeRange}+</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> {t('doctorsPage.resultsFound')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{t('doctorsPage.sortBy')}</span>
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer"
              >
                <option value="rating">{t('doctorsPage.highestRated')}</option>
                <option value="experience">{t('doctorsPage.experience')}</option>
                <option value="feeLowToHigh">{t('doctorsPage.feeLowToHigh')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#f1c40f] w-10 h-10" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">{t('doctorsPage.noResults') || 'No doctors found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {doctors.map((doctor) => (
                <div 
                  key={doctor.id}
                  className="bg-white dark:bg-slate-800 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 group cursor-pointer"
                  onClick={() => handleDoctorClick(doctor.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={doctor.image || getDefaultImage()}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star className="text-[#f1c40f] fill-[#f1c40f]" size={14} />
                      <span className="text-sm font-bold text-slate-900">{doctor.rating.toFixed(1)}</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg ${
                        doctor.available 
                          ? 'bg-green-500 text-white' 
                          : 'bg-slate-400 text-white'
                      }`}>
                        {doctor.available ? t('doctorsPage.availableToday') : `${t('doctorsPage.available')} ${doctor.availableDay || ''}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{doctor.name}</h3>
                        <p className="text-[#f1c40f] font-semibold text-sm">{doctor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{t('doctorsPage.fee')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">${doctor.fee}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                          <Briefcase className="text-slate-400" size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{t('doctorsPage.experience')}</p>
                          <p className="text-sm font-bold">{doctor.experience} {t('doctorsPage.years')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                          <Users className="text-slate-400" size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{t('doctorsPage.patients')}</p>
                          <p className="text-sm font-bold">{doctor.patients}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(getBookingUrl())}
                    className="w-full bg-[#f1c40f] text-slate-900 font-bold py-3.5 rounded-2xl hover:bg-[#f1c40f]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#f1c40f]/20"
                  >
                    {t('doctorsPage.bookAppointment')}
                    <ArrowRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && doctors.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              {renderPageNumbers().map((pageNum, idx) => (
                typeof pageNum === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                      pagination.page === pageNum
                        ? 'bg-[#f1c40f] text-slate-900'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span key={idx} className="px-2 text-slate-400">...</span>
                )
              ))}
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
