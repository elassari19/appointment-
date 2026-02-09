'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

const TechnologySection = () => {
  return (
    <section className="py-8 px-1 md:px-6">
      <div className="max-w-7xl mx-auto rounded-[3rem] hero-gradient p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
        <div className="lg:w-1/2 order-2 lg:order-1">
          <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] rounded-3xl shadow-2xl relative">
            <Image 
              src="/intelligent.png" 
              alt="Intelligent Technology" 
              className="object-cover rounded-2xl"
              width={400}
              height={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </div>
        </div>
        <div className="lg:w-1/2 order-1 lg:order-2">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Improving health with intelligent technology
          </h2>
          <p className="text-lg opacity-70 mb-10 leading-relaxed">
            Harnessing smart technology to deliver personalized healthcare solutions that enhance wellness, prevent illness, and promote healthier lifestyles.
          </p>
          <div>
            <Button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-6 rounded-full font-bold text-lg shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-105 transition-transform">
              Book a Free Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;