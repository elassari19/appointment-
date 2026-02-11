'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  userInitials?: string;
  userAvatarUrl?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({
  title,
  subtitle,
  showSearch = true,
  searchPlaceholder = 'Search records...',
  userInitials = 'A',
  userAvatarUrl,
  notificationCount = 0,
  onSearch,
}: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        )}
        <button className="p-2.5 bg-card border border-border rounded-xl relative">
          <span className="material-icons-round text-muted-foreground">notifications</span>
          {notificationCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          )}
        </button>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold cursor-pointer overflow-hidden">
          {userAvatarUrl ? (
            <Image src={userAvatarUrl} alt="User" fill className="object-cover" />
          ) : (
            userInitials
          )}
        </div>
      </div>
    </header>
  );
}
