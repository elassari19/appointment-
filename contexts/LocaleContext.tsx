"use client";

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';

export type Locale = 'en' | 'ar';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.aboutUs': 'About Us',
    'nav.services': 'Services',
    'nav.doctors': 'Doctors',
    'nav.appointments': 'Appointments',
    'nav.blog': 'Blog',
    'nav.contactUs': 'Contact Us',
    'hero.title': 'Expert Healthcare Services',
    'hero.subtitle': 'Compassionate, patient-centered care for you and your family',
    'hero.cta': 'Book Appointment',
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive healthcare solutions tailored to your needs',
    'services.mentalHealthTitle': 'Mental Health Services',
    'services.mentalHealthDesc': 'Compassionate care and expert support to help you achieve emotional balance, mental clarity, and lasting well-being.',
    'services.learnMore': 'Learn More',
    'services.meetDoctorsTitle': 'Meet Our Expert Doctors',
    'services.meetDoctorsDesc': 'Get to know our highly qualified doctors committed to providing personalized care and expert medical guidance for every patient.',
    'services.bookAppointment': 'Book an Appointment',
    'services.counselingTitle': 'Individual Counseling',
    'services.counselingDesc': 'Personalized one-on-one counseling sessions designed to address your unique emotional challenges.',
    'keyServices.title': 'Our Key Healthcare Services',
    'keyServices.subtitle': 'Comprehensive medical services designed to keep you healthy, safe, and cared for',
    'keyServices.welcome': 'Welcome Back! PureMed',
    'keyServices.checkHealth': 'Check Your Health Regularly',
    'keyServices.checkNow': 'Check Now',
    'keyServices.statistics': 'Statistics',
    'keyServices.statisticsDesc': 'Manage your health records, track wellness progress, and book doctor appointments instantly',
    'keyServices.reportCases': 'Report Cases',
    'keyServices.satisfaction': 'patient satisfaction',
    'keyServices.stayInformed': 'Stay Informed',
    'keyServices.drName': 'Dr. Sarah Johnson',
    'keyServices.specialization': 'Specialization',
    'keyServices.experience': 'Experience',
    'keyServices.rating': 'Rating',
    'keyServices.bookAppointment': 'Book an Appointment',
    'keyServices.stayProactive': 'Stay proactive with routine health checkups',
    'keyServices.bookLink': 'Book an Appointment',
    'technology.title': 'Improving health with intelligent technology',
    'technology.subtitle': 'Harnessing smart technology to deliver personalized healthcare solutions that enhance wellness, prevent illness, and promote healthier lifestyles',
    'technology.cta': 'Book a Free Consultation',
    'footer.helpLive': 'Helping people live more independently',
    'footer.officeAddress': 'Office Address',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.copyright': '© 2025. All Rights Reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.cookies': 'Cookies Settings',
    'lang.english': 'English',
    'lang.arabic': 'العربية',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.profile': 'Profile',
    'auth.settings': 'Settings',
    'auth.logout': 'Logout',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.aboutUs': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.doctors': 'الأطباء',
    'nav.appointments': 'المواعيد',
    'nav.blog': 'المدونة',
    'nav.contactUs': 'اتصل بنا',
    'hero.title': 'خدمات الرعاية الصحية المتخصصة',
    'hero.subtitle': 'رعاية شاملة ومركزة على المريض لك ولعائلتك',
    'hero.cta': 'احجز موعداً',
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول رعاية صحية شاملة مصممة خصيصاً لاحتياجاتك',
    'services.mentalHealthTitle': 'خدمات الصحة النفسية',
    'services.mentalHealthDesc': 'رعاية رحيمة ودعم متخصص لمساعدتك على تحقيق التوازن العاطفي والوضوح الذهني والرفاهية الدائمة.',
    'services.learnMore': 'اعرف المزيد',
    'services.meetDoctorsTitle': 'تعرف على أطبائنا الخبراء',
    'services.meetDoctorsDesc': 'تعرف على أطبائنا المؤهلين الذين يلتزمون بتقديم رعاية شخصية وتوجيه طبي متخصص لكل مريض.',
    'services.bookAppointment': 'احجز موعداً',
    'services.counselingTitle': 'الاستشارة الفردية',
    'services.counselingDesc': 'جلسات استشارة شخصية مصممة لمعالجة تحدياتك العاطفية الفريدة.',
    'keyServices.title': 'خدماتنا الصحية الرئيسية',
    'keyServices.subtitle': 'خدمات طبية شاملة مصممة للحفاظ على صحتك وسلامتك ورعايتك',
    'keyServices.welcome': 'مرحباً بعودتك! PureMed',
    'keyServices.checkHealth': 'افحص صحتك بانتظام',
    'keyServices.checkNow': 'افحص الآن',
    'keyServices.statistics': 'إحصائيات',
    'keyServices.statisticsDesc': 'إدارة سجلاتك الصحية وتتبع تقدمك وحجز المواعيد مع الأطباء فوراً',
    'keyServices.reportCases': 'الحالات المبلغ عنها',
    'keyServices.satisfaction': 'رضا المرضى',
    'keyServices.stayInformed': 'ابقَ على اطلاع',
    'keyServices.drName': 'د. سارة جونسون',
    'keyServices.specialization': 'التخصص',
    'keyServices.experience': 'الخبرة',
    'keyServices.rating': 'التقييم',
    'keyServices.bookAppointment': 'احجز موعداً',
    'keyServices.stayProactive': 'كن استباقياً مع فحوصاتك الصحية الروتينية',
    'keyServices.bookLink': 'احجز موعداً',
    'technology.title': 'تحسين الصحة بالتكنولوجيا الذكية',
    'technology.subtitle': 'تسخير التكنولوجيا الذكية لتقديم حلول رعاية صحية مخصصة تعزز الصحة وتمنع الأمراض وترويج أنماط حياة صحية',
    'technology.cta': 'احجز استشارة مجانية',
    'footer.helpLive': 'مساعدة الناس على العيش بشكل أكثر استقلالية',
    'footer.officeAddress': 'عنوان المكتب',
    'footer.quickLinks': 'روابط سريعة',
    'footer.contact': 'اتصل بنا',
    'footer.email': 'البريد الإلكتروني',
    'footer.phone': 'الهاتف',
    'footer.copyright': 'جميع الحقوق محفوظة 2025',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام',
    'footer.cookies': 'إعدادات ملفات تعريف الارتباط',
    'lang.english': 'English',
    'lang.arabic': 'العربية',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.profile': 'الملف الشخصي',
    'auth.settings': 'الإعدادات',
    'auth.logout': 'تسجيل الخروج',
  }
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({children, locale}: {children: ReactNode; locale: Locale}) {
  const [currentLocale, setLocaleState] = useState<Locale>(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocaleState(saved);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = saved;
      }
    } else if (typeof document !== 'undefined') {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string): string => {
    return translations[currentLocale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{locale: currentLocale, setLocale, t}}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
