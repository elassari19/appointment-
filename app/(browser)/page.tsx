import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import KeyServicesSection from '@/components/sections/KeyServicesSection';
import TechnologySection from '@/components/sections/TechnologySection';
import { getServerUser } from '@/lib/middleware/role-protection';

export default async function LandingPage() {
  const user = await getServerUser();
 
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main>
        <HeroSection role={user?.role} />
        <ServicesSection  role={user?.role} />
        <KeyServicesSection />
        <TechnologySection role={user?.role} />
      </main>
    </div>
  );
}
