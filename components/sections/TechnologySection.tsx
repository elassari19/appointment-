'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {useLocale} from '@/contexts/LocaleContext';
import Link from 'next/link';
import { useGSAP } from "@/lib/gsap-animations";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface IProps {
  role?: string | null;
}
const TechnologySection = ({ role }: IProps) => {
  const {t} = useLocale();
  const title = t('technology.title');
  const subtitle = t('technology.subtitle');
  const cta = t('technology.cta');

  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.tech-title',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.tech-title', start: 'top 80%' } }
      );

      gsap.fromTo('.tech-subtitle',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.tech-subtitle', start: 'top 80%' } }
      );

      gsap.fromTo('.tech-image',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: '.tech-image', start: 'top 80%' } }
      );

      gsap.fromTo('.tech-cta',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power3.out', scrollTrigger: { trigger: '.tech-cta', start: 'top 90%' } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-8 px-1 md:px-6">
      <div className="max-w-7xl mx-auto rounded-[3rem] hero-gradient p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
        <div className="lg:w-1/2 order-2 lg:order-1">
          <div className="tech-image w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] rounded-3xl shadow-2xl relative">
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
          <h2 className="tech-title text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            {title}
          </h2>
          <p className="tech-subtitle text-lg opacity-70 mb-10 leading-relaxed">
            {subtitle}
          </p>
          <div className="tech-cta">
            <Button asChild className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-6 rounded-full font-bold text-lg shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-105 transition-transform">
              <Link href={role == 'admin' ? '/admin/appointments' : role == 'doctor' ? '/doctors/appointments': '/patient/appointments'}>
                {cta}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
