import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  MessageSquare, 
  UserCircle, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { role, logout, profile } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Job Search', icon: Search, href: '/jobs' },
    { name: 'Applications', icon: Briefcase, href: '/applications' },
    { name: 'Messages', icon: MessageSquare, href: '/messages' },
    { name: 'My Profile', icon: UserCircle, href: '/profile' },
  ];

  return (
    <aside className="w-60 bg-brand-surface border-r border-brand-border flex flex-col h-screen overflow-y-auto">
      <div className="p-6 pb-8">
        <div className="flex items-center gap-2 text-brand-primary font-extrabold text-xl">
          <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center italic">T</div>
          TalentFlow AI
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-r-4",
              isActive 
                ? "text-brand-primary bg-brand-primary-light border-brand-primary" 
                : "text-brand-text-muted border-transparent hover:text-brand-text-main hover:bg-brand-bg/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 px-6">
        <div className="bg-brand-bg rounded-radius-card p-3 text-[12px] border border-brand-border">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <strong className="text-brand-text-main uppercase tracking-wider">
              {role === 'seeker' ? 'Job Seeker' : 'Recruiter Account'}
            </strong>
          </div>
          <p className="text-brand-text-muted leading-tight">
            Account verified and linked to AI Matching Engine.
          </p>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-2 w-full mt-6 px-0 py-2 text-sm font-medium text-brand-text-muted hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
