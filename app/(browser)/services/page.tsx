'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@/lib/gsap-animations';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Video,
  FileText,
  Ambulance,
  FlaskConical,
  Shield,
  Award,
  Users,
  Heart,
  ArrowRight,
  Phone,
  Search,
  MapPin,
  Mail,
  Menu
} from "lucide-react"

export default function ServicesPage() {
  const { t } = useLocale()
  const router = useRouter()
  const { user } = useAuth()

  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.services-hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.services-hero-title', start: 'top 80%' } }
      );

      gsap.fromTo('.services-hero-subtitle',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.services-hero-subtitle', start: 'top 80%' } }
      );

      gsap.fromTo('.service-card-item',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.services-grid', start: 'top 80%' } }
      );

      gsap.fromTo('.trust-item',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.trust-section', start: 'top 90%' } }
      );

      gsap.fromTo('.cta-section',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cta-section', start: 'top 85%' } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getBookingUrl = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'patient': return '/patient/book'
      case 'doctor': return '/doctors/appointments'
      case 'admin': return '/admin/appointments'
      default: return '/login'
    }
  }

  const services = [
    {
      title: t('servicesPage.virtualConsultations'),
      description: t('servicesPage.virtualConsultationsDesc'),
      icon: Video,
      isFeatured: false
    },
    {
      title: t('servicesPage.specializedCare'),
      description: t('servicesPage.specializedCareDesc'),
      icon: FileText,
      isFeatured: false
    },
    {
      title: t('servicesPage.emergencySupport'),
      description: t('servicesPage.emergencySupportDesc'),
      icon: Ambulance,
      isFeatured: true
    },
    {
      title: t('servicesPage.diagnosticServices'),
      description: t('servicesPage.diagnosticServicesDesc'),
      icon: FlaskConical,
      isFeatured: false
    }
  ]

  const trustItems = [
    { icon: Shield, label: t('servicesPage.isoCertified') },
    { icon: Heart, label: t('servicesPage.hipaaCompliant') },
    { icon: Users, label: t('servicesPage.insurancePartners') },
    { icon: Award, label: t('servicesPage.awardWinningCare') }
  ]

  return (
    <main className="mx-auto px-6 lg:px-20 py-12 pt-24" ref={sectionRef}>
      <section className="relative rounded-xl overflow-hidden mb-16 h-[400px] flex items-center px-10">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Modern bright hospital lobby interior" 
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNVBjIVNf8ANTDU1xB4aclW3kD-CyPhCz6ufATbGQZpy7RQhG5WL0EppTV0Rk2n9zO_2klA7HpTbS3lqVDrjxQEPvgArSubBkybTCt8RRgqFxNop3B3yaEBflgR8HeivePpc9iJuqN3GCThqIMx86tTuJXmvJt2Xbqaz1_ROaNDx-qVDen3Z7bwBEJcB-okcFO9YISZZbR_M79HNfsdMut7fqYLmGYqn4rYdlg-4s2saajRHq4ubTSHA5J_verv8sSDXoi8jz7jNU3"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b190d]/80 via-[#1b190d]/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl text-white">
          <h2 className="services-hero-title text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            {t('servicesPage.heroTitle')}
          </h2>
          <p className="services-hero-subtitle text-lg text-white/90 mb-8 font-medium">
            {t('servicesPage.heroSubtitle')}
          </p>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[#9a8d4c]" />
            </div>
            <input 
              className="block w-full pl-11 pr-4 py-4 bg-white rounded-xl border-none text-[#1b190d] placeholder:text-[#9a8d4c] focus:ring-2 focus:ring-[#edca13] shadow-xl"
              placeholder={t('servicesPage.searchPlaceholder')}
              type="text"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-[#edca13] font-bold uppercase tracking-widest text-xs">{t('servicesPage.ourExpertise')}</span>
          <h3 className="text-3xl font-extrabold mt-1">{t('servicesPage.ourMedicalServices')}</h3>
        </div>
        <p className="max-w-md text-sm text-[#9a8d4c]">
          {t('servicesPage.ourMedicalServicesDesc')}
        </p>
      </div>

      <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service) => (
          <div 
            key={service.title}
            className={`service-card-item group bg-white p-6 rounded-xl border border-[#edca13]/10 hover:border-[#edca13] transition-all hover:shadow-2xl hover:shadow-[#edca13]/10 flex flex-col h-full ${service.isFeatured ? 'border-t-4 border-t-[#edca13]' : ''}`}
          >
            <div className={`size-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#edca13] transition-colors ${service.isFeatured ? 'bg-[#edca13]' : 'bg-[#edca13]/10'}`}>
              <service.icon className={`text-[#edca13] group-hover:text-white text-3xl transition-colors ${service.isFeatured ? 'text-white' : ''}`} size={28} />
            </div>
            <h4 className="text-xl font-bold mb-3">{service.title}</h4>
            <p className="text-[#9a8d4c] text-sm leading-relaxed mb-6 flex-grow">{service.description}</p>
            <button 
              onClick={() => router.push(getBookingUrl())}
              className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${service.isFeatured 
                ? 'bg-[#edca13] text-white shadow-lg shadow-[#edca13]/20 hover:brightness-105' 
                : 'bg-[#edca13]/10 text-[#edca13] group-hover:bg-[#edca13] group-hover:text-white'
              }`}
            >
              {service.isFeatured ? t('servicesPage.getHelp') : t('servicesPage.bookNow')}
              <ArrowRight className="text-sm" size={16} />
            </button>
          </div>
        ))}
      </div>

      <section className="trust-section mt-20 py-10 border-y border-[#edca13]/20 flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60">
        {trustItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
            <item.icon className="text-3xl" size={28} />
            <span className="font-bold text-lg">{item.label}</span>
          </div>
        ))}
      </section>

      <section className="cta-section mt-20 bg-[#1b190d] rounded-2xl p-10 lg:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#edca13]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#edca13]/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        <h3 className="text-3xl lg:text-4xl font-extrabold mb-6 relative z-10">{t('servicesPage.ctaTitle')}</h3>
        <p className="text-white/70 max-w-xl mx-auto mb-10 relative z-10">{t('servicesPage.ctaSubtitle')}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button 
            onClick={() => router.push(getBookingUrl())}
            className="px-8 py-4 bg-[#edca13] text-[#1b190d] font-extrabold rounded-xl hover:scale-105 transition-transform w-full sm:w-auto"
          >
            {t('servicesPage.scheduleAppointment')}
          </button>
          <button className="px-8 py-4 bg-white/10 text-white font-extrabold rounded-xl border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto">
            {t('servicesPage.contactSupport')}
          </button>
        </div>
      </section>
    </main>
  )
}
