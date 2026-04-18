import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  MoreHorizontal,
  Mail,
  Search,
  Sparkles,
  Loader2,
  X,
  PlusCircle,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { PostJobModal } from '@/src/components/PostJobModal';

export function RecruiterDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Recruiter's Jobs
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, where('recruiterId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);
      setLoading(false);
    });

    // Fetch Applications for these jobs
    const appsRef = collection(db, 'applications');
    const appsQuery = query(appsRef, where('recruiterId', '==', user.uid), orderBy('appliedAt', 'desc'));
    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      const appsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(appsList);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [user]);

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error updating application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const interviewApps = applications.filter(a => a.status === 'interviewing');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
        <p className="font-bold uppercase tracking-widest text-xs">Initializing Recruiter Suite...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PostJobModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
      
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text-main flex items-center gap-2">
            Hiring Command <Sparkles className="w-5 h-5 text-brand-primary" />
          </h1>
          <p className="text-sm text-brand-text-muted">Welcome back, {profile?.displayName}. Here's your talent pipeline.</p>
        </div>
        <button 
          onClick={() => setShowPostModal(true)}
          className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <PlusCircle className="w-5 h-5" /> Post Job Opportunity
        </button>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm group hover:border-brand-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-brand-primary" />
            </div>
            <span className="text-brand-success text-[10px] font-black uppercase bg-brand-success/10 px-2 py-0.5 rounded tracking-tighter">Live</span>
          </div>
          <div className="text-3xl font-black text-brand-text-main">{jobs.length}</div>
          <div className="text-[11px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Active Job Listings</div>
        </div>
        
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm group hover:border-brand-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-accent" />
            </div>
            <span className="text-brand-accent text-[10px] font-black uppercase bg-brand-accent/10 px-2 py-0.5 rounded tracking-tighter">{pendingApps.length} New</span>
          </div>
          <div className="text-3xl font-black text-brand-text-main">{applications.length}</div>
          <div className="text-[11px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Total Candidates</div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm group hover:border-brand-success/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-success" />
            </div>
            <span className="text-brand-success text-[10px] font-black uppercase bg-brand-success/10 px-2 py-0.5 rounded tracking-tighter">Hiring</span>
          </div>
          <div className="text-3xl font-black text-brand-text-main">{interviewApps.length}</div>
          <div className="text-[11px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Shortlisted Interviews</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates Review Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-brand-surface border border-brand-border rounded-radius-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/30">
              <h3 className="font-black text-brand-text-main flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                Resume Processing Center
              </h3>
              <div className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-1 rounded font-black tracking-widest uppercase">
                {pendingApps.length} ACTION REQUIRED
              </div>
            </div>

            <div className="bg-brand-surface">
              {applications.length > 0 ? (
                <div className="divide-y divide-brand-border">
                  {applications.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-brand-bg/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-brand-bg border-2 border-brand-border flex items-center justify-center text-xl font-black text-brand-primary group-hover:border-brand-primary/30 transition-all">
                            {app.seekerName?.[0] || 'C'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-success border-2 border-brand-surface rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                            95
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-brand-text-main text-lg leading-none mb-1 group-hover:text-brand-primary transition-colors">
                            {app.seekerName}
                          </h4>
                          <p className="text-sm font-bold text-brand-text-muted">
                            Applying for <span className="text-brand-text-main underline decoration-brand-primary/30">{app.jobTitle}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter",
                              app.status === 'pending' ? "bg-amber-100 text-amber-600" :
                              app.status === 'interviewing' ? "bg-blue-100 text-blue-600" :
                              app.status === 'accepted' ? "bg-green-100 text-green-600" :
                              "bg-brand-bg text-brand-text-muted"
                            )}>
                              {app.status}
                            </span>
                            <span className="text-[10px] text-brand-text-muted flex items-center gap-1 font-bold">
                              <Clock className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(app.id, 'interviewing')}
                              disabled={updatingId === app.id}
                              className="flex-1 md:flex-auto bg-brand-success text-white px-5 py-2.5 rounded-lg text-xs font-black hover:bg-brand-success/90 transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                            >
                              {updatingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              Accept & Interview
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              disabled={updatingId === app.id}
                              className="flex-1 md:flex-auto border border-brand-border bg-brand-surface text-brand-text-muted px-5 py-2.5 rounded-lg text-xs font-black hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </>
                        ) : (
                          <button className="flex items-center gap-2 border border-brand-border text-brand-text-main px-6 py-2.5 rounded-lg text-xs font-black hover:bg-brand-bg transition-all active:scale-95">
                            <Eye className="w-4 h-4 text-brand-primary" />
                            Review Resume
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center px-12">
                  <div className="w-20 h-20 rounded-full bg-brand-bg flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-brand-border" />
                  </div>
                  <h4 className="text-lg font-black text-brand-text-main mb-2">No active applications</h4>
                  <p className="text-sm text-brand-text-muted max-w-xs mx-auto">When candidates apply to your job listings, their resumes will appear here for your review.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Active Listings & Insights */}
        <div className="space-y-6">
          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-brand-text-main flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-primary" />
                Active Roles
              </h3>
              <PlusCircle 
                className="w-5 h-5 text-brand-text-muted hover:text-brand-primary cursor-pointer transition-colors" 
                onClick={() => setShowPostModal(true)}
              />
            </div>

            <div className="space-y-3">
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <div key={job.id} className="p-4 rounded-xl border border-brand-border bg-brand-bg/20 hover:border-brand-primary/30 transition-all group">
                    <div className="font-black text-sm text-brand-text-main group-hover:text-brand-primary transition-colors">{job.title}</div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-[10px] text-brand-text-muted font-black uppercase tracking-widest">
                        <Users className="w-3" /> {applications.filter(a => a.jobId === job.id).length} Applicants
                      </div>
                      <button className="p-1 hover:bg-white rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-brand-text-muted" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-brand-border rounded-xl">
                  <p className="text-xs text-brand-text-muted font-bold">No active roles</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowPostModal(true)}
              className="w-full mt-6 py-3 border-2 border-brand-primary/20 bg-brand-primary/5 text-brand-primary rounded-xl text-xs font-black hover:bg-brand-primary/10 transition-all uppercase tracking-widest"
            >
              Post Another Role
            </button>
          </section>

          <section className="bg-brand-primary p-6 rounded-radius-card text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 mb-4 text-brand-primary-light" />
              <h4 className="font-black text-lg leading-tight mb-2">AI Talent Sourcing</h4>
              <p className="text-xs text-brand-primary-light font-medium leading-relaxed mb-6">
                Our AI recently identified 12 elite candidates matching your <span className="underline decoration-2">Senior Designer</span> role.
              </p>
              <button className="w-full py-2.5 bg-white text-brand-primary rounded-lg text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
                Invite to Apply
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
