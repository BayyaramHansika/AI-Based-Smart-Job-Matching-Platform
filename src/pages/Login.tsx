import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Sparkles, ShieldCheck, User, Briefcase, Loader2, Chrome } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('seeker');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Try cache first for speed, fallback to server if needed
      let userDoc = await getDoc(doc(db, 'users', user.uid)).catch(() => null);
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDocFromServer(doc(db, 'users', user.uid)).catch(() => null);
      }
      
      if (!userDoc || !userDoc.exists()) {
        // Create initial profile if first time
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileStrength: 20,
          skills: [],
          bio: '',
          title: role === 'seeker' ? 'Job Seeker' : 'Hiring Manager',
          location: ''
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      // Construct a better error message
      let msg = err.message || "Failed to sign in with Google";
      if (err.code === 'auth/popup-blocked') {
        msg = "The sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Network connection failed. Please check your internet connection.";
      }
      setError(msg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Success! Redirecting...");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateFirebaseProfile(user, { displayName: name });
        setSuccess("Account created! Finalizing profile...");

        // Save initial profile to Firestore in background (non-blocking)
        const profileData = {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileStrength: 20,
          skills: [],
          bio: '',
          title: role === 'seeker' ? 'Job Seeker' : 'Hiring Manager',
          location: ''
        };

        // Fire and forget - AuthContext will handle missing profile on next load
        setDoc(doc(db, 'users', user.uid), profileData).catch(err => 
          console.warn("Background profile creation delayed:", err.message)
        );
      }
      
      // Delay navigation slightly to let user see success message
      setTimeout(() => navigate('/'), 800);
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      let msg = err.message || "Authentication failed";
      
      if (err.code === 'auth/network-request-failed') {
        msg = "Network connection failed. This is often caused by tracking blockers or temporary connection issues. Please try refreshing or checking your connection.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password. Please check your credentials and try again.";
      }
      
      setError(msg);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-brand-surface rounded-radius-card overflow-hidden shadow-2xl flex flex-col md:flex-row border border-brand-border">
        {/* Left Side: Branding/Marketing */}
        <div className="md:w-1/2 bg-brand-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/30 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 font-black text-2xl italic mb-12">
              <div className="w-10 h-10 rounded-xl bg-white text-brand-primary flex items-center justify-center not-italic">T</div>
              TalentFlow AI
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight mb-6">
              The smartest way to find your <span className="text-brand-primary-light">next big role</span>.
            </h1>
            <p className="text-brand-primary-light/80 text-lg">
              Our AI analyzes your skills, experience, and market trends to find jobs where you'll actually thrive.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">98% accurate skill-to-job matching</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Verified recruiters from top companies</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-brand-text-main">
              {isLogin ? 'Welcome Back' : 'Join TalentFlow'}
            </h2>
            <p className="text-brand-text-muted mt-2 text-sm">
              {isLogin 
                ? 'Sign in to access your matches and applications.' 
                : 'Create an account to start your journey.'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[12px] rounded-lg font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-[12px] rounded-lg font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {success}
              </div>
            )}

            <div className="space-y-1.5 pb-2">
              <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">
                {isLogin ? 'Signing in as' : 'Join as'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 border rounded-lg text-sm font-bold transition-all",
                    role === 'seeker' 
                      ? "bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm" 
                      : "bg-brand-bg border-brand-border text-brand-text-muted hover:bg-brand-border/50"
                  )}
                >
                  <User className="w-4 h-4" /> Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 border rounded-lg text-sm font-bold transition-all",
                    role === 'recruiter' 
                      ? "bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm" 
                      : "bg-brand-bg border-brand-border text-brand-text-muted hover:bg-brand-border/50"
                  )}
                >
                  <Briefcase className="w-4 h-4" /> Recruiter
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-brand-text-muted/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-brand-text-muted/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-brand-text-muted uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button type="button" className="text-[11px] font-bold text-brand-primary hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-brand-text-muted/50"
                />
              </div>
            </div>

            <button 
              disabled={loading || googleLoading}
              className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-primary/90 transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
              )}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-surface px-4 text-brand-text-muted font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full bg-white text-brand-text-main py-3.5 rounded-lg font-bold border border-brand-border hover:bg-brand-bg hover:border-brand-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mb-2 shadow-sm active:scale-[0.98]"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <Chrome className="w-5 h-5 text-brand-primary" />
                <span>Sign in with Google</span>
              </div>
            )}
          </button>

          <div className="mt-8 text-center pt-8 border-t border-brand-bg">
            <p className="text-sm text-brand-text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-primary font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
