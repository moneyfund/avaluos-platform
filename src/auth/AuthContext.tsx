import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    }, (cause) => {
      console.error(cause);
      setError('No fue posible verificar la sesión de Firebase.');
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configured: isFirebaseConfigured,
    error,
    signInGoogle: async () => {
      setError('');
      if (!auth || !googleProvider) {
        setError('Firebase todavía no está configurado en este entorno.');
        return;
      }
      try {
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, googleProvider);
      } catch (cause: any) {
        if (cause?.code === 'auth/popup-closed-by-user') return;
        console.error(cause);
        setError('No fue posible iniciar sesión con Google.');
      }
    },
    signOutUser: async () => {
      setError('');
      if (auth) await signOut(auth);
    },
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return value;
}
