import { useMemo, useState } from 'react';
import { ArrowRight, Building2, LogIn, RefreshCw, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useAuth } from './AuthContext';
import { isRootPlatformAdmin } from '../platform/platformAdminAccess';

function currentTarget() {
  if (typeof window === 'undefined') return { tenantId: '', search: '' };
  const params = new URLSearchParams(window.location.search);
  const raw = String(params.get('tenant') || '').trim().toLowerCase();
  const tenantId = /^[a-z0-9-]{2,80}$/.test(raw) ? raw : '';
  return { tenantId, search: window.location.search || '' };
}

export default function AccessLanding() {
  const { user, loading, configured, error, signInGoogle, signOutUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const target = useMemo(currentTarget, []);

  const enterWorkspace = () => {
    window.location.assign(`/avaluos${target.search}`);
  };

  const chooseAccount = async () => {
    setBusy(true);
    try {
      if (user) await signOutUser();
      await signInGoogle();
      // signInWithPopup completes only after Firebase has authenticated the
      // selected Google account. The workspace is loaded only after this
      // explicit user action, never from a persisted session automatically.
      window.location.assign(`/avaluos${target.search}`);
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return <main className='access-landing'>
      <section className='access-landing-card'>
        <div className='access-brand-mark'><ShieldCheck /></div>
        <p className='access-kicker'>CONFIGURACIÓN PENDIENTE</p>
        <h1>Avalúos Platform</h1>
        <p className='access-copy'>Firebase no está configurado en este entorno.</p>
      </section>
    </main>;
  }

  if (loading) {
    return <main className='access-landing'>
      <section className='access-landing-card access-loading-card'>
        <div className='access-spinner' />
        <p>Preparando acceso seguro…</p>
      </section>
    </main>;
  }

  return <main className='access-landing'>
    <div className='access-ambient access-ambient-one' />
    <div className='access-ambient access-ambient-two' />

    <section className='access-landing-card'>
      <header className='access-brand'>
        <div className='access-brand-mark'><ShieldCheck /></div>
        <div>
          <strong>Avalúos Platform</strong>
          <span>Professional Valuation Suite</span>
        </div>
      </header>

      <div className='access-intro'>
        <p className='access-kicker'>ACCESO SEGURO</p>
        <h1>Elige cómo quieres ingresar.</h1>
        <p className='access-copy'>La plataforma no cargará ninguna organización hasta que confirmes la cuenta que deseas utilizar.</p>
      </div>

      {target.tenantId && <div className='access-target'>
        <Building2 />
        <span>
          <small>Organización solicitada</small>
          <strong>{target.tenantId}</strong>
        </span>
      </div>}

      {user ? <div className='access-session-card'>
        <div className='access-user-row'>
          {user.photoURL
            ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' />
            : <div className='access-user-fallback'>{String(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</div>}
          <span>
            <small>Sesión actualmente guardada</small>
            <strong>{user.displayName || 'Cuenta de Google'}</strong>
            <em>{user.email || ''}</em>
          </span>
        </div>

        <button type='button' className='access-primary-button' onClick={enterWorkspace} disabled={busy}>
          Continuar con esta cuenta <ArrowRight />
        </button>
        <button type='button' className='access-secondary-button' onClick={chooseAccount} disabled={busy}>
          <RefreshCw /> {busy ? 'Abriendo Google…' : 'Cambiar cuenta de Google'}
        </button>
      </div> : <div className='access-session-card access-no-session'>
        <LogIn />
        <div>
          <strong>No hay una sesión seleccionada</strong>
          <p>Abre Google y elige la cuenta con la que deseas trabajar.</p>
        </div>
        <button type='button' className='access-primary-button' onClick={chooseAccount} disabled={busy}>
          <LogIn /> {busy ? 'Abriendo Google…' : 'Elegir cuenta de Google'}
        </button>
      </div>}

      {user && isRootPlatformAdmin(user) && <a className='access-admin-link' href='/platform-admin'>
        <SlidersHorizontal /> Ir a Administración Central
      </a>}

      {error && <div className='access-error' role='alert'>{error}</div>}

      <footer className='access-footer'>
        <span>Autenticación protegida por Firebase + Google</span>
        <span>Los accesos se validan por organización y licencia</span>
      </footer>
    </section>
  </main>;
}
