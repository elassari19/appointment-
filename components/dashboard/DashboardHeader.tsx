'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Search, Globe, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({
  title,
  subtitle,
  showSearch = true,
  searchPlaceholder = 'Search records...',
  notificationCount = 0,
  onSearch,
}: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { user, logout, isAuthenticated } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const switchLocale = (newLocale: 'en' | 'ar') => {
    setLocale(newLocale);
    setIsLangOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        {title && <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>}
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        )}

        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg py-2 border border-border z-50">
              <button
                onClick={() => switchLocale('en')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              >
                <span>🇺🇸</span> English
              </button>
              <button
                onClick={() => switchLocale('ar')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              >
                <span>🇸🇦</span> العربية
              </button>
            </div>
          )}
        </div>

        <button className="p-2.5 bg-card border border-border rounded-xl relative hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden">
              {getUserInitials()}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg py-2 border border-border z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground">
                <User className="h-4 w-4" />
                {t('auth.profile')}
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground">
                <Settings className="h-4 w-4" />
                {t('auth.settings')}
              </button>
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
