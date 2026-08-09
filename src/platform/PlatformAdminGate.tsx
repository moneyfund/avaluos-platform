import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { isRootPlatformAdmin } from './platformAdminAccess';

export default function PlatformAdminGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Navigate to='/' replace />;
  if (!isRootPlatformAdmin(user)) {
    return <main className='platform-denied'>
      <div>
        <span><ShieldAlert /></span>
        <p>ACCESO RESTRINGIDO</p>
        <h1>Este espacio pertenece a la administración central.</h1>
        <small>Tu cuenta puede seguir utilizando los avalúos de su organización, pero no administrar la plataforma.</small>
        <a href='/avaluos/terrenos'>Volver a Avalúos Platform</a>
      </div>
    </main>;
  }

  return children;
}
