import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
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

    let active = true;
    let unsubscribe = () => undefined;

    const initializeSessionAuth = async () => {
      try {
        // Avalúos Platform necesita permitir varias cuentas simultáneas en el
        // mismo navegador: por ejemplo, Amy en una pestaña y Root Admin en otra.
        // `browserSessionPersistence` guarda la sesión en sessionStorage, por lo
        // que cada pestaña mantiene su propio usuario y los cambios de login no
        // sustituyen la cuenta autenticada en las demás pestañas.
        await setPersistence(auth, browserSessionPersistence);
        if (!active) return;

        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setLoading(false);
        }, (cause) => {
          console.error(cause);
          if (!active) return;
          setError('No fue posible verificar la sesión de Firebase.');
          setLoading(false);
        });
      } catch (cause) {
        console.error(cause);
        if (!active) return;
        setError('No fue posible preparar una sesión independiente para esta pestaña.');
        setLoading(false);
      }
    };

    void initializeSessionAuth();

    return () => {
      active = false;
      unsubscribe();
    };
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
        // Se reafirma la persistencia antes del popup para que incluso una
        // pestaña abierta durante una migración desde `local` permanezca aislada.
        await setPersistence(auth, browserSessionPersistence);
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
