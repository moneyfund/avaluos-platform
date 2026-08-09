import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured, error, signInGoogle } = useAuth();

  if (!configured) {
    return <main className='auth-shell'><section className='auth-card'>
      <ShieldCheck />
      <p className='auth-kicker'>Firebase pendiente de conectar</p>
      <h1>Avalúos Platform está listo para recibir las variables del Firebase independiente.</h1>
      <p>Agrega las variables <code>VITE_FIREBASE_*</code> del proyecto de Firebase al entorno local o a Vercel. No es necesario guardar credenciales privadas en GitHub.</p>
    </section></main>;
  }

  if (loading) {
    return <main className='auth-shell'><section className='auth-card'><div className='auth-loader' /><h1>Verificando sesión…</h1></section></main>;
  }

  if (!user) {
    return <main className='auth-shell'><section className='auth-card'>
      <ShieldCheck />
      <p className='auth-kicker'>Acceso profesional</p>
      <h1>Inicia sesión para utilizar Avalúos Platform</h1>
      <p>La autenticación se realiza con Google. Las organizaciones y permisos se conectarán a esta misma identidad.</p>
      <button type='button' className='auth-google-button' onClick={signInGoogle}><LogIn /> Continuar con Google</button>
      {error && <div className='terrain-error' role='alert'>{error}</div>}
    </section></main>;
  }

  return children;
}
