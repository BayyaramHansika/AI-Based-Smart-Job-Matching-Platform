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
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    if (!user) return;

    // Fetch Recruiter's Jobs
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, where('recruiterId', '==', user.uid));

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
    const appsQuery = query(appsRef, where('recruiterId', '==', user.uid));
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

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        recruiterId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postedAt: new Date().toISOString()
      });
      
      setShowPostModal(false);
      setFormData({ title: '', company: '', location: '', salary: '', description: '', tags: '' });
    } catch (err) {
      console.error("Error posting job:", err);
    } finally {
      setIsPosting(false);
    }
  };

  const candidates = [
    { name: 'Sarah Chen', role: 'Full Stack Engineer', match: 98, status: 'Shortlisted', avatar: null },
    { name: 'Marcus Miller', role: 'UI Designer', match: 94, status: 'Interviewing', avatar: null },
    { name: 'Elena Rodriguez', role: 'Product Manager', match: 91, status: 'New', avatar: null },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Recruiter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-brand-primary" />
            <span className="text-brand-success text-xs font-bold">+ {jobs.length} total</span>
          </div>
          <div className="text-2xl font-black text-brand-text-main">{jobs.length}</div>
          <div className="text-[12px] text-brand-text-muted font-bold uppercase tracking-wider">Active Job Posts</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-brand-accent" />
            <span className="text-brand-success text-xs font-bold">{applications.length} latest</span>
          </div>
          <div className="text-2xl font-black text-brand-text-main">{applications.length}</div>
          <div className="text-[12px] text-brand-text-muted font-bold uppercase tracking-wider">Total Candidates</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-brand-success" />
            <span className="text-brand-success text-xs font-bold">Live</span>
          </div>
          <div className="text-2xl font-black text-brand-text-main">
            {jobs.length > 0 ? Math.round((applications.length / jobs.length) * 10) / 10 : 0}
          </div>
          <div className="text-[12px] text-brand-text-muted font-bold uppercase tracking-wider">Avg Apps / Role</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Roles */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-radius-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-brand-text-main">Active Hiring Roles</h3>
              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 500);
                }}
                className="p-1.5 text-brand-text-muted hover:text-brand-primary transition-colors"
                title="Refresh Roles"
              >
                <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
            </div>
            <button 
              onClick={() => setShowPostModal(true)}
              className="bg-brand-primary text-white p-2 rounded-lg hover:scale-105 transition-all shadow-md flex items-center gap-2 px-4 text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-brand-text-muted">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm font-bold">Loading your listings...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-6 border-b border-brand-bg last:border-0 hover:bg-brand-bg/20 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold">
                      {job.title?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-text-main group-hover:text-brand-primary transition-colors">{job.title}</h4>
                      <p className="text-[11px] text-brand-text-muted">{job.company} &bull; {job.location} &bull; Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-7 h-7 rounded-full border-2 border-brand-surface bg-slate-200" />
                      ))}
                    </div>
                    <button className="p-2 text-brand-text-muted hover:text-brand-text-main">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted text-center px-6">
                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                <h4 className="text-lg font-bold text-brand-text-main mb-2">You haven't posted any jobs yet</h4>
                <p className="text-sm max-w-xs mb-6">Create your first listing to start receiving AI-matched applications.</p>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="bg-brand-primary/10 text-brand-primary px-6 py-2 rounded-lg font-bold hover:bg-brand-primary/20 transition-all border border-brand-primary/20"
                >
                  Post your first job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Job Modal */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text-main/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-surface w-full max-w-2xl rounded-radius-card shadow-2xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-text-main">Post a Job Listing</h3>
                    <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider">Reach the best talent instantly</p>
                  </div>
                </div>
                <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-brand-border rounded-lg transition-colors">
                  <X className="w-5 h-5 text-brand-text-muted" />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Job Title</label>
                    <input 
                      required
                      className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Company Name</label>
                    <input 
                      required
                      className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="e.g. Acme Corp"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Location</label>
                    <input 
                      required
                      className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="e.g. Remote, San Francisco"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Salary Range</label>
                    <input 
                      className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="e.g. $120k - $160k"
                      value={formData.salary}
                      onChange={e => setFormData({...formData, salary: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Tags / Skills (comma separated)</label>
                  <input 
                    className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    placeholder="React, TypeScript, Figma"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Description</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 py-3 border border-brand-border rounded-lg font-bold hover:bg-brand-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isPosting}
                    type="submit"
                    className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                    {isPosting ? 'Posting...' : 'Post Job Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recent Applications Tracking */}
        <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-text-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent fill-brand-accent/20" />
              Recent Applications
            </h3>
            <button 
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
              className="p-1 hover:bg-brand-bg rounded transition-colors text-brand-text-muted"
            >
              <RefreshCcw className={cn("w-3 h-3", loading && "animate-spin")} />
            </button>
          </div>
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.slice(0, 5).map((app, i) => (
                <div key={app.id || i} className="p-4 rounded-radius-item border border-brand-border hover:border-brand-primary/30 transition-all cursor-pointer bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary font-bold text-xs">
                        {app.seekerName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-text-main">{app.seekerName}</div>
                        <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-tight">{app.jobTitle}</div>
                      </div>
                    </div>
                    <div className="text-brand-success text-xs font-black">95%</div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-bg">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      app.status === 'pending' ? "bg-amber-100 text-amber-600" :
                      app.status === 'accepted' ? "bg-green-100 text-green-600" :
                      "bg-brand-bg text-brand-text-muted"
                    )}>
                      {app.status}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-md hover:bg-brand-bg text-brand-text-muted"><Mail className="w-3 h-3" /></button>
                      <button className="p-1.5 rounded-md hover:bg-brand-bg text-brand-text-muted"><Search className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-brand-text-muted font-medium bg-brand-bg/50 rounded-lg border border-dashed border-brand-border px-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No applications yet for your active roles.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
