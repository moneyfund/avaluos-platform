import { useState } from 'react';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { isRootPlatformAdmin } from './platformAdminAccess';

export default function PlatformAdminGate({ children }: { children: React.ReactNode }) {
  const { user, signInGoogle, error } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (user && isRootPlatformAdmin(user)) return children;

  const switchToAdmin = async () => {
    setSwitching(true);
    try {
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
          ? <>La sesión activa es <strong>{user.email || 'otra cuenta de Google'}</strong>. Esa cuenta puede usar sus avalúos, pero no administrar toda la plataforma.</>
          : 'No hay una sesión de administrador activa en este navegador.'}
      </small>
      <button type='button' className='platform-admin-switch-account' onClick={switchToAdmin} disabled={switching}>
        <LogIn /> {switching ? 'Abriendo Google…' : 'Cambiar a cuenta de administrador'}
      </button>
      <a href='/'>Volver al portal de Avalúos Platform</a>
      {error && <div className='platform-admin-login-error' role='alert'>{error}</div>}
    </div>
  </main>;
}
