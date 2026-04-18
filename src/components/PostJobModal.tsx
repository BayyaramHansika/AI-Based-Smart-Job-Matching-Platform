import React, { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, ListChecks, Plus, Loader2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: profile?.displayName || '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    tags: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        recruiterId: user.uid,
        company: formData.company || profile?.displayName || 'Unknown Company',
        createdAt: new Date().toISOString(),
        matchScore: 95 // Default mock match score for simplicity
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        company: profile?.displayName || '',
        location: '',
        salary: '',
        type: 'Full-time',
        description: '',
        tags: ''
      });
    } catch (err) {
      console.error("Error posting job:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-brand-surface w-full max-w-2xl rounded-radius-card border border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-black text-brand-text-main">Post New Opportunity</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
            <X className="w-5 h-5 text-brand-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Senior Designer"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Company</label>
              <input 
                type="text" 
                required
                placeholder="Company Name"
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Remote or NYC"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Salary Range</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. $120k - $150k"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Skills / Tags (comma separated)</label>
            <div className="relative">
              <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input 
                type="text" 
                placeholder="Figma, React, Design Systems"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-wider">Job Description</label>
            <textarea 
              required
              rows={4}
              placeholder="What are the key responsibilities and requirements?"
              className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-brand-border">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg font-bold border border-brand-border text-brand-text-main hover:bg-brand-bg transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-lg font-bold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
