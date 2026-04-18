import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Edit3, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  ArrowLeft,
  Phone,
  Briefcase,
  Sparkles,
  Github,
  Linkedin,
  Plus as PlusIcon
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Local state for editing
  const [formData, setFormData] = React.useState({
    displayName: '',
    title: '',
    location: '',
    phone: '',
    bio: '',
    skills: [] as string[],
    resumeUrl: '',
    portfolioUrl: ''
  });

  // Sync profile to form data when profile loads or resets
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        displayName: profile.displayName || '',
        title: profile.title || '',
        location: profile.location || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        resumeUrl: profile.resumeUrl || '',
        portfolioUrl: (profile as any).portfolioUrl || ''
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const skills = profile?.skills?.length ? profile.skills : ["Figma", "React", "TypeScript", "Tailwind CSS", "Motion", "User Research", "Adobe XD", "Design Systems", "Web Accessibility", "Prototyping"];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm font-bold text-brand-text-muted hover:text-brand-primary hover:border-brand-primary transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-brand-surface border border-brand-border rounded-radius-card overflow-hidden shadow-sm">
        <div className="h-40 bg-gradient-to-r from-brand-primary to-brand-accent opacity-90 relative">
          <button className="absolute bottom-4 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            <Edit3 className="w-4 h-4" /> Edit Cover
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex items-end justify-between">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-brand-surface bg-slate-200 shadow-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-16 h-16" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-brand-success rounded-full border-4 border-brand-surface flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="p-2.5 bg-brand-bg text-brand-text-muted border border-brand-border rounded-radius-item hover:text-brand-primary transition-colors">
                <Github className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-brand-bg text-brand-text-muted border border-brand-border rounded-radius-item hover:text-brand-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              {isEditing ? (
                <button 
                  onClick={handleSave}
                  className="bg-brand-success text-white px-6 py-2.5 rounded-radius-item font-bold hover:bg-brand-success/90 transition-all shadow-lg active:scale-95"
                >
                  Save Profile
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-primary text-white px-6 py-2.5 rounded-radius-item font-bold hover:bg-brand-primary/90 transition-all shadow-lg active:scale-95"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <div className="space-y-4 max-w-lg">
                <input 
                  className="text-2xl font-extrabold text-brand-text-main bg-brand-bg border border-brand-border rounded px-2 py-1 w-full"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Full Name"
                />
                <input 
                  className="text-brand-primary font-semibold bg-brand-bg border border-brand-border rounded px-2 py-1 w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Professional Title"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-brand-text-main">{profile?.displayName || user?.displayName}</h2>
                <p className="text-brand-primary font-semibold">{profile?.title || 'No Title Set'}</p>
              </>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 p-4 bg-brand-bg/50 rounded-radius-item border border-brand-border">
              <div className="flex items-center gap-2 text-[13px] text-brand-text-muted">
                <div className="w-7 h-7 rounded bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                {isEditing ? (
                  <input 
                    className="bg-transparent border-none outline-none w-full"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Location"
                  />
                ) : (
                  profile?.location || 'Location'
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-brand-text-muted">
                <div className="w-7 h-7 rounded bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                {profile?.email || user?.email}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-brand-text-muted">
                <div className="w-7 h-7 rounded bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                {isEditing ? (
                  <input 
                    className="bg-transparent border-none outline-none w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Phone"
                  />
                ) : (
                  profile?.phone || 'Phone'
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-brand-text-muted text-brand-primary hover:underline cursor-pointer">
                <div className="w-7 h-7 rounded bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                {isEditing ? (
                  <input 
                    className="bg-transparent border-none outline-none w-full text-brand-primary font-bold"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    placeholder="Portfolio URL"
                  />
                ) : (
                  formData.portfolioUrl || 'portfolio.design'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-text-main flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-brand-primary" /> Professional Background
            </h3>
            {isEditing ? (
              <textarea 
                className="w-full bg-brand-bg border border-brand-border rounded p-4 text-sm text-brand-text-muted outline-none focus:ring-1 focus:ring-brand-primary"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about your professional journey..."
              />
            ) : (
              <div className="space-y-4 text-sm text-brand-text-muted leading-relaxed">
                <p>
                  {profile?.bio || "I am a multidisciplinary designer and developer focused on crafting clean, accessible, and high-performing digital experiences. Bridge the gap between complex engineering requirements and user-centric visuals."}
                </p>
              </div>
            )}
          </section>

          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-text-main flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-brand-primary" /> Work History
            </h3>
            <div className="space-y-6">
              {[
                { role: profile?.role === 'seeker' ? 'Candidate' : 'Recruiter', company: 'TalentFlow Member', period: 'Since Join' },
              ].map((job, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-px bg-brand-border relative mt-2 mb-[-8px]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">{job.role}</h4>
                    <p className="text-[12px] text-brand-text-muted">{job.company} &bull; {job.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-text-main flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-accent" /> Expert Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-[12px] font-medium text-brand-text-main hover:border-brand-primary transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-text-main flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-brand-primary" /> Resume & Documents
            </h3>
            
            <div className="space-y-4">
              {profile?.resumeUrl || formData.resumeUrl ? (
                <div className="p-4 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-brand-text-main leading-tight">Resume_Final_2024.pdf</div>
                      <div className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">PDF &bull; 2.4 MB</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={profile?.resumeUrl || formData.resumeUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-lg transition-all"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                    {isEditing && (
                      <button 
                         onClick={() => setFormData({...formData, resumeUrl: ''})}
                         className="p-2 text-brand-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-brand-border rounded-radius-card bg-brand-bg/30">
                  <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-muted mb-4">
                    <PlusIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-brand-text-main mb-1">Upload your resume</h4>
                  <p className="text-[11px] text-brand-text-muted mb-6">PDF, DOCX up to 10MB</p>
                  
                  {isEditing ? (
                    <div className="w-full max-w-xs space-y-3">
                       <input 
                         type="text"
                         className="w-full p-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                         placeholder="Paste resume URL (Google Drive, Dropbox, etc.)"
                         value={formData.resumeUrl}
                         onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
                       />
                       <div className="text-[10px] text-center text-brand-text-muted">Or drag & drop here</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm hover:scale-105 transition-all"
                    >
                      Click to Browse
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="bg-brand-surface border border-brand-border rounded-radius-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-text-main flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-brand-primary" /> Education
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-brand-text-main">Design Systems Cert</h4>
                <p className="text-[12px] text-brand-text-muted">Stanford Online &bull; 2024</p>
              </div>
            </div>
          </section>

          <div className="bg-brand-primary/5 border border-dashed border-brand-primary/20 rounded-radius-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[12px] text-brand-text-muted italic leading-relaxed">
              "AI Match Recommendation: Users with complete bios see 2x more recruiter engagement."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
