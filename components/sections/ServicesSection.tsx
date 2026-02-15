'use client'

import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import {useLocale} from '@/contexts/LocaleContext';
import Link from "next/link";

interface IProps {
  role?: string | null;
}

const ServicesSection = ({ role}: IProps) => {
  const {t} = useLocale();
  const title = t('services.title');
  const subtitle = t('services.subtitle');
  const mentalHealthTitle = t('services.mentalHealthTitle');
  const mentalHealthDesc = t('services.mentalHealthDesc');
  const learnMore = t('services.learnMore');
  const meetDoctorsTitle = t('services.meetDoctorsTitle');
  const meetDoctorsDesc = t('services.meetDoctorsDesc');
  const bookAppointment = t('services.bookAppointment');
  const counselingTitle = t('services.counselingTitle');
  const counselingDesc = t('services.counselingDesc');

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg self-center">
          {subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border overflow-hidden group">
          <div className="h-48 overflow-hidden">
            <Image src="/mental-health.jpg" alt="Mental health" width={500} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <h3 className="font-display text-xl font-semibold mb-3">{mentalHealthTitle}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {mentalHealthDesc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{learnMore}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-purple-200 rounded-xl overflow-hidden text-lavender-foreground">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-full bg-background/20 overflow-hidden">
                <Image src="/doctor-portrait.jpg" alt="Dr. Wahidul" width={500} height={300} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs opacity-80">Cardiology</p>
                <p className="text-sm font-semibold">Dr. Wahidul Islam</p>
              </div>
            </div>
            <div className="mt-12">
              <h3 className="font-display text-2xl font-semibold mb-3">{meetDoctorsTitle}</h3>
              <p className="text-sm opacity-90 leading-relaxed mb-6">
                {meetDoctorsDesc}
              </p>
              <Button variant="secondary" asChild className="rounded-full text-sm font-medium">
                <Link href={role == 'admin' ? '/admin/appointments' : role == 'doctor' ? '/doctors/appointments': '/patient/appointments'}>
                  {bookAppointment}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border overflow-hidden group">
          <div className="h-48 overflow-hidden">
            <Image src="/counseling.jpg" alt="Counseling" width={500} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <h3 className="font-display text-xl font-semibold mb-3">{counselingTitle}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {counselingDesc}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{learnMore}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
