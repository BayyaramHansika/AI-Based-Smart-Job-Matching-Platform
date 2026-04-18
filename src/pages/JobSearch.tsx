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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      job.location?.toLowerCase().includes(locationSearch.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const isApplied = (jobId: string) => applications.some(app => app.jobId === jobId);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Search Bar */}
      <div className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
            <input 
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-radius-item focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
            <input 
              type="text"
              placeholder="City, state, or remote..."
              className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-radius-item focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>
          <button className="bg-brand-primary text-white px-8 py-3 rounded-radius-item font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2">
            Find Jobs
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-radius-tag border border-brand-border bg-brand-surface text-[13px] font-medium text-brand-text-muted hover:border-brand-primary transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="h-6 w-px bg-brand-border mx-1" />
          {['Full-time', 'Remote', 'Design', 'Engineering', '$100k+'].map(tag => (
            <button key={tag} className="px-4 py-1.5 rounded-radius-tag border border-brand-border bg-brand-bg text-[13px] font-medium text-brand-text-muted hover:border-brand-primary transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
          {searchTerm || locationSearch ? 'Search Results' : 'Recommended for you'} <Sparkles className="w-5 h-5 text-brand-accent fill-brand-accent/20" />
        </h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
            className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3" /> Refresh Results
          </button>
          <p className="text-sm text-brand-text-muted">
            {loading ? 'Searching...' : `Showing ${filteredJobs.length} matches`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted bg-brand-surface rounded-radius-card border border-dashed border-brand-border">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
          <p className="font-bold">Wait a second, fetching matches...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job: any) => (
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
        <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted bg-brand-surface rounded-radius-card border border-dashed border-brand-border text-center px-6">
          <SearchX className="w-12 h-12 mb-4 text-brand-text-muted/50" />
          <h4 className="text-lg font-bold text-brand-text-main mb-2">No jobs matched your criteria</h4>
          <p className="text-sm max-w-sm">Try adjusting your search terms or location filter to find more opportunities.</p>
        </div>
      )}
    </div>
  );
}
