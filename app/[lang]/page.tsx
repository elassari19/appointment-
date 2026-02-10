'use client';

import {useLocale} from '@/contexts/LocaleContext';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import KeyServicesSection from '@/components/sections/KeyServicesSection';
import TechnologySection from '@/components/sections/TechnologySection';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const {t} = useLocale();
 
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <main>
        <HeroSection 
          title={t('hero.title')} 
          subtitle={t('hero.subtitle')} 
          cta={t('hero.cta')} 
        />
        <ServicesSection 
          title={t('services.title')} 
          subtitle={t('services.subtitle')} 
        />
        <KeyServicesSection />
        <TechnologySection />
      </main>
      <Footer />
    </div>
  );
}
