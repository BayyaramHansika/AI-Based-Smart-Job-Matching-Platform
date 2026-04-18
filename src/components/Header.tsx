import React, { useState } from 'react';
import { Bell, Search as SearchIcon, Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  userName: string;
  subText: string;
  userTitle?: string;
  profileStrength?: number;
  avatarUrl?: string;
}

export function Header({ userName, subText, userTitle, profileStrength, avatarUrl }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Visual feedback for re-sync
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 600);
  };

  return (
    <header className="h-20 bg-brand-surface border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-brand-text-main">
              Welcome back, {userName}
            </h2>
            {userTitle && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-bg border border-brand-border rounded text-[10px] font-black uppercase text-brand-text-muted tracking-widest">
                {userTitle}
              </span>
            )}
          </div>
          <p className="text-[13px] font-semibold text-brand-text-muted mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> {subText}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-brand-success/5 border border-brand-success/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-brand-success">Live Sync Active</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            title="Refresh Data"
            className={cn(
              "p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all active:scale-90",
              isRefreshing && "animate-spin text-brand-primary bg-brand-primary/5"
            )}
          >
            <RefreshCcw className="w-5 h-5" />
          </button>

          <button className="relative text-brand-text-muted hover:text-brand-text-main transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-brand-surface"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-brand-border h-8">
          {profileStrength !== undefined && (
            <span className="bg-brand-primary-light text-brand-primary text-[11px] font-bold px-3 py-1 rounded-radius-badge whitespace-nowrap">
              {profileStrength}% Profile Strength
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0 cursor-pointer hover:border-brand-primary/30 transition-all">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <SearchIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
