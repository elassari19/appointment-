'use client';

import {useLocale} from '@/contexts/LocaleContext';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import KeyServicesSection from '@/components/sections/KeyServicesSection';
import TechnologySection from '@/components/sections/TechnologySection';

export default function LandingPage() {
  const {t} = useLocale();
 
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
    </div>
  );
}
