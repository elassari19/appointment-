import { Button } from "../ui/button";
import { Star } from "lucide-react";
import Image from "next/image";

const KeyServicesSection = () => (
  <section className="py-8 px-1 md:px-6 bg-slate-50 dark:bg-slate-900/50">
    {/* Header */}
    <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold leading-tight">
        Our Key Healthcare<br />Services
      </h2>
      <p className="text-muted-foreground text-base md:text-lg self-center">
        Comprehensive medical services designed to keep you healthy, safe, and cared for.
      </p>
    </div>

    {/* Bento Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {/* Large card */}
      <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
        <Image 
          src="/heart-3d.jpg" 
          alt="Heart health" 
          fill
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="relative z-10 p-6 h-full flex flex-col justify-between bg-gradient-to-t from-primary/80 to-transparent">
          <p className="text-primary-foreground/80 text-sm">Welcome Back! PureMed</p>
          <div>
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-4">
              Check Your Health<br />Regularly
            </h3>
            <Button variant="secondary" className="rounded-full text-sm">Check Now</Button>
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div className="bg-lavender rounded-2xl p-5 text-lavender-foreground flex flex-col justify-between">
        <h4 className="font-display font-bold text-lg">Statistics</h4>
        <p className="text-xs opacity-80 mt-2 leading-relaxed">
          Manage your health records, track wellness progress, and book doctor appointments instantly.
        </p>
      </div>

      {/* Chart card */}
      <div className="bg-card rounded-2xl border p-5">
        <p className="text-sm font-medium mb-2">Report Cases</p>
        <div className="flex items-end gap-1 h-20">
          {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
            <div key={i} className="flex-1 bg-muted rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Satisfaction */}
      <div className="bg-card rounded-2xl border p-5 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted-foreground mb-1">Stay Informed</p>
        <p className="text-3xl font-display font-bold text-lavender">90.5%</p>
        <p className="text-xs text-muted-foreground mt-1">patient satisfaction</p>
      </div>

      {/* Doctor card */}
      <div className="col-span-2 bg-lavender rounded-2xl overflow-hidden flex">
        <div className="p-5 flex-1 text-lavender-foreground">
          <h4 className="font-display font-bold text-lg mb-3">Dr. Sarah Johnson</h4>
          <div className="space-y-1 text-sm">
            <p><span className="opacity-70">Specialization:</span> Cardiologist</p>
            <p><span className="opacity-70">Experience:</span> 12+ Years</p>
            <p className="flex items-center gap-1">
              <span className="opacity-70">Rating:</span> (4.9)
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            </p>
          </div>
          <Button variant="secondary" className="rounded-full text-sm mt-4">Book an Appointment</Button>
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

      {/* Checkup card */}
      <div className="col-span-2 bg-card rounded-2xl border p-5">
        <p className="text-xs text-muted-foreground mb-1">Welcome Back! PureMed</p>
        <h4 className="font-display font-bold text-lg mb-2">Stay proactive with routine health checkups</h4>
        <a href="#" className="text-sm font-medium text-accent hover:underline">Book an Appointment</a>
      </div>
    </div>
  </section>
);

export default KeyServicesSection;