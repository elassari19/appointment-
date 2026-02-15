'use client';

import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Menu, Bell, Globe, User, LogOut, Settings} from 'lucide-react';
import Link from 'next/link';
import {useState, useRef, useEffect} from 'react';
import {useLocale} from '@/contexts/LocaleContext';
import {useAuth} from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {locale, setLocale, t} = useLocale();
  const {isAuthenticated, user, logout} = useAuth();

  const navLinks = [
    {key: 'nav.home', href: '/', active: true},
    {key: 'nav.aboutUs', href: '/about'},
    {key: 'nav.services', href: '/services'},
    {key: 'nav.doctors', href: '/doctor'},
    {key: 'nav.blog', href: '/blog'},
  ];

  const filteredNavLinks = user?.role === 'patient' 
    ? [...navLinks, {key: 'nav.appointments', href: '/patient/appointments'}]
    : navLinks;

  const switchLocale = (newLocale: 'en' | 'ar') => {
    setLocale(newLocale);
    setIsLangOpen(false);
  };

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 px-8 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10 py-2 glass-card  backdrop-blur rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Link href={`/`} className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white uppercase">
            Nutrison
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {filteredNavLinks.map((link, index) => (
            <Link
              key={link.key}
              href={link.href}
              className={`text-base font-semibold hover:text-primary transition-colors ${
                index === 0 ? '' : 'opacity-70'
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Globe className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg py-3 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => switchLocale('en')}
                  className="w-full px-5 py-3 text-left text-base hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                >
                  <span className="text-xl">🇺🇸</span>
                  {t('lang.english')}
                </button>
                <button
                  onClick={() => switchLocale('ar')}
                  className="w-full px-5 py-3 text-left text-base hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                >
                  <span className="text-xl">🇸🇦</span>
                  {t('lang.arabic')}
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Bell className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl py-4 border border-slate-200 dark:border-slate-700">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-base text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <button className="w-full px-5 py-4 text-left text-base hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <User className="h-5 w-5" />
                      {t('auth.profile')}
                    </button>
                    <button className="w-full px-5 py-4 text-left text-base hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <Settings className="h-5 w-5" />
                      {t('auth.settings')}
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                      <button
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full px-5 py-4 text-left text-base hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                      >
                        <LogOut className="h-5 w-5" />
                        {t('auth.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href={`/login`}
                  className="px-7 py-2 rounded-xl font-bold text-base text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  href={`/signup`}
                  className="px-7 py-2 rounded-xl font-bold text-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-5 mt-10">
                {filteredNavLinks.map((link) => (
                  <Button
                    key={link.key}
                    variant="outline"
                    className="rounded-xl bg-white text-black/90 hover:bg-gray-100 hover:text-black hover:font-bold w-full text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href={link.href}>{t(link.key)}</Link>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="rounded-xl bg-white text-black/90 hover:bg-gray-100 hover:text-black hover:font-bold w-full text-lg mt-5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.contactUs')}
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
