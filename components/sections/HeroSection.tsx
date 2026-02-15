'use client';

import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';
import {useLocale} from '@/contexts/LocaleContext';
import Link from 'next/link';

interface IProps {
  role?: string | null;
}

const HeroSection = ({ role }: IProps) => {
  const {t} = useLocale();
  const title = t('hero.title');
  const subtitle = t('hero.subtitle');
  const cta = t('hero.cta');

  return (
    <section className="pt-20 px-1 md:px-6">
      <div className="max-w-7xl mx-auto rounded-[3rem] hero-gradient p-6 sm:p-8 md:p-12 lg:p-20 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 relative z-10">
          <div className="">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 rounded-full mb-6 sm:mb-8 border border-white/30">
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Expert Doctors</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 sm:mb-8 tracking-tight">
              {title}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <div className="group relative">
                <div className="-inset-0.5 group-hover:opacity-50 transition duration-300 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 opacity-30 rounded-full absolute blur-lg" />
                <Button variant="cta" asChild size='icon-lg' className="w-full sm:w-auto relative">
                  <Link href={role == 'admin' ? '/admin/appointments' : role == 'doctor' ? '/doctors/appointments': '/patient/appointments'}>
                    {cta}
                    <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              <Link className="flex items-center gap-2 font-bold group text-slate-900 dark:text-white" href="/doctor">
                Find a Doctor
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-end lg:pl-6 xl:pl-12">
            <p className="text-base sm:text-lg opacity-80 leading-relaxed mb-8 sm:mb-10 md:mb-12">
              {subtitle}
            </p>
            <div className="relative">
              <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] rounded-3xl shadow-2xl relative">
                <Image 
                  src="/hero-doctor.jpg" 
                  alt="Hero Doctor" 
                  fill
                  className="object-cover rounded-3xl"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 glass-card p-4 sm:p-6 rounded-3xl shadow-xl max-w-[240px] sm:max-w-[280px]">
                <div className="flex -space-x-3 sm:-space-x-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 flex items-center justify-center text-base sm:text-lg">👩‍⚕️</div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white dark:border-slate-800 bg-slate-300 flex items-center justify-center text-base sm:text-lg">👨‍⚕️</div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white dark:border-slate-800 bg-slate-400 flex items-center justify-center text-base sm:text-lg">👩‍⚕️</div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white dark:border-slate-800 bg-primary flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">2K+</div>
                </div>
                <p className="text-xs sm:text-sm font-semibold mb-2">More than 2,000+ Doctors in your door</p>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center absolute -top-4 sm:-top-5 -right-4 sm:-right-5 rotate-12">
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
