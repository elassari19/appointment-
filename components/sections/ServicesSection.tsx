import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

const ServicesSection = () => (
  <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
    {/* Header */}
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <h2 className="text-3xl md:text-5xl font-bold leading-tight">
        Explore Our Range Of<br />
        <span className="inline-flex items-center gap-2">
          <span className="text-2xl">🩺</span> Healthcare Services
        </span>
      </h2>
      <p className="text-muted-foreground text-base md:text-lg self-center">
        <span className="text-accent font-medium">Discover comprehensive healthcare</span> solutions tailored to your needs,
        including preventive care, advanced treatments, and personalized
        support for a healthier, happier life every day.
      </p>
    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Card 1 */}
      <div className="bg-card rounded-xl border overflow-hidden group">
        <div className="h-48 overflow-hidden">
          <Image src="/mental-health.jpg" alt="Mental health" width={500} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold mb-3">Mental Health Services</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Compassionate care and <span className="text-foreground font-medium">expert support</span> to help you achieve <span className="text-foreground font-medium">emotional balance, mental clarity, and lasting</span> well-being.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Learn More</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card 2 - Featured */}
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
            <h3 className="font-display text-2xl font-semibold mb-3">Meet Our Expert Doctors</h3>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Get to know our highly qualified doctors committed to providing personalized
              care and expert medical guidance for every patient.
            </p>
            <Button variant="secondary" className="rounded-full text-sm font-medium">
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-card rounded-xl border overflow-hidden group">
        <div className="h-48 overflow-hidden">
          <Image src="/counseling.jpg" alt="Counseling" width={500} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold mb-3">Individual Counseling</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Personalized <span className="text-accent font-medium">one-on-one counseling</span> sessions designed to address your
            unique <span className="text-foreground font-medium">emotional challenges.</span>
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Learn More</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;