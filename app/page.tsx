import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">Nutrison</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Connect with expert dietitians for personalized nutrition guidance. 
            Book appointments, manage your health, and achieve your wellness goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/patient/signup">Join as Patient</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dietitian/signup">Join as Dietitian</Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Find and book appointments with qualified dietitians at your convenience.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
              <p className="text-muted-foreground">
                Receive personalized nutrition plans from certified professionals.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Your health data is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}