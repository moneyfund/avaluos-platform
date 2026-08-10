import { useState } from 'react';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { isRootPlatformAdmin } from './platformAdminAccess';

export default function PlatformAdminGate({ children }: { children: React.ReactNode }) {
  const { user, signInGoogle, signOutUser, error } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (user && isRootPlatformAdmin(user)) return children;

  const switchToAdmin = async () => {
    setSwitching(true);
    try {
      // Firebase Auth persistence is independent from Firestore. If a client/test
      // account is still authenticated in this browser, explicitly clear that
      // session before opening Google's account selector for Platform Admin.
      if (user) {
        await signOutUser();
      }
      await signInGoogle();
    } finally {
      setSwitching(false);
    }
  };

  return <main className='platform-denied platform-admin-login-gate'>
    <div className='platform-admin-login-card'>
      <span className='platform-admin-login-icon'><ShieldAlert /></span>
      <p>ADMINISTRACIÓN CENTRAL</p>
      <h1>Accede con tu cuenta de Platform Admin.</h1>
      <small>
        {user
          ? <>La sesión activa es <strong>{user.email || 'otra cuenta de Google'}</strong>. Esa sesión se cerrará antes de abrir el acceso de administrador.</>
          : 'No hay una sesión de administrador activa en este navegador.'}
      </small>
      <button type='button' className='platform-admin-switch-account' onClick={switchToAdmin} disabled={switching}>
        <LogIn /> {switching ? 'Cambiando sesión…' : 'Cambiar a cuenta de administrador'}
      </button>
      <a href='/'>Volver al portal de Avalúos Platform</a>
      {error && <div className='platform-admin-login-error' role='alert'>{error}</div>}
    </div>
  </main>;
}
