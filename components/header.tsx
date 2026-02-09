'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#', active: true },
    { label: 'About Us', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'Doctors', href: '#' },
    { label: 'Appointments', href: '#' },
    { label: 'Blog', href: '#' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4 glass-card rounded-full shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href={'/'} className="text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-white uppercase">
            Nutrison
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-semibold hover:text-primary transition-colors ${
                index === 0 ? '' : 'opacity-70'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 hidden sm:flex">
            Contact Us
          </Button>
          <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>
          
          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant="outline"
                    className="rounded-full bg-white text-black/90 hover:bg-gray-100 hover:text-black hover:font-bold w-full text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="rounded-full bg-white text-black/90 hover:bg-gray-100 hover:text-black hover:font-bold w-full text-base mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Header;