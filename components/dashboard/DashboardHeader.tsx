'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Search, Globe, User, LogOut, Settings, ChevronDown, Calendar, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
}

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  userRole?: 'patient' | 'doctor' | 'admin';
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      setShowSearchResults(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(value);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchValue('');
    if (result.role === 'doctor') {
      router.push(`/doctors/${result.id}`);
    } else if (result.role === 'patient') {
      router.push(`/patient/${result.id}`);
    } else if (result.role === 'admin') {
      router.push(`/admin/staff`);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationsOpen(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications?markAll=true', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'appointment_cancelled':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
          <div className="relative hidden sm:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => searchValue.length >= 2 && setShowSearchResults(true)}
              className="pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {result.firstName.charAt(0)}{result.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.email}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                          {result.role}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                )}
              </div>
            )}
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

        <button 
          onClick={handleNotificationClick}
          className="p-2.5 bg-card border border-border rounded-xl relative hover:bg-muted transition-colors"
        >
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

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
              {notifications.some(n => !n.read) && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="shrink-0">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
