import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

type UserRole = 'student' | 'admin';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'student' as UserRole,
      banned: false,
      createdAt: serverTimestamp()
    });
  }

  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check user role and banned status
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.banned) {
        await signOut(auth);
        throw new Error('Your account has been banned');
      }
      setUserRole(userData.role);
    }
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check user role and banned status
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.banned) {
              await signOut(auth);
              setCurrentUser(null);
              setUserRole(null);
            } else {
              setCurrentUser(user);
              setUserRole(userData.role as UserRole);
            }
          } else {
            // If user doc doesn't exist, create default user entry and continue
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'student' as UserRole,
              banned: false,
              createdAt: serverTimestamp()
            });

            setCurrentUser(user);
            setUserRole('student');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setCurrentUser(null);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'admin',
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}