'use client'

import { Button } from "../ui/button";
import { Star } from "lucide-react";
import Image from "next/image";
import {useLocale} from '@/contexts/LocaleContext';

interface KeyServicesSectionProps {
  title?: string;
  subtitle?: string;
  welcome?: string;
  checkHealth?: string;
  checkNow?: string;
  statistics?: string;
  statisticsDesc?: string;
  reportCases?: string;
  satisfaction?: string;
  stayInformed?: string;
  drName?: string;
  specialization?: string;
  experience?: string;
  rating?: string;
  bookAppointment?: string;
  stayProactive?: string;
  bookLink?: string;
}

const KeyServicesSection = (props: KeyServicesSectionProps) => {
  const {t} = useLocale();
  const title = props.title || t('keyServices.title');
  const subtitle = props.subtitle || t('keyServices.subtitle');
  const welcome = props.welcome || t('keyServices.welcome');
  const checkHealth = props.checkHealth || t('keyServices.checkHealth');
  const checkNow = props.checkNow || t('keyServices.checkNow');
  const statistics = props.statistics || t('keyServices.statistics');
  const statisticsDesc = props.statisticsDesc || t('keyServices.statisticsDesc');
  const reportCases = props.reportCases || t('keyServices.reportCases');
  const satisfaction = props.satisfaction || t('keyServices.satisfaction');
  const stayInformed = props.stayInformed || t('keyServices.stayInformed');
  const drName = props.drName || t('keyServices.drName');
  const specialization = props.specialization || t('keyServices.specialization');
  const experience = props.experience || t('keyServices.experience');
  const rating = props.rating || t('keyServices.rating');
  const bookAppointment = props.bookAppointment || t('keyServices.bookAppointment');
  const stayProactive = props.stayProactive || t('keyServices.stayProactive');
  const bookLink = props.bookLink || t('keyServices.bookLink');

  return (
    <section className="py-8 px-1 md:px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg self-center">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
        <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
          <Image 
            src="/heart-3d.jpg" 
            alt="Heart health" 
            fill
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="relative z-10 p-6 h-full flex flex-col justify-between bg-gradient-to-t from-primary/80 to-transparent">
            <p className="text-primary-foreground/80 text-sm">{welcome}</p>
            <div>
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-4">
                {checkHealth}
              </h3>
              <Button variant="secondary" className="rounded-full text-sm">{checkNow}</Button>
            </div>
          </div>
        </div>

        <div className="bg-lavender rounded-2xl p-5 text-lavender-foreground flex flex-col justify-between">
          <h4 className="font-display font-bold text-lg">{statistics}</h4>
          <p className="text-xs opacity-80 mt-2 leading-relaxed">
            {statisticsDesc}
          </p>
        </div>

        <div className="bg-card rounded-2xl border p-5">
          <p className="text-sm font-medium mb-2">{reportCases}</p>
          <div className="flex items-end gap-1 h-20">
            {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 bg-muted rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-5 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-1">{stayInformed}</p>
          <p className="text-3xl font-display font-bold text-lavender">90.5%</p>
          <p className="text-xs text-muted-foreground mt-1">{satisfaction}</p>
        </div>

        <div className="col-span-2 bg-lavender rounded-2xl overflow-hidden flex">
          <div className="p-5 flex-1 text-lavender-foreground">
            <h4 className="font-display font-bold text-lg mb-3">{drName}</h4>
            <div className="space-y-1 text-sm">
              <p><span className="opacity-70">{specialization}:</span> Cardiologist</p>
              <p><span className="opacity-70">{experience}:</span> 12+ Years</p>
              <p className="flex items-center gap-1">
                <span className="opacity-70">{rating}:</span> (4.9)
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </p>
            </div>
            <Button variant="secondary" className="rounded-full text-sm mt-4">{bookAppointment}</Button>
          </div>
          <div className="w-40 hidden md:block relative">
            <Image 
              src="/doctor-portrait.jpg" 
              alt="Dr. Sarah" 
              width={160}
              height={160}
              className="w-full h-full object-cover" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="col-span-2 bg-card rounded-2xl border p-5">
          <p className="text-xs text-muted-foreground mb-1">{welcome}</p>
          <h4 className="font-display font-bold text-lg mb-2">{stayProactive}</h4>
          <a href="#" className="text-sm font-medium text-accent hover:underline">{bookLink}</a>
        </div>
      </div>
    </section>
  );
};

export default KeyServicesSection;
