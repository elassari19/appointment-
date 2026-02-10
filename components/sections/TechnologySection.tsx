'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {useLocale} from '@/contexts/LocaleContext';

interface TechnologySectionProps {
  title?: string;
  subtitle?: string;
  cta?: string;
}

const TechnologySection = (props: TechnologySectionProps) => {
  const {t} = useLocale();
  const title = props.title || t('technology.title');
  const subtitle = props.subtitle || t('technology.subtitle');
  const cta = props.cta || t('technology.cta');

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
            {title}
          </h2>
          <p className="text-lg opacity-70 mb-10 leading-relaxed">
            {subtitle}
          </p>
          <div>
            <Button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-6 rounded-full font-bold text-lg shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-105 transition-transform">
              {cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
