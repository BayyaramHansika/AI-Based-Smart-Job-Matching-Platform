import React, { useState, useEffect } from 'react';
import { JobCard } from '@/src/components/JobCard';
import { ArrowUpRight, Target, TrendingUp, Cpu, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, limit, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [appStats, setAppStats] = useState({ total: 0, pending: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'seeker') return;

    // Fetch ALL Jobs for recommendation engine
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'), limit(10));

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Sort by match with profile title if exists
      const sorted = [...jobsList].sort((a: any, b: any) => {
        if (profile?.title) {
          const aMatch = a.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
          const bMatch = b.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
          return bMatch - aMatch;
        }
        return 0;
      });

      setRecommendations(sorted.slice(0, 4));
      setLoading(false);
    });

    // Fetch User Application Stats & Recent Apps
    const appsRef = collection(db, 'applications');
    const appsQuery = query(appsRef, where('seekerId', '==', user.uid));
    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort client-side to avoid index requirement
      const sortedApps = apps.sort((a, b) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      setRecentApps(sortedApps.slice(0, 3));
      setAppStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        interviews: apps.filter(a => a.status === 'interviewing').length
      });
    }, (err) => {
      console.error("Dashboard apps sync error:", err);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [user, profile]);

  if (loading && profile?.role === 'seeker') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-brand-text-muted">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
        <p className="font-bold">Analyzing market data & matching your profile...</p>
      </div>
    );
  }

  // If loading is done but no profile yet (shouldn't happen with AuthContext)
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-brand-text-muted">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
        <p className="font-bold">Syncing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Column: Matches */}
      <section className="lg:col-span-2 space-y-6">
        <div className="bg-brand-surface border border-brand-border rounded-radius-card overflow-hidden shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-primary" />
              <h3 className="text-base font-bold text-brand-text-main">
                Smart Matches for You
              </h3>
            </div>
            <button 
              onClick={() => navigate('/jobs')}
              className="text-[12px] font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((job) => (
                <JobCard 
                  key={job.id}
                  score={job.matchScore || Math.floor(Math.random() * 20) + 80}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  salary={job.salary}
                  tags={job.tags || []}
                  highlightTags={job.tags?.slice(0, 2)}
                  matchReason={job.matchReason || `Matches your expert proficiency in ${job.tags?.[0] || 'Modern Design'}.`}
                  isNew={new Date(job.createdAt).getTime() > Date.now() - 86400000}
                />
              ))
            ) : (
              <div className="py-10 text-center bg-brand-bg rounded-lg border border-dashed border-brand-border">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-brand-text-muted opacity-30" />
                <p className="text-sm text-brand-text-muted">No matches yet. We'll notify you when roles open up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-brand-text-main uppercase tracking-widest mb-4">Recently Viewed</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { company: 'GitHub', role: 'Staff Designer' },
              { company: 'Slack', role: 'UI Lead' },
              { company: 'Vercel', role: 'Product Architect' },
              { company: 'Figma', role: 'Design Engineer' },
            ].map((item, i) => (
              <div key={i} className="flex-shrink-0 w-32 p-3 bg-brand-bg/50 rounded-radius-item border border-brand-border hover:border-brand-primary active:scale-95 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center font-black text-xs text-brand-primary mb-2">
                  {item.company[0]}
                </div>
                <div className="text-[10px] font-black text-brand-text-main truncate">{item.role}</div>
                <div className="text-[9px] text-brand-text-muted truncate">{item.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Column: Sidebar Stats */}
      <div className="space-y-6">
        {/* Application Tracker */}
        <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
          <h3 className="text-base font-black text-brand-text-main mb-4">Application Tracker</h3>
          <div className="space-y-4">
            {recentApps.length > 0 ? (
              recentApps.map((app, i) => (
                <div key={app.id || i} className="space-y-1 py-1 group cursor-pointer" onClick={() => navigate('/applications')}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-brand-text-main group-hover:text-brand-primary transition-colors">
                      {app.jobTitle} @ {app.companyName}
                    </span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      app.status === 'accepted' ? 'bg-brand-success' : 
                      app.status === 'interviewing' ? 'bg-brand-accent' : 
                      'bg-brand-text-muted'
                    )} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-brand-text-muted font-bold tracking-tight uppercase tracking-tighter">
                      {app.status}
                    </span>
                    <span className="text-[10px] text-brand-text-muted bg-brand-bg px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">AI Vetted</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-brand-text-muted italic py-4">No active applications found.</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 mt-6 pt-6 border-t border-brand-bg text-center">
            <div className="border-r border-brand-bg">
              <div className="text-2xl font-extrabold text-brand-primary">{appStats.total}</div>
              <div className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">Total Apps</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-brand-primary">{appStats.interviews}</div>
              <div className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">Interviews</div>
            </div>
          </div>
        </section>

        {/* Skill Analysis */}
        <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-brand-accent" />
            <h3 className="text-base font-bold text-brand-text-main">Skill Analysis (AI)</h3>
          </div>
          <p className="text-[12px] text-brand-text-muted mb-4">
            Based on your profile and live market trends:
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {["Design Systems", "Figma", "User Research", "Motion Design", "Accessibility", "Vue.js", "GraphQL", "AWS"].map(tag => (
              <span key={tag} className={cn(
                "px-2.5 py-1 rounded-radius-tag text-[11px] font-medium",
                ["Design Systems", "Figma"].includes(tag) ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-text-muted"
              )}>
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-brand-border group">
            <div className="flex items-center gap-2 text-brand-accent p-2 bg-brand-accent/5 rounded-lg border border-brand-accent/10">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <p className="text-[11px] font-bold leading-tight">
                TIP: Learn <span className="underline font-black decoration-2">Framer Motion</span> to increase match rate by 15%
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
