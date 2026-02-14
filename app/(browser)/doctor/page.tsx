'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { 
  Search,
  Star,
  Briefcase,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function DoctorsPage() {
  const { t } = useLocale()

  const specialties = [
    { key: 'cardio', label: t('doctorsPage.cardio'), checked: true },
    { key: 'dermato', label: t('doctorsPage.dermato'), checked: false },
    { key: 'neuro', label: t('doctorsPage.neuro'), checked: false },
    { key: 'pediatric', label: t('doctorsPage.pediatric'), checked: false }
  ]

  const availability = [
    { key: 'today', label: t('doctorsPage.today'), active: true },
    { key: 'tomorrow', label: t('doctorsPage.tomorrow'), active: false },
    { key: 'week', label: t('doctorsPage.thisWeek'), active: false }
  ]

  const doctors = [
    {
      name: 'Dr. Sarah Mitchell',
      specialty: t('doctorsPage.cardio'),
      rating: 4.9,
      fee: 120,
      experience: 12,
      patients: '1.2k+',
      available: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4zaSZcQXJEAMhMCtMBrt1Q6xr33zlASQ00TYdLnKYTENv3E6yIODDvhU7GV90F6bmMh6JCBeBfLPVhHWO7t13K9PZrAKSZfl03-fVRKbZlf9G3VuYisHar83a0xqk4PHrTQc2QeQ29mFLOr2aEPAhUxEzAraqiPC1IzlwhzTGZpMpjlFA8J449JyEgV2MuC0zxWkukokthCTtZJW-lve2RicYaeWzFGlML8gvRT2Uarxc7uRCe5vLKhgl7_E_WzIsc-ZV5_E90xDZ'
    },
    {
      name: 'Dr. Michael Chen',
      specialty: t('doctorsPage.neuro'),
      rating: 4.8,
      fee: 150,
      experience: 15,
      patients: '2k+',
      available: false,
      availableDay: 'Mon',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ7gTpdg7zo4Y8nDhBxlNhkiN0jYkaHi8uMWp3EaH9CvAPbRaGofLSv9szLT5pk7B-FKuVlP1WIiLL8CHVQIQcT0z22rWeacDNft_LFVgAwy8YADFvDtBKl6w9MeQQGP71q_eglZjk1DPUPpb4FxAcySgNBm5c7U32ys5FLQIMAfFMdKtJjbS79Y1tCiD5vmU93GiBH-TgPjNzEOUgqDaSrwZlaUDLP8BoUiJ_K8EAoQ2fsOXNnuP34alvlvQC0vYGCONSPw1Cu14g'
    },
    {
      name: 'Dr. Emily Watson',
      specialty: t('doctorsPage.dermato'),
      rating: 4.7,
      fee: 95,
      experience: 8,
      patients: '800+',
      available: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2lZnFlW6B9FDx307v6XHnlSaCFZdjEscHPA_Yp4H9EAZjMt70pLGxfukd2JAilAklADPhqP6XkRf0y8M0zeA_Zne210wam8c1JoshkGl42WRrodB4ZR1ssnmP9PWrJJOf2bvPkMKTpED1ePAkQe-FXbXJzOkcKCW7OR8lr9pv1K1cs16ZETfO6uj7sVDiu1DX-bP6R4wtk83dRKtJGHrlINgY6t2ELfsirzz6VJGn8GIk9kKUjW4UmawGGYQSKPh_k_wLZgimO6wY'
    },
    {
      name: 'Dr. James Wilson',
      specialty: t('doctorsPage.pediatric'),
      rating: 5.0,
      fee: 110,
      experience: 10,
      patients: '1.5k+',
      available: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO85wvTY7ShZq0cSJuI5dTGwDrEtQ6m8RRoXM7emCHjLZ8xZU33B2ABNTKUaKp0M1RKNBBTFdRBXyjJr_aRjY9tjLNCGtW6lxfvb1vdjPBr-xLIvvT7Q7w8vCVZiyrgYcIKeSs7uQOn8jCLFdInUcmYnHHxzbFTzN9r7H-K1tUdm8kW_w8WSX59CfDqs9EwYb6efgx1UYmQ6GNKt8mNZrfsMeW1oMdoUg6D5D3jnjq4Pwtc8J84UQgsVRpFbJ-RXAH8_POXgNIKRMp'
    }
  ]

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

      <div className="flex items-center max-w-2xl bg-white dark:bg-slate-800 focus:ring-[#f1c40f]/50 border-none shadow-sm rounded-3xl focus:ring-2 mb-8 px-2">
        <div className="pl-5 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input 
          className="block w-full pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 ring-none border-none"
          placeholder={t('doctorsPage.searchPlaceholder')}
          type="text"
        />
        <button className="bg-[#f1c40f] text-slate-900 px-6 py-2.5 rounded-2xl font-semibold hover:opacity-90 transition-all">
          {t('doctorsPage.searchBtn')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">{t('doctorsPage.filters')}</h2>
              <button className="text-xs font-semibold text-[#f1c40f] hover:underline">
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
                      checked={spec.checked}
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
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      avail.active 
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
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs font-medium text-slate-500">$10</span>
                <span className="text-xs font-medium text-slate-500">$500+</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {t('doctorsPage.doctorGender')}
              </h3>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#f1c40f] transition-all">
                  {t('doctorsPage.male')}
                </button>
                <button className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#f1c40f] transition-all">
                  {t('doctorsPage.female')}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">124</span> {t('doctorsPage.resultsFound')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{t('doctorsPage.sortBy')}</span>
              <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
                <option>{t('doctorsPage.highestRated')}</option>
                <option>{t('doctorsPage.experience')}</option>
                <option>{t('doctorsPage.feeLowToHigh')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div 
                key={doctor.name}
                className="bg-white dark:bg-slate-800 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={doctor.image}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star className="text-[#f1c40f] fill-[#f1c40f]" size={14} />
                    <span className="text-sm font-bold text-slate-900">{doctor.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg ${
                      doctor.available 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-400 text-white'
                    }`}>
                      {doctor.available ? t('doctorsPage.availableToday') : `${t('doctorsPage.available')} ${doctor.availableDay}`}
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

                <button className="w-full bg-[#f1c40f] text-slate-900 font-bold py-3.5 rounded-2xl hover:bg-[#f1c40f]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#f1c40f]/20">
                  {t('doctorsPage.bookAppointment')}
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f1c40f] text-slate-900 font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all font-bold">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all font-bold">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all font-bold">12</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#f1c40f] transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
