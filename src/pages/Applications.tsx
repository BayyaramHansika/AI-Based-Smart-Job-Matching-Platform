import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle2, XCircle, MoreVertical, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const appsRef = collection(db, 'applications');
    const q = query(
      appsRef, 
      where('seekerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(appsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching seeker applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'interviewing': return "bg-brand-accent/10 text-brand-accent border-brand-accent/20";
      case 'reviewing': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'pending': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'applied': return "bg-brand-bg text-brand-text-muted border-brand-border";
      case 'offered': 
      case 'accepted': return "bg-brand-success/10 text-brand-success border-brand-success/20";
      case 'rejected': return "bg-red-50 text-red-600 border-red-100";
      case 'cancelled': return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-brand-bg text-brand-text-muted border-brand-border";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-brand-text-main">Your Applications</h2>
          <p className="text-sm text-brand-text-muted">Track the status of your applications in real-time.</p>
        </div>
        <div className="flex bg-brand-bg p-1 rounded-lg border border-brand-border">
          <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-brand-surface border border-brand-border shadow-sm">All</button>
          <button className="px-4 py-1.5 text-xs font-bold text-brand-text-muted hover:text-brand-text-main transition-colors">Active</button>
          <button className="px-4 py-1.5 text-xs font-bold text-brand-text-muted hover:text-brand-text-main transition-colors">Archived</button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-radius-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-border">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Role & Company</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Applied On</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-brand-text-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-primary" />
                    <p className="text-sm font-bold text-brand-text-muted">Loading your applications...</p>
                  </td>
                </tr>
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center border border-brand-border text-brand-primary">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-text-main group-hover:text-brand-primary transition-colors cursor-pointer">{app.jobTitle}</div>
                          <div className="text-xs text-brand-text-muted">{app.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border",
                        getStatusStyle(app.status)
                      )}>
                        {app.status === 'interviewing' && <Clock className="w-3 h-3" />}
                        {(app.status === 'offered' || app.status === 'accepted') && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-text-muted font-medium">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-lg transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-brand-text-muted hover:text-brand-text-main rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <h4 className="text-lg font-bold text-brand-text-main mb-1">No applications found</h4>
                    <p className="text-sm text-brand-text-muted">Explore jobs and apply to see them here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-brand-primary-light/30 border border-brand-primary/10 rounded-radius-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-brand-text-main">Application Insight</h4>
          <p className="text-[13px] text-brand-text-muted">You've reached the final round for <span className="text-brand-primary font-bold">Stripe</span>. Practice your system design skills to boost completion chance.</p>
        </div>
        <button className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm hover:translate-y-[-1px] transition-all">
          View Detail
        </button>
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
