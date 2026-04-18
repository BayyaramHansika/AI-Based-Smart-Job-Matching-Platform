import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, DollarSign, Sparkles, Loader2, SearchX, RefreshCcw } from 'lucide-react';
import { JobCard } from '@/src/components/JobCard';
import { cn } from '@/src/lib/utils';
import { collection, query, onSnapshot, orderBy, addDoc, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { JobListing } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';

export function JobSearch() {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Jobs
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setJobs(jobsList);
      setLoading(false);
    });

    // Fetch User's Applications to show "Applied" state
    let unsubscribeApps = () => {};
    if (user) {
      const appsRef = collection(db, 'applications');
      const appsQuery = query(appsRef, where('seekerId', '==', user.uid));
      unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
        setApplications(snapshot.docs.map(doc => doc.data()));
      });
    }

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [user]);

  const handleApply = async (job: any) => {
    if (!user || !profile) return;
    
    setApplyingId(job.id);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        recruiterId: job.recruiterId,
        seekerId: user.uid,
        seekerName: profile.displayName,
        jobTitle: job.title,
        companyName: job.company,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error applying for job:", err);
    } finally {
      setApplyingId(null);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    // Simulate search delay for better UX
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const exactMatches = jobs.filter(job => {
    const matchesSearch = 
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = 
      !locationSearch ||
      job.location?.toLowerCase().includes(locationSearch.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const suggestions = jobs
    .filter(job => !exactMatches.find(match => match.id === job.id))
    .sort((a, b) => {
      // Prioritize jobs that match the user's profile title if possible
      if (profile?.title) {
        const aMatch = a.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
        const bMatch = b.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
        return bMatch - aMatch;
      }
      return 0;
    })
    .slice(0, 6);

  const displayJobs = exactMatches.sort((a, b) => {
    // If there's a search term, bring more relevant titles to the top
    if (searchTerm) {
      const aTitleMatch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      const bTitleMatch = b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      return bTitleMatch - aTitleMatch;
    }
    
    // If no search, but we have a user profile, prioritize jobs matching their role/title
    if (profile?.title && !searchTerm && !locationSearch) {
      const aMatch = a.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
      const bMatch = b.title?.toLowerCase().includes(profile.title.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    }

    return 0; // Keep Firestore sort (createdAt desc)
  });

  const isApplied = (jobId: string) => applications.some(app => app.jobId === jobId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Search Bar */}
      <form 
        onSubmit={handleSearch}
        className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-radius-item focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-brand-text-muted/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="City, state, or remote..."
              className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-radius-item focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-brand-text-muted/60"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-brand-primary text-white px-8 py-3 rounded-radius-item font-black uppercase tracking-widest text-xs hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Jobs
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button 
            type="button"
            className="flex items-center gap-2 px-4 py-1.5 rounded-radius-tag border border-brand-border bg-brand-surface text-[11px] font-black uppercase tracking-wider text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="h-6 w-px bg-brand-border mx-1" />
          {['Full-time', 'Remote', 'Design', 'Engineering', '$100k+'].map(tag => (
            <button 
              key={tag} 
              type="button"
              onClick={() => {
                setSearchTerm(tag === '$100k+' ? searchTerm : tag);
                handleSearch();
              }}
              className={cn(
                "px-4 py-1.5 rounded-radius-tag border border-brand-border bg-brand-bg text-[11px] font-bold uppercase tracking-tight transition-all",
                searchTerm === tag ? "bg-brand-primary text-white border-brand-primary" : "text-brand-text-muted hover:border-brand-primary"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted bg-brand-surface rounded-radius-card border border-dashed border-brand-border shadow-inner">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
          <p className="font-black uppercase tracking-[0.2em] text-xs">Calibrating Matches...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Exact Matches or Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-brand-text-main flex items-center gap-2">
                {searchTerm || locationSearch ? (
                  exactMatches.length > 0 ? 'Search Results' : 'No Exact Matches'
                ) : (
                  <>Top Recommendations <Sparkles className="w-5 h-5 text-brand-accent fill-brand-accent/20" /></>
                )}
              </h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 500);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-3" /> Refresh
                </button>
                <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-tighter">
                  {`found ${exactMatches.length} results`}
                </p>
              </div>
            </div>

            {exactMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayJobs.map((job: any) => (
                  <JobCard 
                    key={job.id}
                    score={job.matchScore || Math.floor(Math.random() * 30) + 70}
                    title={job.title}
                    company={job.company || 'Unknown Company'}
                    location={job.location || 'Remote'}
                    salary={job.salary || 'Competitive'}
                    tags={job.tags || []}
                    highlightTags={job.tags?.slice(0, 2)}
                    isNew={new Date(job.createdAt).getTime() > Date.now() - 86400000}
                    showApplyButton={profile?.role === 'seeker'}
                    onApply={() => handleApply(job)}
                    isApplied={isApplied(job.id)}
                    isApplying={applyingId === job.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-brand-text-muted bg-brand-surface border border-dashed border-brand-border rounded-radius-card text-center px-6">
                <SearchX className="w-12 h-12 mb-4 opacity-20" />
                <h4 className="text-lg font-black text-brand-text-main mb-2">We couldn't find an exact match</h4>
                <p className="text-sm max-w-sm mb-0">Try different keywords or check out the suggestions below.</p>
              </div>
            )}
          </section>

          {/* Fallback / Discovery Section */}
          {suggestions.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-border"></div>
                <h3 className="text-xs font-black text-brand-text-muted uppercase tracking-[0.3em] px-4">
                  Discover More Opportunities
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-border"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((job: any) => (
                  <JobCard 
                    key={job.id}
                    score={job.matchScore || Math.floor(Math.random() * 20) + 60}
                    title={job.title}
                    company={job.company || 'Unknown Company'}
                    location={job.location || 'Remote'}
                    salary={job.salary || 'Competitive'}
                    tags={job.tags || []}
                    highlightTags={job.tags?.slice(0, 1)}
                    isNew={new Date(job.createdAt).getTime() > Date.now() - 86400000}
                    showApplyButton={profile?.role === 'seeker'}
                    onApply={() => handleApply(job)}
                    isApplied={isApplied(job.id)}
                    isApplying={applyingId === job.id}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
