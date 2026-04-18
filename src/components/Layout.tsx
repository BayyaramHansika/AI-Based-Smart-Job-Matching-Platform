import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { role, profile, user } = useAuth();
  
  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          userName={profile?.displayName || user?.displayName || 'User'} 
          userTitle={profile?.title || (role === 'seeker' ? "Product Designer" : "Recruiter")}
          subText={role === 'seeker' ? "AI has identified 12 new matches for your skills today." : "You have 5 new top-tier candidates for your open roles."}
          profileStrength={profile?.profileStrength}
        />
        
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
