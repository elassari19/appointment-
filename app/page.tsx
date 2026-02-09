'use client';

import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import KeyServicesSection from '@/components/sections/KeyServicesSection';
import TechnologySection from '@/components/sections/TechnologySection';
import Footer from '@/components/Footer';

// Main Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <main>
        <HeroSection />
        <ServicesSection />
        <KeyServicesSection />
        <TechnologySection />
      </main>
      <Footer />
    </div>
  );
}
