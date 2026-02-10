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
    'auth.login.welcomeBack': 'Welcome back',
    'auth.login.signInToAccount': 'Sign in to your account',
    'auth.login.emailLabel': 'Email address',
    'auth.login.emailPlaceholder': 'Enter your email',
    'auth.login.passwordLabel': 'Password',
    'auth.login.passwordPlaceholder': 'Enter your password',
    'auth.login.rememberMe': 'Remember me',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.signInButton': 'Sign in',
    'auth.login.orDivider': 'or',
    'auth.login.continueWithGoogle': 'Continue with Google',
    'auth.login.continueWithGitHub': 'Continue with GitHub',
    'auth.login.dontHaveAccount': "Don't have an account?",
    'auth.login.signUpLink': 'Sign up',
    'auth.login.transformJourney': 'Transform Your Health Journey',
    'auth.login.transformJourneyDesc': 'Experience personalized nutrition plans designed to help you achieve your wellness goals with expert dietitians and cutting-edge tools.',
    'auth.login.feature1Title': 'Personalized Nutrition Plans',
    'auth.login.feature1Desc': 'Customized meal plans tailored to your goals',
    'auth.login.feature2Title': 'Expert Dietitian Support',
    'auth.login.feature2Desc': 'Connect with certified nutrition professionals',
    'auth.login.feature3Title': 'Track Your Progress',
    'auth.login.feature3Desc': 'Monitor your health metrics in real-time',
    'auth.login.testimonialQuote': 'Nutrison has transformed my relationship with food. The personalized plans and expert guidance helped me lose 20 pounds and feel more energetic than ever!',
    'auth.login.testimonialAuthor': 'Sarah Chen',
    'auth.login.testimonialRole': 'Health Enthusiast',
    'auth.login.statsActiveUsers': 'Active Users',
    'auth.login.statsDietitians': 'Dietitians',
    'auth.login.statsSatisfaction': 'Satisfaction',
    'auth.signup.createAccount': 'Create Account',
    'auth.signup.joinSubtitle': 'Join Nutrison for personalized nutrition',
    'auth.signup.firstNameLabel': 'First Name',
    'auth.signup.firstNamePlaceholder': 'John',
    'auth.signup.lastNameLabel': 'Last Name',
    'auth.signup.lastNamePlaceholder': 'Doe',
    'auth.signup.emailLabel': 'Email address',
    'auth.signup.emailPlaceholder': 'your@email.com',
    'auth.signup.passwordLabel': 'Password',
    'auth.signup.passwordPlaceholder': 'Create a strong password',
    'auth.signup.passwordReqMin': 'At least 8 characters',
    'auth.signup.passwordReqUpper': 'One uppercase letter',
    'auth.signup.passwordReqLower': 'One lowercase letter',
    'auth.signup.passwordReqNumber': 'One number',
    'auth.signup.accountTypeLabel': 'Account Type',
    'auth.signup.accountTypePlaceholder': 'Select account type',
    'auth.signup.patientType': 'Patient',
    'auth.signup.patientTypeDesc': 'For health tracking',
    'auth.signup.dietitianType': 'Dietitian',
    'auth.signup.dietitianTypeDesc': 'For professionals',
    'auth.signup.createButton': 'Create Account',
    'auth.signup.alreadyHaveAccount': 'Already have an account?',
    'auth.signup.loginLink': 'Login',
    'auth.signup.startJourney': 'Start Your Wellness Journey',
    'auth.signup.startJourneyDesc': "Join thousands of users who have transformed their lives with Nutrison's personalized nutrition solutions.",
    'auth.signup.feature1Title': 'Personalized Plans',
    'auth.signup.feature1Desc': 'Tailored meal plans based on your goals',
    'auth.signup.feature2Title': 'Expert Guidance',
    'auth.signup.feature2Desc': 'Support from certified dietitians',
    'auth.signup.feature3Title': 'Track Progress',
    'auth.signup.feature3Desc': 'Monitor your health journey',
    'auth.signup.testimonialQuote': "Nutrison made it easy to stick to my diet. The expert guidance and personalized plans helped me achieve my weight loss goals in just 3 months!",
    'auth.signup.testimonialAuthor': 'Michael Johnson',
    'auth.signup.testimonialRole': 'Lost 30 lbs',
    'auth.signup.statsSuccess': 'Success Rate',
    'auth.signup.statsMeals': 'Meals Planned',
    'auth.signup.statsSupport': 'Support',
    'auth.error.loginFailed': 'Login failed',
    'auth.error.loginError': 'An error occurred during login',
    'auth.error.signupFailed': 'Signup failed',
    'auth.error.signupError': 'An error occurred during signup',
    'auth.error.validEmail': 'Please enter a valid email address',
    'auth.error.passwordRequired': 'Password is required',
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
    'auth.login.welcomeBack': 'مرحباً بعودتك',
    'auth.login.signInToAccount': 'سجل الدخول إلى حسابك',
    'auth.login.emailLabel': 'البريد الإلكتروني',
    'auth.login.emailPlaceholder': 'أدخل بريدك الإلكتروني',
    'auth.login.passwordLabel': 'كلمة المرور',
    'auth.login.passwordPlaceholder': 'أدخل كلمة المرور',
    'auth.login.rememberMe': 'تذكرني',
    'auth.login.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.login.signInButton': 'تسجيل الدخول',
    'auth.login.orDivider': 'أو',
    'auth.login.continueWithGoogle': 'المتابعة عبر Google',
    'auth.login.continueWithGitHub': 'المتابعة عبر GitHub',
    'auth.login.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.login.signUpLink': 'سجل الآن',
    'auth.login.transformJourney': 'حوّل رحلتك الصحية',
    'auth.login.transformJourneyDesc': 'جرب خطط التغذية الشخصية المصممة لمساعدتك على تحقيق أهداف لياقتك مع أخصائيي تغذية وأدوات متطورة.',
    'auth.login.feature1Title': 'خطط تغذية مخصصة',
    'auth.login.feature1Desc': 'خطط وجبات مصممة خصيصاً لأهدافك',
    'auth.login.feature2Title': 'دعم أخصائيي التغذية',
    'auth.login.feature2Desc': 'تواصل مع محترفين معتمدين في التغذية',
    'auth.login.feature3Title': 'تتبع تقدمك',
    'auth.login.feature3Desc': 'راقب مقاييس صحتك في الوقت الفعلي',
    'auth.login.testimonialQuote': 'غيّر Nutris علاقتي بالطعام. ساعدتني الخطط الشخصية والإرشاد الخبراء على فقدان 10 كيلوغرام والشعور بطاقة أكبر من أي وقت مضى!',
    'auth.login.testimonialAuthor': 'سارة تشين',
    'auth.login.testimonialRole': 'عاشقة الصحة',
    'auth.login.statsActiveUsers': 'مستخدمين نشطين',
    'auth.login.statsDietitians': 'أخصائي تغذية',
    'auth.login.statsSatisfaction': 'رضا',
    'auth.signup.createAccount': 'إنشاء حساب',
    'auth.signup.joinSubtitle': 'انضم إلى Nutris لتغذية شخصية',
    'auth.signup.firstNameLabel': 'الاسم الأول',
    'auth.signup.firstNamePlaceholder': 'أحمد',
    'auth.signup.lastNameLabel': 'الاسم الأخير',
    'auth.signup.lastNamePlaceholder': 'علي',
    'auth.signup.emailLabel': 'البريد الإلكتروني',
    'auth.signup.emailPlaceholder': 'your@email.com',
    'auth.signup.passwordLabel': 'كلمة المرور',
    'auth.signup.passwordPlaceholder': 'أنشئ كلمة مرور قوية',
    'auth.signup.passwordReqMin': 'على الأقل 8 أحرف',
    'auth.signup.passwordReqUpper': 'حرف كبير واحد',
    'auth.signup.passwordReqLower': 'حرف صغير واحد',
    'auth.signup.passwordReqNumber': 'رقم واحد',
    'auth.signup.accountTypeLabel': 'نوع الحساب',
    'auth.signup.accountTypePlaceholder': 'اختر نوع الحساب',
    'auth.signup.patientType': 'مريض',
    'auth.signup.patientTypeDesc': 'لمتابعة الصحة',
    'auth.signup.dietitianType': 'أخصائي تغذية',
    'auth.signup.dietitianTypeDesc': 'للمحترفين',
    'auth.signup.createButton': 'إنشاء حساب',
    'auth.signup.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.signup.loginLink': 'تسجيل الدخول',
    'auth.signup.startJourney': 'ابدأ رحلتك الصحية',
    'auth.signup.startJourneyDesc': 'انضم إلى آلاف المستخدمين الذين حوّلوا حياتهم مع حلول Nutris للتغذية الشخصية.',
    'auth.signup.feature1Title': 'خطط مخصصة',
    'auth.signup.feature1Desc': 'خطط وجبات مصممة حسب أهدافك',
    'auth.signup.feature2Title': 'إرشاد الخبراء',
    'auth.signup.feature2Desc': 'دعم من أخصائيي تغذية معتمدين',
    'auth.signup.feature3Title': 'تتبع التقدم',
    'auth.signup.feature3Desc': 'راقب رحلتك الصحية',
    'auth.signup.testimonialQuote': 'سهلت Nutris الالتزام بنظامي الغذائي. ساعدني الإرشاد الخبراء والخطط الشخصية على تحقيق أهداف فقدان الوزن في غضون 3 أشهر فقط!',
    'auth.signup.testimonialAuthor': 'مايكل جونسون',
    'auth.signup.testimonialRole': 'خسر 15 كيلو',
    'auth.signup.statsSuccess': 'نسبة النجاح',
    'auth.signup.statsMeals': 'وجبات مخططة',
    'auth.signup.statsSupport': 'دعم',
    'auth.error.loginFailed': 'فشل تسجيل الدخول',
    'auth.error.loginError': 'حدث خطأ أثناء تسجيل الدخول',
    'auth.error.signupFailed': 'فشل إنشاء الحساب',
    'auth.error.signupError': 'حدث خطأ أثناء إنشاء الحساب',
    'auth.error.validEmail': 'يرجى إدخال بريد إلكتروني صالح',
    'auth.error.passwordRequired': 'كلمة المرور مطلوبة',
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
