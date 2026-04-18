import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('seeker');

  useEffect(() => {
    // Safety timeout to avoid infinite loading screens
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 4000); // Reduced delay for faster transition

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Optimistically set loading to false to show the shell while profile loads
        setLoading(false);
        
        try {
          // Try local cache first for instant load
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
          } else {
            // Fallback to server only if cache empty
            const serverDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
            if (serverDoc.exists()) {
              const data = serverDoc.data() as UserProfile;
              setProfile(data);
              setRole(data.role);
            }
          }
        } catch (err: any) {
          console.warn("Background profile fetch issue:", err.message);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = { ...profile, ...data } as UserProfile;
    await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      role, 
      setRole,
      logout,
      updateProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
