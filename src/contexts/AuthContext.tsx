// src/contexts/AuthContext.tsx - FIXED VERSION
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkIsAdmin: (email: string) => Promise<boolean>;
  checkIsLawyer: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLawyer, setIsLawyer] = useState(false);

  // ✅ Check if user is admin (now a stable function)
  const checkIsAdmin = async (userEmail: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, 'adminUsers', userEmail));
      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const checkIsLawyer = async (userEmail: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'lawyers'), where('email', '==', userEmail), where('active', '==', true));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (error) {
      console.error('Error checking lawyer status:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Check roles
      if (user?.email) {
        const [adminStatus, lawyerStatus] = await Promise.all([
          checkIsAdmin(user.email),
          checkIsLawyer(user.email)
        ]);
        setIsAdmin(adminStatus);
        setIsLawyer(lawyerStatus);
      } else {
        setIsAdmin(false);
        setIsLawyer(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []); // ✅ No dependencies needed

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setIsLawyer(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    isLawyer,
    signIn,
    signUp,
    signOut,
    checkIsAdmin,
    checkIsLawyer,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};